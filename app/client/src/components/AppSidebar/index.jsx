import React from 'react';
import { Link, Route, Switch, Redirect } from 'react-router-dom';
import {
  Icon,
  Header,
  Image,
  List,
  Modal,
  Menu,
} from 'semantic-ui-react';
import RecentArticles from '../RecentArticles';
import PopularArticles from '../PopularArticles';
import Filter from '../Filter';
import About from '../About';
import Categories from '../Categories';
import Submit from '../Submit';
import SourcesList from '../SourcesList';
import MapThemes from '../MapThemes';
import tutuLogo from '../../assets/logo/tutu-logo.png';
import './style.css';
import '../../index.css';

const AppSidebar = ({
  isWide,
  isVisible,
  expandSidebar,
  shrinkSidebar,
  showSidebarContent,
  toggleSidebarContent,
  fetchArticles,
  hideCount,
}) => {
  const isWideClass = isWide ? 'show' : 'hide';
  let visibleClassName;
  let isIconVisible;

  if (window.location.pathname === '/') {
    visibleClassName = `${isVisible ? 'shown' : 'hidden'}`;
    isIconVisible = `${isVisible ? 'right' : 'left'}`;
  } else {
    visibleClassName = `${isVisible ? 'shown' : 'hidden'}`;
    isIconVisible = `${isVisible ? 'right' : 'left'}`;
  }

  return (
    <div>
      <div className="show-on-mobile">
        <Menu compact icon="labeled" borderless fixed="bottom" className="mobile-menu-container">
          <Modal
            trigger={
              <Menu.Item name="popular">
                <Icon name="newspaper" />
                Popular
              </Menu.Item>
            }
            closeIcon
          >
            <PopularArticles />
          </Modal>
          <Modal
            trigger={
              <Menu.Item name="related">
                <Icon name="plus square outline" />
                Recent
              </Menu.Item>
            }
            closeIcon
          >
            <RecentArticles />
          </Modal>
          <Modal
            trigger={
              <Menu.Item name="preferences">
                <Icon name="cogs" />
                Preferences
              </Menu.Item>
            }
            closeIcon
          >
            <Filter
              fetchArticles={fetchArticles}
              hideCount={hideCount}
            />
          </Modal>
          <Modal
            trigger={
              <Menu.Item name="analyze">
                <Icon name="detective" />
                Analyze
              </Menu.Item>
            }
            closeIcon
          >
            <Submit />
          </Modal>
          <Modal
            trigger={
              <Menu.Item name="about">
                <Icon name="browser" />
                About
              </Menu.Item>
            }
            closeIcon
          >
            <About />
          </Modal>
          <Modal
            trigger={
              <Menu.Item name="help">
                <Icon name="help circle outline" />
                Help
              </Menu.Item>
            }
            closeIcon
            size="tiny"
            basic
          >
            <Header as="h2" inverted>Legends:</Header>
            <Modal.Content>
              <List relaxed="very">
                <List.Item>
                  <List.Icon name="newspaper" size="big" />
                  <List.Content>Take a look at the popular news</List.Content>
                </List.Item>
                <List.Item>
                  <List.Icon name="plus square outline" size="big" />
                  <List.Content>Take a look at the recently added news</List.Content>
                </List.Item>
                <List.Item>
                  <List.Icon name="cogs" size="big" />
                  <List.Content>Prefer something you prefer</List.Content>
                </List.Item>
                <List.Item>
                  <List.Icon name="send outline" size="big" />
                  <List.Content>Submit an article to be analyzed by the TUTÛ Detector</List.Content>
                </List.Item>
                <List.Item>
                  <List.Icon name="marker" size="big" />
                  <List.Content>Display a single article</List.Content>
                </List.Item>
                <List.Item>
                  <List.Icon name="dot circle outline" size="big" />
                  <List.Content>Display a cluster of articles in a region</List.Content>
                </List.Item>
              </List>
            </Modal.Content>
          </Modal>
        </Menu>
      </div>
      <div className="hide-when-mobile">
        <div className="side-bar-container">
          <div className="item-container">
            <div className="article-display-button" onClick={toggleSidebarContent}>
              <Icon name={`angle ${isIconVisible}`} size="large" />
            </div>
            <div className={`side-menu-item-container ${visibleClassName}`}>
              {isVisible ? (
                <Switch>
                  <Route path="/" component={PopularArticles} exact />
                  <Route path="(.*)/popular" component={PopularArticles} exact />
                  <Route path="(.*)/recent" component={RecentArticles} exact />
                  <Route
                    path="(.*)/preferences"
                    component={(routeProps) => (
                      <Filter
                        {...routeProps}
                        fetchArticles={fetchArticles}
                        hideCount={hideCount}
                      />
                    )}
                    exact
                  />
                  <Route path="(.*)/about" component={About} exact />
                  <Route path="(.*)/submit" component={Submit} exact />
                  <Route path="(.*)/categories" component={Categories} exact />
                  <Route path="(.*)/themes" component={MapThemes} exact />
                  <Route path="(.*)/sources" component={SourcesList} exact />
                  <Redirect to="/" />
                </Switch>
            ) : null}
            </div>
          </div>

          <div
            className={`sidebar-container ${isWide ? 'wide' : 'thin'}`}
            onMouseEnter={expandSidebar}
            onMouseLeave={shrinkSidebar}
          >
            <div className="logo">
              <Image src={tutuLogo} className="tutu-logo" />
              <Link to="/">
                <Header as="h2" className={`tutu-logo ${isWideClass}`}>TUTÛ</Header>
              </Link>
            </div>
            <div className="side-menu">
              <span className={`label ${isWideClass}`}>MENU</span>
              <Link to="popular" onClick={showSidebarContent}>
                <Icon name="newspaper" color="darkgrey" />
                <span className={`sidebar-text ${isWideClass}`}>Popular News</span>
              </Link>
              <Link to="recent" onClick={showSidebarContent}>
                <Icon name="plus square outline" color="darkgrey" />
                <span className={`sidebar-text ${isWideClass}`}>Recent Articles</span>
              </Link>
              <Link to="preferences" onClick={showSidebarContent}>
                <Icon name="cogs" color="darkgrey" />
                <span className={`sidebar-text ${isWideClass}`}>Preferences</span>
              </Link>
              {/* <Link to="/categories" onClick={showSidebarContent}>
                  <Icon name="tags" color="darkgrey" />
                  <span className={`sidebar-text ${isWideClass}`}>Categories</span>
                </Link> */}
              <Link to="submit" onClick={showSidebarContent}>
                <Icon name="detective" color="darkgrey" />
                <span className={`sidebar-text ${isWideClass}`}>Analyze</span>
              </Link>
              <Link to="about" onClick={showSidebarContent}>
                <Icon name="browser" color="darkgrey" />
                <span className={`sidebar-text ${isWideClass}`}>About</span>
              </Link>
              {/* <Link to="themes" onClick={showSidebarContent}>
                  <Icon name="globe" color="darkgrey" />
                  <span className={`sidebar-text ${isWideClass}`}>Map Themes</span>
                </Link> */}
              {/* <Link to="sources" onClick={showSidebarContent}>
                <Icon name="list ul" color="darkgrey" />
                <span className={`sidebar-text ${isWideClass}`}>Sources</span>
              </Link> */}
              <Modal
                trigger={
                  <div className="help-button" >
                    <Icon name="help circle outline" color="darkgrey" />
                    <span className={`sidebar-text ${isWideClass}`}>Help</span>
                  </div>
                }
                size="tiny"
                basic
              >
                <Header as="h2" inverted>Legends:</Header>
                <Modal.Content>
                  <List relaxed="very">
                    <List.Item>
                      <List.Icon name="newspaper" size="big" />
                      <List.Content>Take a look at the popular news</List.Content>
                    </List.Item>
                    <List.Item>
                      <List.Icon name="plus square outline" size="big" />
                      <List.Content>Take a look at the recently added news</List.Content>
                    </List.Item>
                    <List.Item>
                      <List.Icon name="cogs" size="big" />
                      <List.Content>Prefer something you prefer</List.Content>
                    </List.Item>
                    <List.Item>
                      <List.Icon name="send outline" size="big" />
                      <List.Content>
                        Submit an article to be analyzed by the TUTÛ Detector
                      </List.Content>
                    </List.Item>
                    <List.Item>
                      <List.Icon name="marker" size="big" />
                      <List.Content>Display a single article</List.Content>
                    </List.Item>
                    <List.Item>
                      <List.Icon name="dot circle outline" size="big" />
                      <List.Content>Display a cluster of articles in a region</List.Content>
                    </List.Item>
                  </List>
                </Modal.Content>
              </Modal>
            </div>
            {/* <div className="popular">
              <span className={`label ${isWideClass}`}>POPULAR</span>
            </div>
            <div className="top-places">
              {isWide ? <span className="label">TOP PLACES</span> : null}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
