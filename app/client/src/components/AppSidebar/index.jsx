import React from 'react';
import { Link, Route, Switch, Redirect } from 'react-router-dom';
import { Icon, Header, Image, Button } from 'semantic-ui-react';
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

// expandSidebar = () => setState({ isWide: true })
// shrinkSidebar = () => setState({ isWide: false })
// showSidebarContent = () => setState({ visible: true })
// toggleVisibility = () => setState({ visible: !state.visible })


const AppSidebar = ({
  isWide,
  isVisible,
  expandSidebar,
  shrinkSidebar,
  showSidebarContent,
  toggleSidebarContent,
}) => {
  const isWideClass = isWide ? 'show' : 'hide';
  let visibleClass;
  let isIconVisible;

  if (window.location.pathname === '/') {
    visibleClass = `${isVisible ? 'hidden' : 'full'}`;
    isIconVisible = `${isVisible ? 'left' : 'right'}`;
  } else if (window.location.pathname === '/submit' || window.location.pathname === '/about') {
    visibleClass = `${isVisible ? 'full thin-component' : 'hidden'}`;
    isIconVisible = `${isVisible ? 'right' : 'left'}`;
  } else {
    visibleClass = `${isVisible ? 'full' : 'hidden'}`;
    isIconVisible = `${isVisible ? 'right' : 'left'}`;
  }

  return (
    <div className="side-bar-container">
      <div className="item-container">
        <div className="article-display-button" onClick={toggleSidebarContent}>
          <Icon name={`angle ${isIconVisible}`} size="large" />
        </div>
        <div className={`side-menu-item-container ${visibleClass}`}>
          <Switch>
            <Route path="/" component={PopularArticles} exact />
            <Route path="(.*)/popular" component={PopularArticles} exact />
            <Route path="(.*)/recent" component={RecentArticles} exact />
            <Route path="(.*)/preferences" component={Filter} exact />
            <Route path="(.*)/about" component={About} exact />
            <Route path="(.*)/submit" component={Submit} exact />
            <Route path="(.*)/categories" component={Categories} exact />
            <Route path="(.*)/themes" component={MapThemes} exact />
            <Route path="(.*)/sources" component={SourcesList} exact />
            <Redirect to="/" />
          </Switch>
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
          <Link to="/popular" onClick={showSidebarContent}>
            <Icon name="newspaper" color="darkgrey" />
            <span className={`sidebar-text ${isWideClass}`}>Popular News</span>
          </Link>
          <Link to="/recent" onClick={showSidebarContent}>
            <Icon name="plus square outline" color="darkgrey" />
            <span className={`sidebar-text ${isWideClass}`}>Recent Articles</span>
          </Link>
          <Link to="/preferences" onClick={showSidebarContent}>
            <Icon name="cogs" color="darkgrey" />
            <span className={`sidebar-text ${isWideClass}`}>Preferences</span>
          </Link>
          {/* <Link to="/categories" onClick={showSidebarContent}>
              <Icon name="tags" color="darkgrey" />
              <span className={`sidebar-text ${isWideClass}`}>Categories</span>
            </Link> */}
          <Link to="/submit" onClick={showSidebarContent}>
            <Icon name="send outline" color="darkgrey" />
            <span className={`sidebar-text ${isWideClass}`}>Submit</span>
          </Link>
          <Link to="/about" onClick={showSidebarContent}>
            <Icon name="browser" color="darkgrey" />
            <span className={`sidebar-text ${isWideClass}`}>About</span>
          </Link>
          {/* <Link to="/themes" onClick={showSidebarContent}>
              <Icon name="globe" color="darkgrey" />
              <span className={`sidebar-text ${isWideClass}`}>Map Themes</span>
            </Link> */}
          <Link to="/sources" onClick={showSidebarContent}>
            <Icon name="list ul" color="darkgrey" />
            <span className={`sidebar-text ${isWideClass}`}>Sources</span>
          </Link>
        </div>
        <div className="popular">
          <span className={`label ${isWideClass}`}>POPULAR</span>
        </div>
        <div className="top-places">
          {isWide ? <span className="label">TOP PLACES</span> : null}
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
