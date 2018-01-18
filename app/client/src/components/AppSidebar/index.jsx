import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Header, Image } from 'semantic-ui-react';
import tutuLogo from '../../assets/logo/tutu-logo.png';
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
    const isWideClass = isWide ? 'show' : 'hide';
    let isVisible;
    let isIconVisible;

    if (window.location.pathname === '/') {
      isVisible = `${visible ? 'hidden' : 'full'}`;
      isIconVisible = `${visible ? 'left' : 'right'}`;
    } else if (window.location.pathname === '/submit' || window.location.pathname === '/about') {
      isVisible = `${visible ? 'full thin-component' : 'hidden'}`;
      isIconVisible = `${visible ? 'right' : 'left'}`;
    } else {
      isVisible = `${visible ? 'full' : 'hidden'}`;
      isIconVisible = `${visible ? 'right' : 'left'}`;
    }

    return (
      <div className="side-bar-container">

        <div className="item-container">
          <div className="top-buttons">
            {this.props.topChildren}
          </div>
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
            <Image src={tutuLogo} className="tutu-logo" />
            <Link to="/">
              <Header as="h2" className={`tutu-logo ${isWideClass}`}>TUTÛ</Header>
            </Link>
          </div>
          <div className="side-menu">
            <span className={`label ${isWideClass}`}>MENU</span>
            <Link to="/popular" onClick={this.beVisible}>
              <Icon name="newspaper" color="darkgrey" />
              <span className={`sidebar-text ${isWideClass}`}>Popular News</span>
            </Link>
            <Link to="/recent" onClick={this.beVisible}>
              <Icon name="plus square outline" color="darkgrey" />
              <span className={`sidebar-text ${isWideClass}`}>Recent Articles</span>
            </Link>
            <Link to="/preferences" onClick={this.beVisible}>
              <Icon name="cogs" color="darkgrey" />
              <span className={`sidebar-text ${isWideClass}`}>Preferences</span>
            </Link>
            {/* <Link to="/categories" onClick={this.beVisible}>
              <Icon name="tags" color="darkgrey" />
              <span className={`sidebar-text ${isWideClass}`}>Categories</span>
            </Link> */}
            <Link to="/submit" onClick={this.beVisible}>
              <Icon name="send outline" color="darkgrey" />
              <span className={`sidebar-text ${isWideClass}`}>Submit</span>
            </Link>
            <Link to="/about" onClick={this.beVisible}>
              <Icon name="browser" color="darkgrey" />
              <span className={`sidebar-text ${isWideClass}`}>About</span>
            </Link>
            {/* <Link to="/themes" onClick={this.beVisible}>
              <Icon name="globe" color="darkgrey" />
              <span className={`sidebar-text ${isWideClass}`}>Map Themes</span>
            </Link> */}
            <Link to="/sources" onClick={this.beVisible}>
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
  }
}

export default AppSidebar;
