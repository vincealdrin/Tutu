import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon, Label, Segment, Button } from 'semantic-ui-react';
import './style.css';

class AppSidebar extends Component {
  state = {
    isWide: true,
  };

  expandSidebar = () => this.setState({ isWide: true })
  shrinkSidebar = () => this.setState({ isWide: false })

  render() {
    const { isWide } = this.state;

    return (
      <div className="container">
        <div className="item-container">
          {this.props.children}
        </div>
        <div
          className={`sidebar-container ${isWide ? 'wide' : 'thin'}`}
          onMouseEnter={this.expandSidebar}
          onMouseLeave={this.shrinkSidebar}
        >
          <div className="logo">
            <Icon name="map" color="grey" size="big" />
          </div>
          <div className="menu">
            {isWide ? <span className="label">MENU</span> : null}
            <Link to="/top">
              <Icon name="newspaper" color="grey" size="large" />
              {isWide ? 'Top News' : null}
            </Link>
            <Link to="/recent">
              <Icon name="plus square outline" color="grey" size="large" />
              {isWide ? 'Recent Articles' : null}
            </Link>
            <Link to="/filter">
              <Icon name="filter" color="grey" size="large" />
              {isWide ? 'Filter' : null}
            </Link>
            <Link to="/categories">
              <Icon name="tags" color="grey" size="large" />
              {isWide ? 'Categories' : null}
            </Link>
            <Link to="/themes">
              <Icon name="world" color="grey" size="large" />
              {isWide ? 'Map Themes' : null}
            </Link>
          </div>
          <div className="popular">
            {isWide ? <span className="label">POPULAR</span> : null}
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
