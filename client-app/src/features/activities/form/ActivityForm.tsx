import React, { FormEvent, useContext, useState } from 'react';
import { Button, Form, Segment } from 'semantic-ui-react';
import { v4 as uuid } from 'uuid';
import { IActivity } from '../../../app/models/activity';
import ActivityStore from '../../../app/stores/activities.store';
import { observer } from 'mobx-react-lite';

interface IProps {
  activity: IActivity | undefined;
}

const ActivityForm: React.FC<IProps> = ({
  activity: initialFormActivity,
}) => {

  const activityStore = useContext(ActivityStore);
  const {createActivity, editActivity, submitting, cancelFormOpen} = activityStore;

  const initializeForm = () => {
    if (initialFormActivity) {
      return initialFormActivity;
    }

    return {
      id: '',
      title: '',
      category: '',
      description: '',
      date: '',
      city: '',
      venue: ''
    };
  };

  const [activity, setActivity] = useState<IActivity>(initializeForm);

  const handleSubmit = () => {
    if(activity.id.length === 0) {
      let newActivity = {
        ...activity,
        id: uuid()
      };
      createActivity(newActivity);
    } else {
      editActivity(activity);
    }
  }

  // input can also send FormEvents instead of change events. Cause the text area only sends form events we'll just
  // use the form event. instead of event.target, a form event is event.currentTarget
  const handleInputChange = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.currentTarget;
    setActivity({ ...activity, [name]: value });
  };

  return (
    <Segment clearing>
      <Form onSubmit={handleSubmit}>
        <Form.Input
          placeholder="Title"
          value={activity.title}
          name="title"
          onChange={handleInputChange}
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
          onClick={cancelFormOpen}
          floated="right"
          type="button"
          content="Cancel"
        />
      </Form>
    </Segment>
  );
};

export default observer(ActivityForm);
