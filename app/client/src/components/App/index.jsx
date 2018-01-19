import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import 'react-tippy/dist/tippy.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'rc-slider/assets/index.css';
import MapView from '../MapView';
import './styles.css';

axios.defaults.baseURL = '/api/exposed';

const App = () => (
  <main className="app-container">
    <Switch>
      <Route
        path="/(popular|recent|preferences|about|categories|submit|themes|sources)?"
        component={MapView}
        exact
      />
      <Redirect to="/" />
    </Switch>
  </main>
);

export default App;
