import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import MapView from '../MapView';
import AppSidebar from '../AppSidebar';
import RecentArticles from '../RecentArticles';
import TestComponent from '../TestComponent';
import Counter from '../Counter';
import GridLayout from '../GridView';
import './styles.css';

axios.defaults.baseURL = 'http://localhost:5000/exposed';

const App = () => (
  <div>
    <main className="app-container">
      <Switch>
        <Route exact path="/(top|recent)?" component={MapView} />
        <Route path="/counter" component={Counter} />
        <Route path="/grid" component={GridLayout} />
        <Redirect to="/" />
      </Switch>
    </main>

    <AppSidebar>
      <Switch>
        <Route path="(.*)/recent" exact component={RecentArticles} />
        <Route path="/(.*)/" exact component={TestComponent} />
        <Redirect to="/" />
      </Switch>
    </AppSidebar>
  </div>
);

export default App;
