import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { RouteComponentProps } from 'react-router-dom';
import { combineValidators, composeValidators, hasLengthGreaterThan, isRequired } from 'revalidate';
import { Button, Form, Grid, Segment } from 'semantic-ui-react';
import { v4 as uuid } from 'uuid';
import DateInput from '../../../common/form/DateInput';
import SelectInput from '../../../common/form/SelectInput';
import TextAreaInput from '../../../common/form/TextAreaInput';
import TextInput from '../../../common/form/TextInput';
import { category } from '../../../common/options/catagoryOptions';
import { combineDateAndTime } from '../../../common/Util/util';
import { ActivityFormValues } from '../../../models/activity';
import ActivityStore from '../../../stores/activities.store';

const validate = combineValidators({
  title: isRequired({message: 'The event title is required'}),
  category: isRequired('Category'),
  description: composeValidators(
    isRequired('Description'),
    hasLengthGreaterThan(4)({message: 'Description needs to be at least 5 characters'})
  )(),
  city: isRequired('City'),
  venue: isRequired('Venue'),
  date: isRequired('Date'),
  time: isRequired('Time')
})

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
    loadActivity,
  } = activityStore;

  const [activity, setActivity] = useState(new ActivityFormValues());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (match.params.id) {
      setLoading(true);
      loadActivity(match.params.id)
        .then((activity) => setActivity(new ActivityFormValues(activity)))
        .finally(() => setLoading(false));
    }
  }, [loadActivity, match.params.id]);

  const handleFinalFormSubmit = (values: any) => {
    const dateAndTime = combineDateAndTime(values.date, values.time);
    const { date, time, ...activity } = values; // get activity without the temp date and time
    activity.date = dateAndTime;

    if (!activity.id) {
      let newActivity = {
        ...activity,
        id: uuid(),
      };
      createActivity(newActivity);
    } else {
      editActivity(activity);
    }
  };

  return (
    <Grid>
      <Grid.Column width={10}>
        <Segment clearing>
          <FinalForm
            validate={validate}
            initialValues={activity}
            onSubmit={handleFinalFormSubmit}
            render={({ handleSubmit, invalid, pristine }) => (
              <Form onSubmit={handleSubmit} loading={loading}>
                <Field
                  placeholder="Title"
                  value={activity.title}
                  name="title"
                  component={TextInput}
                />
                <Field
                  placeholder="Description"
                  value={activity.description}
                  name="description"
                  component={TextAreaInput}
                />
                <Field
                  placeholder="Category"
                  value={activity.category}
                  name="category"
                  options={category}
                  component={SelectInput}
                />
                <Form.Group widths="equal">
                  <Field
                    placeholder="Date"
                    value={activity.date}
                    date={true}
                    name="date"
                    component={DateInput}
                  />
                  <Field
                    placeholder="Time"
                    value={activity.time}
                    name="time"
                    time={true}
                    component={DateInput}
                  />
                </Form.Group>

                <Field
                  placeholder="City"
                  value={activity.city}
                  name="city"
                  component={TextInput}
                />
                <Field
                  placeholder="Venue"
                  value={activity.venue}
                  name="venue"
                  component={TextInput}
                />
                <Button
                  floated="right"
                  positive
                  type="submit"
                  content="Submit"
                  loading={submitting}
                  disabled={loading || invalid || pristine}
                />
                <Button
                  onClick={
                    activity.id
                      ? () => history.push(`/activities/${activity.id}`)
                      : () => history.push('/activities')
                  }
                  floated="right"
                  type="button"
                  content="Cancel"
                  disabled={loading}
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
