import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Header } from 'semantic-ui-react';
import './style.css';

class AppSidebar extends Component {
  state = {
    isWide: false,
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
            <Icon name="map" color="grey" size="big" style={{ margin: '2rem auto 1rem' }} />
            {/* {isWide ? <Header style={{ margin: '0 auto' }} >TUTÛ</Header> : null} */}
          </div>
          <div className="menu">
            {/* {isWide ? <span className="label">MENU</span> : null} */}
            <Link to="/top">
              <Icon name="newspaper" color="grey" />
              {/* {isWide ? 'Top News' : null} */}
            </Link>
            <Link to="/recent">
              <Icon name="plus square outline" color="grey" />
              {/* {isWide ? 'Recent Articles' : null} */}
            </Link>
            <Link to="/filter">
              <Icon name="filter" color="grey" />
              {/* {isWide ? 'Filter' : null} */}
            </Link>
            <Link to="/categories">
              <Icon name="tags" color="grey" />
              {/* {isWide ? 'Categories' : null} */}
            </Link>
            <Link to="/about">
              <Icon name="browser" color="grey" />
              {/* {isWide ? 'About' : null} */}
            </Link>
            <Link to="/submit">
              <Icon name="send outline" color="grey" />
              {/* {isWide ? 'About' : null} */}
            </Link>
            <Link to="/themes">
              <Icon name="world" color="grey" />
              {/* {isWide ? 'Map Themes' : null} */}
            </Link>
          </div>
          <div className="popular">
            {/* {isWide ? <span className="label">POPULAR</span> : null} */}
          </div>
          <div className="top-places">
            {/* {isWide ? <span className="label">TOP PLACES</span> : null} */}
          </div>
        </div>
      </div>
    );
  }
}

export default AppSidebar;
