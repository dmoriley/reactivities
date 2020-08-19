import { observer } from 'mobx-react-lite';
import React, { Fragment, useContext, useEffect } from 'react';
import { Route, RouteComponentProps, withRouter, Switch } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import ActivityDashboard from '../features/activities/dashboard/ActivityDashboard';
import ActivityDetails from '../features/activities/details/ActivityDetails';
import ActivityForm from '../features/activities/form/ActivityForm';
import HomePage from '../features/home/HomePage';
import NavBar from '../features/nav/NavBar';
import NotFound from './NotFound';
import { ToastContainer } from 'react-toastify';
import { RootStoreContext } from '../stores/root.store';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';
import ProfilePage from '../features/profiles/ProfilePage';
import PrivateRoute from './PrivateRoute';

const App: React.FC<RouteComponentProps> = ({ location }) => {
  const rootStore = useContext(RootStoreContext);
  const {setAppLoaded, token, appLoaded} = rootStore.commonStore;
  const {getUser} = rootStore.userStore;

  useEffect(() => {
    // TODO: token as dep, api is called twice when user logins. Refactor to change to one call
    if (token) {
      // agent ts is going to check local storage for us to see if we have a user, so no need to supply one
      getUser().finally(() => setAppLoaded());
    } else {
      setAppLoaded();
    }
  }, [getUser, setAppLoaded, token])

  if (!appLoaded) {
    return <LoadingComponent content="Loading app..." />
  }

  // path '/(.+)' (regex to indicate one or more of anything) used to say render this stuff when path is a / with anything all at trailing after it.
  // used to render the homepage without the navbar
  return (
    <Fragment>
      <ModalContainer />
      <ToastContainer position='bottom-right' />
      <Route exact path="/" component={HomePage} />
      <Route
        path={'/(.+)'}
        render={() => (
          <Fragment>
            <NavBar />
            <Container style={{ marginTop: '7em' }}>
              <Switch>
                <PrivateRoute exact path="/activities" component={ActivityDashboard} />
                <PrivateRoute path="/activities/:id" component={ActivityDetails} />
                <PrivateRoute
                  key={location.key}
                  path={['/createActivity', '/manage/:id']}
                  component={ActivityForm}
                />
                <PrivateRoute path='/profiles/:username' component={ProfilePage}/>
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
