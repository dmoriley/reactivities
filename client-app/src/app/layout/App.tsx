import { observer } from 'mobx-react-lite';
import React, { Fragment } from 'react';
import { Route, RouteComponentProps, withRouter, Switch } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import ActivityDashboard from '../features/activities/dashboard/ActivityDashboard';
import ActivityDetails from '../features/activities/details/ActivityDetails';
import ActivityForm from '../features/activities/form/ActivityForm';
import HomePage from '../features/home/HomePage';
import NavBar from '../features/nav/NavBar';
import NotFound from './NotFound';
import { ToastContainer } from 'react-toastify';

const App: React.FC<RouteComponentProps> = ({ location }) => {
  // path '/(.+)' (regex to indicate one or more of anything) used to say render this stuff when path is a / with anything all at trailing after it.
  // used to render the homepage without the navbar
  return (
    <Fragment>
      <ToastContainer position='bottom-right' />
      <Route exact path="/" component={HomePage} />
      <Route
        path={'/(.+)'}
        render={() => (
          <Fragment>
            <NavBar />
            <Container style={{ marginTop: '7em' }}>
              <Switch>
                <Route exact path="/activities" component={ActivityDashboard} />
                <Route path="/activities/:id" component={ActivityDetails} />
                <Route
                  key={location.key}
                  path={['/createActivity', '/manage/:id']}
                  component={ActivityForm}
                />
                <Route component={NotFound} />
              </Switch>
            </Container>
          </Fragment>
        )}
      />
    </Fragment>
  );
};

// whenever the key changes when navigating to create an activity or managing an activity, it will cause component to rerender.
// otherwise it will just receive new props but wont update say when going from manage -> create. This way its forced to unmount and rerender

// with router gives our app component access to the location props
export default withRouter(observer(App));
