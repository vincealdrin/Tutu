import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button, Icon } from 'semantic-ui-react';
import 'react-tippy/dist/tippy.css';
// import 'semantic-ui-css/semantic.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'rc-slider/assets/index.css';
import 'chartjs-plugin-datalabels';
import MapView from '../MapView';
import GridView from '../GridView';
import './styles.css';

axios.defaults.baseURL = '/api/exposed';

const sideBarRoutes = 'popular|recent|preferences|about|categories|submit|themes|sources|';
const hasVisited = document.cookie.includes('visited');

if (!hasVisited) {
  document.cookie = 'visited';
}

class App extends Component {
  state = {
    isOpen: !hasVisited,
  }

  render() {
    const { isOpen } = this.state;

    return (
      <main className="app-container">
        <Modal
          size="small"
          open={isOpen}
          onClose={() => {
            this.setState({ isOpen: false });
          }}
          closeOnDimmerClick
          basic
        >
          <Modal.Header>If this is your first time visiting this web application,<br /> we recommend you to watch this instructional video first</Modal.Header>
          <Modal.Content style={{ height: '60vh' }}>
            <iframe
              src="https://www.youtube.com/embed/sf-R5tBzGMY?rel=0"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              style={{ width: '100%', height: '100%' }}
              allowFullScreen
            />
          </Modal.Content>
          <Modal.Actions>
            <Button
              color="red"
              onClick={() => {
                this.setState({ isOpen: false });
              }}
              inverted
              basic
            >
              <Icon name="remove" /> Close
            </Button>
          </Modal.Actions>
        </Modal>
        <Switch>
          <Route
            path={`/grid/(${sideBarRoutes})`}
            component={GridView}
            exact
            strict
          />
          <Route
            path={`/(${sideBarRoutes})?`}
            component={MapView}
            exact
          />
          <Redirect to="/" />
        </Switch>
      </main>
    );
  }
}

export default App;
