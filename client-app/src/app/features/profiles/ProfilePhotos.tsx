import React, { useContext, useState } from 'react';
import { Tab, Header, Card, Image, Button, Grid } from 'semantic-ui-react';
import { RootStoreContext } from '../../stores/root.store';
import PhotoUploadWidget from '../../common/photoUpload/PhotoUploadWidget';
import { observer } from 'mobx-react-lite';
import { IPhoto } from '../../models/profile';

const ProfilePhotos = () => {
  const rootStore = useContext(RootStoreContext);
  const {
    profile,
    isCurrentUser,
    uploadPhoto,
    uploadingPhoto,
    setMainPhoto,
    deletePhoto,
    loading,
  } = rootStore.profileStore;
  const [addPhotoMode, setAddPhotoMode] = useState(false);
  const [target, setTarget] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<string | undefined>(
    undefined
  );

  const handleUploadImage = (photo: Blob) => {
    uploadPhoto(photo).then(() => setAddPhotoMode(false));
  };

  const handleSetMain = (photo: IPhoto, e: any) => {
    setMainPhoto(photo);
    setTarget(e.currentTarget.name);
  };

  const handleDeletePhoto = (photo: IPhoto, e: any) => {
    deletePhoto(photo);
    setDeleteTarget(e.currentTarget.name);
  };

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16} style={{ paddingBottom: 0 }}>
          <Header floated="left" icon="image" content="Photos" />
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content={addPhotoMode ? 'Cancel' : 'Add Photo'}
              onClick={setAddPhotoMode.bind(null, !addPhotoMode)}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
          {addPhotoMode ? (
            <PhotoUploadWidget
              uploadPhoto={handleUploadImage}
              loading={uploadingPhoto}
            />
          ) : (
            <Card.Group itemsPerRow={5}>
              {profile?.photos.map((photo) => (
                <Card key={photo.id}>
                  <Image src={photo.url} />
                  {isCurrentUser && (
                    <Button.Group fluid widths={2}>
                      <Button
                        basic
                        positive
                        content="Main"
                        name={photo.id}
                        disabled={photo.isMain}
                        onClick={handleSetMain.bind(null, photo)}
                        loading={loading && target === photo.id}
                      />
                      <Button
                        name={photo.id}
                        disabled={photo.isMain}
                        onClick={handleDeletePhoto.bind(null, photo)}
                        loading={loading && deleteTarget === photo.id}
                        basic
                        negative
                        icon="trash"
                      />
                    </Button.Group>
                  )}
                </Card>
              ))}
            </Card.Group>
          )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
};

export default observer(ProfilePhotos);
