import React from 'react'
import {Tab} from 'semantic-ui-react';
import ProfilePhotos from './ProfilePhotos';
import ProfileDescription from './ProfileDescription';
import ProfileFollowings from './ProfileFollowings';

interface IProps {
  setActiveTab: (activeIndex: any) => void
}

const panes = [
  {menuItem: 'About', render: () => <ProfileDescription />},
  {menuItem: 'Photos', render: () => <ProfilePhotos />},
  {menuItem: 'Activities', render: () => <Tab.Pane>Activities Content</Tab.Pane>},
  {menuItem: 'Followers', render: () => <ProfileFollowings />},
  {menuItem: 'Following', render: () => <ProfileFollowings />},
]

const ProfileContent: React.FC<IProps> = ({setActiveTab}) => {
  return (
    <Tab
      onTabChange={(e, data) => setActiveTab(data.activeIndex)}
      menu={{fluid: true, vertical: true}}
      menuPosition='right'
      panes={panes}
    />
  )
}

export default ProfileContent
