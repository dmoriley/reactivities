import React, { useContext, useState } from 'react'
import { Tab, Grid, Header, Button } from 'semantic-ui-react'
import { RootStoreContext } from '../../stores/root.store';
import ProfileEditForm from './ProfileEditForm';
import { observer } from 'mobx-react-lite';

const ProfileDescription = () => {

  const rootStore = useContext(RootStoreContext);
  const {
    updateProfile,
    profile,
    isCurrentUser,
  } = rootStore.profileStore;

  const [editMode, setEditMode] = useState(false);
  
  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16} style={{ paddingBottom: 0 }}>
          <Header 
            floated="left" 
            icon="image" 
            content={`About ${profile?.displayName}`} 
          />
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content={editMode ? 'Cancel' : 'Edit Profile'}
              onClick={setEditMode.bind(null, !editMode)}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
            {editMode ? (
              <ProfileEditForm updateProfile={updateProfile} profile={profile!} />
            ) : (
            <p>{profile?.bio}</p>
            )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  )
}

export default observer(ProfileDescription)
