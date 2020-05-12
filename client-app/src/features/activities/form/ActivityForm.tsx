import React, { useState, FormEvent } from 'react';
import { Segment, Form, Button } from 'semantic-ui-react';
import { IActivity } from '../../../app/models/activity';
import { v4 as uuid } from 'uuid';

interface IProps {
  setEditMode: (val: boolean) => void;
  activity: IActivity | null;
  createActivity: (activity: IActivity) => void;
  editActivity: (activity: IActivity) => void;
  submitting: boolean;
}

const ActivityForm: React.FC<IProps> = ({
  setEditMode,
  activity: initialFormActivity,
  createActivity,
  editActivity,
  submitting,
}) => {
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
      let newActivity  = {
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
          onClick={setEditMode.bind(null, false)}
          floated="right"
          type="button"
          content="Cancel"
        />
      </Form>
    </Segment>
  );
};

export default ActivityForm;
