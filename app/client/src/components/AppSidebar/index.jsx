import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Header } from 'semantic-ui-react';
import './style.css';

class AppSidebar extends Component {
  state = {
    visible: true,
    isWide: false,
  };

  expandSidebar = () => this.setState({ isWide: true })
  shrinkSidebar = () => this.setState({ isWide: false })
  beVisible = () => this.setState({ visible: true })
  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const { isWide } = this.state;
    const { visible } = this.state;
    let isVisible;
    let isIconVisible;

    if (window.location.pathname === '/') {
      isVisible = `${visible ? 'hidden' : 'full'}`;
      isIconVisible = `${visible ? 'left' : 'right'}`;
    } if (window.location.pathname === '/submit' || window.location.pathname === '/about') {
      isVisible = `${visible ? 'full thin-component' : 'hidden'}`;
      isIconVisible = `${visible ? 'right' : 'left'}`;
    } else {
      isVisible = `${visible ? 'full' : 'hidden'}`;
      isIconVisible = `${visible ? 'right' : 'left'}`;
    }

    return (
      <div className="container">
        <div className="item-container">
          <div className="article-display-button" onClick={this.toggleVisibility}>
            <Icon name={`angle ${isIconVisible}`} size="large" />
          </div>
          <div className={`side-menu-item-container ${isVisible}`}>
            {this.props.children}
          </div>
        </div>

        <div
          className={`sidebar-container ${isWide ? 'wide' : 'thin'}`}
          onMouseEnter={this.expandSidebar}
          onMouseLeave={this.shrinkSidebar}
        >
          <div className="logo">
            <Icon name="map" color="grey" size="big" style={{ margin: '2rem auto 1rem' }} />
            <Link to="/top">
              <Header as="h2" className={`tutu-logo ${isWide ? 'show' : 'hide'}`}>TUTÛ</Header>
            </Link>
          </div>
          <div className="side-menu">
            <span className={`label ${isWide ? 'show' : 'hide'}`}>MENU</span>
            <Link to="/popular" onClick={this.beVisible}>
              <Icon name="newspaper" color="grey" />
              <span className={`sidebar-text ${isWide ? 'show' : 'hide'}`}>Popular News</span>
            </Link>
            <Link to="/recent" onClick={this.beVisible}>
              <Icon name="plus square outline" color="grey" />
              <span className={`sidebar-text ${isWide ? 'show' : 'hide'}`}>Recent Articles</span>
            </Link>
            <Link to="/filter" onClick={this.beVisible}>
              <Icon name="filter" color="grey" />
              <span className={`sidebar-text ${isWide ? 'show' : 'hide'}`}>Filter</span>
            </Link>
            <Link to="/categories" onClick={this.beVisible}>
              <Icon name="tags" color="grey" />
              <span className={`sidebar-text ${isWide ? 'show' : 'hide'}`}>Categories</span>
            </Link>
            <Link to="/about" onClick={this.beVisible}>
              <Icon name="browser" color="grey" />
              <span className={`sidebar-text ${isWide ? 'show' : 'hide'}`}>About</span>
            </Link>
            <Link to="/submit" onClick={this.beVisible}>
              <Icon name="send outline" color="grey" />
              <span className={`sidebar-text ${isWide ? 'show' : 'hide'}`}>Submit</span>
            </Link>
            <Link to="/themes" onClick={this.beVisible}>
              <Icon name="globe" color="grey" />
              <span className={`sidebar-text ${isWide ? 'show' : 'hide'}`}>Map Themes</span>
            </Link>
          </div>
          <div className="popular">
            <span className={`label ${isWide ? 'show' : 'hide'}`}>POPULAR</span>
          </div>
          <div className="top-places">
            {isWide ? <span className="label">TOP PLACES</span> : null}
          </div>
        </div>
      </div>
    );
  }
}

export default AppSidebar;
