import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import 'react-tippy/dist/tippy.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'rc-slider/assets/index.css';
import MapView from '../MapView';
import GridView from '../GridView';
import './styles.css';

axios.defaults.baseURL = '/api/exposed';

const sideBarRoutes = 'popular|recent|preferences|about|categories|submit|themes|sources|';

const App = () => (
  <main className="app-container">
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

export default App;
