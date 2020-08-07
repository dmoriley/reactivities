import React from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { combineValidators, isRequired } from 'revalidate';
import { Button, Form } from 'semantic-ui-react';
import TextAreaInput from '../../common/form/TextAreaInput';
import TextInput from '../../common/form/TextInput';
import { IProfile } from '../../models/profile';

interface IProps {
  updateProfile: (profile: Partial<IProfile>) => void;
  profile: IProfile;
}

const validate = combineValidators({
  displayName: isRequired('Display Name'),
});

const ProfileEditForm: React.FC<IProps> = ({updateProfile, profile}) => {
  return (
    <FinalForm
      onSubmit={updateProfile}
      validate={validate}
      initialValues={profile!}
      render={({
        handleSubmit,
        submitting,
        invalid,
        pristine,
        dirtySinceLastSubmit
      }) => (
        <Form onSubmit={handleSubmit} error>
          <Field 
            name="displayName" 
            component={TextInput}
            placeholder="Display Name"
            value={profile!.displayName}
          />
          <Field 
            name="bio" 
            component={TextAreaInput}
            placeholder="Bio"
            value={profile!.bio}
            rows="3"
          />
          <Button 
            disabled={(invalid && !dirtySinceLastSubmit) || pristine}
            loading={submitting}
            floated="right"
            color="teal"
            content="Update Profile"
          />
        </Form>
      )}
    />
  )
}

export default ProfileEditForm
