import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Header, Image, Dimmer, List, Divider } from 'semantic-ui-react';
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

  openHelp = () => this.setState({ active: true })
  closeHelp = () => this.setState({ active: false })

  render() {
    const {
      isWide,
      visible,
      active } = this.state;

    const isWideClass = isWide ? 'show' : 'hide';
    let isVisible;
    let isIconVisible;

    if (window.location.pathname === '/') {
      isVisible = `${visible ? 'hidden' : 'full'}`;
      isIconVisible = `${visible ? 'left' : 'right'}`;
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
            <div 
              onMouseDown={this.openHelp}
              className="help-button"
            >
              <Icon name="help circle outline" color="darkgrey" />
              <span className={`sidebar-text ${isWideClass}`}>Help</span>
              <Dimmer
                onMouseUp={this.closeHelp}
                active={active}
                page
              >
              <Header as="h2" inverted>Legends:</Header>
              <Divider inverted />
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
                  <List.Content>Submit an article to be evaluated by TUTÛ Evaluator</List.Content>
                </List.Item>
                <List.Item>
                  <List.Icon name="list ul" size="big" />
                  <List.Content>Take a look at the sources in our archives</List.Content>
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
              </Dimmer>
            </div>
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
