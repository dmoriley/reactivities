import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Button, Container, Menu, Dropdown, Image } from 'semantic-ui-react';
import { RootStoreContext } from '../../stores/root.store';

const NavBar: React.FC = () => {
  const {userStore: { user, logout }} = useContext(RootStoreContext);
  return (
    <Menu fixed="top" inverted>
      <Container>
        <Menu.Item header as={NavLink} exact to="/">
          <img src="/assets/logo.png" alt="logo" style={{ marginRight: 10 }} />
          Reactivities
        </Menu.Item>
        <Menu.Item name="Activities" as={NavLink} to="/activities" />
        <Menu.Item>
          <Button
            as={NavLink}
            to="/createActivity"
            positive
            content="Create Activity"
          />
        </Menu.Item>
        {user && (
          <Menu.Item position="right">
            <Image avatar spaced="right" src={user.image || '/assets/user.png'} />
            <Dropdown pointing="top left" text={user.displayName}>
              <Dropdown.Menu>
                <Dropdown.Item
                  as={Link}
                  to={`/profile/username`}
                  text="My profile"
                  icon="user"
                />
                <Dropdown.Item onClick={logout} text="Logout" icon="power" />
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        )}
      </Container>
    </Menu>
  );
};

export default observer(NavBar);