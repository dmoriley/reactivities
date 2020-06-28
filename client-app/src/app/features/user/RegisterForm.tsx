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
  username: isRequired('Username'),
  displayName: isRequired('Display Name'),
  email: isRequired('Email'),
  password: isRequired('Password'),
});

const RegisterForm = () => {
  const rootStore = useContext(RootStoreContext);
  const { register } = rootStore.userStore;

  const finalFormSubmit = (values: IUserFormValues) =>
    register(values).catch((error) => ({
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
            content="Sign up for Reactivities"
            color="teal"
            textAlign="center"
          />
          <Field name="username" component={TextInput} placeholder="Username" />
          <Field name="displayName" component={TextInput} placeholder="Display Name" />
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
            />
          )}
          <Button
            disabled={(invalid && !dirtySinceLastSubmit) || pristine}
            loading={submitting}
            color="teal"
            content="Register"
            fluid
          />
        </Form>
      )}
    />
  );
};

export default RegisterForm;
