import React, { FormEvent, useContext, useState, useEffect } from 'react';
import { Button, Form, Segment, Grid } from 'semantic-ui-react';
import { v4 as uuid } from 'uuid';
import { IActivity } from '../../../models/activity';
import ActivityStore from '../../../stores/activities.store';
import { observer } from 'mobx-react-lite';
import { RouteComponentProps } from 'react-router-dom';
import { Form as FinalForm, Field } from 'react-final-form';

interface DetailParams {
  id: string;
}

const ActivityForm: React.FC<RouteComponentProps<DetailParams>> = ({
  match,
  history,
}) => {
  const activityStore = useContext(ActivityStore);
  const {
    createActivity,
    editActivity,
    submitting,
    activity: initialFormActivity,
    loadActivity,
    clearActivity,
  } = activityStore;

  const [activity, setActivity] = useState<IActivity>({
    id: '',
    title: '',
    category: '',
    description: '',
    date: '',
    city: '',
    venue: '',
  });

  useEffect(() => {
    // check the ID is supplied (page navigation) and that the currently state activity id is empty
    // so as not to load it twice when submitting an edit
    if (match.params.id && activity.id.length === 0) {
      loadActivity(match.params.id).then(
        () => initialFormActivity && setActivity(initialFormActivity)
      );
    }
    return () => {
      clearActivity();
    };
  }, [
    loadActivity,
    clearActivity,
    match.params.id,
    initialFormActivity,
    activity.id.length,
  ]);

  // const handleSubmit = () => {
  //   if (activity.id.length === 0) {
  //     let newActivity = {
  //       ...activity,
  //       id: uuid(),
  //     };
  //     createActivity(newActivity).then(() =>
  //       history.push(`/activities/${newActivity.id}`)
  //     );
  //   } else {
  //     editActivity(activity).then(() =>
  //       history.push(`/activities/${activity.id}`)
  //     );
  //   }
  // };

  // input can also send FormEvents instead of change events. Cause the text area only sends form events we'll just
  // use the form event. instead of event.target, a form event is event.currentTarget
  const handleInputChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.currentTarget;
    setActivity({ ...activity, [name]: value });
  };

  const handleFinalFormSubmit = (values: any) => {
    console.log(values);
  };

  return (
    <Grid>
      <Grid.Column width={10}>
        <Segment clearing>
          <FinalForm
            onSubmit={handleFinalFormSubmit}
            render={({ handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <Field
                  placeholder="Title"
                  value={activity.title}
                  name="title"
                  component='input'
                />
                <Form.TextArea
                  rows={2}
                  placeholder="Description"
                  value={activity.description}
                  name="description"
                  onChange={handleInputChange}
                />
                <Form.Input
                  placeholder="Category"
                  value={activity.category}
                  name="category"
                  onChange={handleInputChange}
                />
                <Form.Input
                  type="datetime-local"
                  placeholder="Date"
                  value={activity.date}
                  name="date"
                  onChange={handleInputChange}
                />
                <Form.Input
                  placeholder="City"
                  value={activity.city}
                  name="city"
                  onChange={handleInputChange}
                />
                <Form.Input
                  placeholder="Venue"
                  value={activity.venue}
                  name="venue"
                  onChange={handleInputChange}
                />
                <Button
                  floated="right"
                  positive
                  type="submit"
                  content="Submit"
                  loading={submitting}
                />
                <Button
                  onClick={() => history.push('/activities')}
                  floated="right"
                  type="button"
                  content="Cancel"
                />
              </Form>
            )}
          />
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityForm);
