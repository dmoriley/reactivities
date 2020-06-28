import { FORM_ERROR } from 'final-form';
import React, { useContext } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { combineValidators, isRequired } from 'revalidate';
import { Button, Form, Header } from 'semantic-ui-react';
import TextInput from '../../common/form/TextInput';
import { IUserFormValues } from '../../models/user';
import { RootStoreContext } from '../../stores/root.store';
import ErrorMessage from '../../common/form/ErrorMessage';

const validate = combineValidators({
  email: isRequired('Email'),
  password: isRequired('Password'),
});

const LoginForm = () => {
  const rootStore = useContext(RootStoreContext);
  const { login } = rootStore.userStore;

  const finalFormSubmit = (values: IUserFormValues) =>
    login(values).catch((error) => ({
      // in final form have to return an object with the provided property name to manually
      // indicate that there was a submissions and thus form error so we can display it.
      [FORM_ERROR]: error,
    }));

  return (
    <FinalForm
      onSubmit={finalFormSubmit}
      validate={validate}
      render={({
        handleSubmit,
        submitting,
        submitError,
        invalid,
        pristine,
        dirtySinceLastSubmit,
      }) => (
        <Form onSubmit={handleSubmit} error>
          <Header
            as="h2"
            content="Login to Reactivities"
            color="teal"
            textAlign="center"
          />
          <Field name="email" component={TextInput} placeholder="Email" />
          <Field
            name="password"
            component={TextInput}
            placeholder="Password"
            type="password"
          />
          {submitError && !dirtySinceLastSubmit && (
            <ErrorMessage
              error={submitError}
              text="Invalid username or password"
            />
          )}
          <Button
            disabled={(invalid && !dirtySinceLastSubmit) || pristine}
            loading={submitting}
            color="teal"
            content="Login"
            fluid
          />
        </Form>
      )}
    />
  );
};

export default LoginForm;
