import { IActivity } from './../models/activity';
import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import agent from '../api/agent';

configure({enforceActions: "always"});

class ActivityStore {
  @observable activityRegistry = new Map();
  @observable activity: IActivity | null = null;
  @observable loadingInitial = false;
  @observable submitting = false;
  @observable target = ''; // determine which button has loading

  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
  }

  groupActivitiesByDate(activities: IActivity[]) {
    const sortedActivity = activities.sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    );
    return Object.entries(sortedActivity.reduce((activities, activity) => {
      const date = activity.date.split('T')[0]; // want date, no time
      activities[date] = activities[date] ? [...activities[date], activity] : [activity];
      return activities;
    }, {} as {[key: string]: IActivity[]}));
  }

  @action loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();
      /*
        Actions apply to the current function. Everything that happens after await is technically another function because its the equivalient of
        .then(() => {...}), just the syntax is nicer to work with. In mobx strict mode everything that modifies an observable needs to be done in
        an action, so thus the need for anything modifying an observable after the await needs to be in an action. The runInAction allow us to make
        an inline action to solve this problem.
      */
      runInAction('loading activities', () => {
        activities.forEach(i => {
          i.date = i.date.split('.')[0];
          this.activityRegistry.set(i.id, i);
        });
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
    let activity = this.getActivity(id);
    if(activity) {
      this.activity = activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('getting activity', () => {
          this.activity = activity;          
        });
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
      runInAction('creating activity', () => {
        this.activityRegistry.set(activity.id, activity);
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('create activity finally', () => {
        this.submitting = false;
      });
    }
  };

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction('editing activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('edit activity finally', () => {
        this.submitting = false;
      });
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
}

export default createContext(new ActivityStore());