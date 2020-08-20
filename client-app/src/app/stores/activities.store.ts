import { IActivity } from './../models/activity';
import { observable, action, computed, runInAction, reaction, toJS } from 'mobx';
import { SyntheticEvent } from 'react';
import agent from '../api/agent';
import { history } from '../..';
import { toast } from 'react-toastify';
import { RootStore } from './root.store';
import { setActivityProps, createAttendee } from '../common/Util/util';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

const LIMIT = 2;

export default class ActivityStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    reaction(
      () => this.predicate.keys(),
      () => {
        this.page = 0;
        this.activityRegistry.clear();
        this.loadActivities();
      }
    )
  }

  @observable activityRegistry = new Map();
  @observable activity: IActivity | null = null;
  @observable loadingInitial = false;
  @observable submitting = false;
  @observable target = ''; // determine which button has loading
  @observable loading = false;
  // observe reference to an object, not every property of the object
  @observable.ref hubConnection: HubConnection | null = null;
  @observable activityCount = 0;
  @observable page = 0;
  @observable predicate = new Map();

  @computed get axiosParams() {
    const params = new URLSearchParams();
    params.append('limit', String(LIMIT));
    params.append('offset', `${this.page ? this.page * LIMIT : 0}`)
    this.predicate.forEach((value, key) => {
      if (key === 'startDate') {
        params.append(key, value.toISOString());
      } else {
        params.append(key, value);
      }
    });
    return params;
  }

  @computed get totalPages() {
    return Math.ceil(this.activityCount / LIMIT);
  }

  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
  }

  groupActivitiesByDate(activities: IActivity[]) {
    const sortedActivity = activities.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    return Object.entries(sortedActivity.reduce((activities, activity) => {
      const date = activity.date.toISOString().split('T')[0]; // want date, no time
      activities[date] = activities[date] ? [...activities[date], activity] : [activity];
      return activities;
    }, {} as {[key: string]: IActivity[]}));
  }

  @action loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const activitiesEnvelope = await agent.Activities.list(this.axiosParams);
      const {activities, activityCount} = activitiesEnvelope;
      /*
        Actions apply to the current function. Everything that happens after await is technically another function because its the equivalient of
        .then(() => {...}), just the syntax is nicer to work with. In mobx strict mode everything that modifies an observable needs to be done in
        an action, so thus the need for anything modifying an observable after the await needs to be in an action. The runInAction allow us to make
        an inline action to solve this problem.
      */
      runInAction('loading activities', () => {
        activities.forEach(activity => {
          setActivityProps(activity, this.rootStore.userStore.user!);
          this.activityRegistry.set(activity.id, activity);
        });
        this.activityCount = activityCount;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('load activities finally', () => {
        this.loadingInitial = false
      });
    }
  };

  @action loadActivity = async (id: string) => {
    let activity = this.getActivity(id); // this will return the activity from the store, but it will be an observable
    if(activity) {
      this.activity = activity;
      return toJS(activity); // passing it to the form needs observable to be changed to JS cause its altered for the form
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('getting activity', () => {
          setActivityProps(activity, this.rootStore.userStore.user!);
          this.activity = activity;
          this.activityRegistry.set(activity.id, activity);     
        });
        return activity;
      } catch (error) {
        console.log(error)
      } finally {
        runInAction('load activity finally', () => {
          this.loadingInitial = false
        });
      }
    }
  };

  @action clearActivity = () => {
    this.activity = null;
  };

  getActivity = (id: string) => this.activityRegistry.get(id);

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      const attendee = createAttendee(this.rootStore.userStore.user!);
      attendee.isHost = true;
      activity.attendees = [attendee];
      activity.comments = [];
      activity.isHost = true;
      runInAction('creating activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`)
    } catch (error) {
      runInAction('create activity finally', () => {
        this.submitting = false;
      });
      toast.error('Problem submitting data');
      console.log(error.response);
    }
  };

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction('editing activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`)
    } catch (error) {
      runInAction('edit activity finally', () => {
        this.submitting = false;
      });
      toast.error('Problem submitting data');
      console.log(error.response);
    }
  };

  @action deleteActivity = async (id: string, event: SyntheticEvent<HTMLButtonElement>) => {
    this.submitting = true;
    this.target = event.currentTarget.name;
    try {
      await agent.Activities.delete(id);
      runInAction('deleting activity', () => {
        this.activityRegistry.delete(id);
        this.target = '';
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('delete activity finally', () => {
        this.submitting = false;
      })
    }
  };

  @action attendActivity = async () => {
    const attendee = createAttendee(this.rootStore.userStore.user!);
    this.loading = true;
    try {
      await agent.Activities.attend(this.activity!.id);
      runInAction(() => {
        if (this.activity) {
          this.activity.attendees.push(attendee);
          this.activity.isGoing = true;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.loading = false;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
      toast.error('Problem signing up to activity');
    }
  }

  @action cancelAttendance = async () => {
    this.loading = true;
    try {
      await agent.Activities.unattend(this.activity!.id);
      runInAction(() => {
        if(this.activity) {
          this.activity.attendees = this.activity.attendees.filter(i => i.username !== this.rootStore.userStore.user!.username);
          this.activity.isGoing = false;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.loading = false;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
      toast.error('Problem cancelling attendance.');
    }
  }

  @action createHubConnection = (activityId: string) => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5000/chat', {
        accessTokenFactory: () => this.rootStore.commonStore.token!
      })
      .configureLogging(LogLevel.Information)
      .build();
      // normally we send up our token in an http header, but were using a different protocol for 
      // the hub so we are sending our token up as a query string
      this.hubConnection
        .start()
        .then(() => console.log(this.hubConnection!.state))
        .then(() => {
          console.log('Attempting to join group');
          if(this.hubConnection!.state === 'Connected') {
            // invoke param must match method name in api
            this.hubConnection!.invoke('AddToGroup', activityId)
          }
        })
        .catch(error => console.log('Error establishing connection to Hub: ', error));

      // name of the on action must match what is send from our hub in our api
      this.hubConnection.on('ReceiveComment', comment => {
        runInAction(() => {
          this.activity!.comments.push(comment);
        });
      })

      // toast message to let user know someone joined/left the page/chat
      // this.hubConnection.on('Send', message => {
      //   toast.info(message);
      // })
  }

  @action stopHubConnection = () => {
    this.hubConnection!.invoke('RemoveFromGroup', this.activity!.id)
      .then(() => {
        // have to stop the connection when leaving an activity detail
        this.hubConnection!.stop();
      })
      .then(() => console.log('Connection has stopped.'))
      .catch(err => console.log(err))
  }

  @action addComment = async (values: any) => {
    // structure of values must match what the comment handler is expection in the request object
    values.activityId = this.activity!.id;
    try {
      // sendComment needs to match exactly what is inside our chathub
      // because we are directly invoking the method name in our client
      await this.hubConnection!.invoke('SendComment', values);
    } catch (error) {
      console.log(error);
    }
  }

  @action setPage = (page: number) => {
    this.page = page;
  }

  @action setPredicate = (predicate: string, value: string | Date) => {
    this.predicate.clear();
    if (predicate !== 'all') {
      this.predicate.set(predicate, value);
    }
  }

}
