import React, { PureComponent } from 'react';
import {
  Icon,
  Input,
  Button,
  Menu,
  Image,
  Message,
  Dropdown,
} from 'semantic-ui-react';
import { NProgress } from 'redux-nprogress';
import AppSidebar from '../AppSidebar';
import Insights from '../Insights';
import tutuLogo from '../../assets/logo/tutu-logo.png';
import SimpleModal from './SimpleModal';
import ClusterModal from './ClusterModal';
import './styles.css';

const sourcesTypeOpts = [{
  key: 'Credible Sources',
  text: 'Credible Sources',
  value: 'credible',
}, {
  key: 'Not Credible Sources',
  text: 'Not Credible Sources',
  value: 'not credible',
}];

let sourcesTypeTemp = 'credible';
class MapInterface extends PureComponent {
  state = {
    currentPosition: null,
    isSidebarWiden: false,
    isSidebarVisible: false,
    isMsgShown: true,
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      this.setState({
        currentPosition: {
          lat: coords.latitude,
          lng: coords.longitude,
        },
      });
    });
  }

  onSourcesTypeChange_ = (sourcesType) => {
    const { isSidebarVisible } = this.state;

    this.setState({ isMsgShown: true });
    this.props.onSourcesTypeChange(isSidebarVisible, sourcesType);
    sourcesTypeTemp = sourcesType;
  }

  getBtnsClassName = () => {
    const {
      isSidebarVisible,
      isSidebarWiden,
    } = this.state;

    if (isSidebarVisible && isSidebarWiden) {
      return 'adjust-top-buttons-widen-visible';
    }

    if (isSidebarVisible) {
      return 'adjust-top-buttons-visible';
    }

    if (isSidebarWiden) {
      return 'adjust-top-buttons-widen';
    }

    return '';
  }

  expandSidebar = () => this.setState({ isSidebarWiden: true })
  shrinkSidebar = () => this.setState({ isSidebarWiden: false })
  showSidebarContent = () => this.setState({ isSidebarVisible: true })
  toggleSidebarContent = () => this.setState({ isSidebarVisible: !this.state.isSidebarVisible })
  closeMessage = () => this.setState({ isMsgShown: false })

  render() {
    const {
      status,
      isCredible,
      isMap,
      onViewToggle,
      fetchArticles,
      openInsights,
      updateMapLocState,
    } = this.props;
    const {
      currentPosition,
      isSidebarVisible,
      isSidebarWiden,
      isMsgShown,
    } = this.state;
    const isMapBtnDisabled = isMap && (status.pending || status.cancelled);

    return (
      <div>
        <NProgress />
        <SimpleModal />
        <ClusterModal />
        {isMsgShown ? (
          <Message
            header={`${isMap ? 'Map' : 'Grid'} of ${isCredible ? 'Credible' : 'Not Credible'} Sources`}
            content={`Each ${isMap ? 'marker contains' : 'card has'} news from ${isCredible ? 'credible' : 'not credible'} sources`}
            className="src-type-message"
            onDismiss={this.closeMessage}
          />
        ) : null}
        <Insights isMap={isMap} />
        <AppSidebar
          isWide={isSidebarWiden}
          isVisible={isSidebarVisible}
          showSidebarContent={this.showSidebarContent}
          toggleSidebarContent={this.toggleSidebarContent}
          expandSidebar={this.expandSidebar}
          shrinkSidebar={this.shrinkSidebar}
          fetchArticles={fetchArticles}
        />
        <div className="show-on-mobile">
          <Menu fixed="top" className="mobile-top-bar" borderless>
            <Menu.Item>
              <Image src={tutuLogo} className="mobile-tutu-logo" />
            </Menu.Item>
            <Menu.Item header className="mobile-tutu-title">TUTÛ</Menu.Item>
            {isMap ? (
              <Menu.Menu position="right">
                <Menu.Item>
                  <Input icon className="search-topbar-mobile">
                    <input id="searchBoxInputMobile" placeholder="Search places" />
                    <Icon name="search" />
                  </Input>
                  <Button
                    className="current-loc-mobile"
                    icon="crosshairs"
                    onClick={() => {
                      updateMapLocState(currentPosition, 12);
                    }}
                    disabled={!currentPosition}
                    circular
                  />
                </Menu.Item>
              </Menu.Menu>
            ) : null}
          </Menu>

          <Button
            size="large"
            color={`${isCredible ? 'red' : 'green'}`}
            icon="newspaper"
            className="fake-news-button-mobile"
            onClick={() => this.onSourcesTypeChange_(sourcesTypeTemp === 'credible' ? 'not credible' : 'credible')}
            circular
          />
          <Button
            size="large"
            color="blue"
            icon="bar chart"
            className="insights-button-mobile"
            onClick={openInsights}
            disabled={isMapBtnDisabled}
            circular
          />
          <Button
            size="large"
            color="default"
            className="grid-button-mobile"
            icon={isMap ? 'grid layout' : 'map'}
            onClick={onViewToggle}
            circular
          />
        </div>
        <div className="hide-when-mobile">
          <div className={`map-top-buttons ${this.getBtnsClassName()}`}>
            <Button
              content="Visualized Data"
              icon="bar chart"
              labelPosition="left"
              onClick={openInsights}
              disabled={isMapBtnDisabled}
              loading={isMapBtnDisabled}
            />
            <Button.Group color={isCredible ? 'green' : 'red'}>
              <Dropdown
                className="icon"
                icon="newspaper"
                labelPosition="left"
                text={isCredible ? 'Credible Sources' : 'Not Credible Sources'}
                options={sourcesTypeOpts}
                onChange={(_, { value }) => {
                  this.onSourcesTypeChange_(value);
                }}
                defaultValue="credible"
                button
                floating
                labeled
              />
            </Button.Group>

          </div>
          <div className={`map-bot-buttons ${this.getBtnsClassName()}`}>
            <Button
              labelPosition="left"
              content={isMap ? 'Grid View' : 'Map View'}
              icon={isMap ? 'grid layout' : 'map'}
              onClick={onViewToggle}
            />
          </div>
          {isMap ? (
            <div>
              <Input className="search-box" icon>
                <input id="searchBoxInput" placeholder="Search places" />
                <Icon name="search" />
              </Input>
              <Button
                className="current-loc"
                icon="crosshairs"
                onClick={() => {
                  updateMapLocState(currentPosition, 12);
                }}
                disabled={!currentPosition}
                circular
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default MapInterface;
