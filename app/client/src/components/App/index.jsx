import React from 'react';
import { Route } from 'react-router-dom';
import axios from 'axios';
import { Grid } from 'semantic-ui-react';
import MainMenu from '../MainMenu';
import MapView from '../MapView';
import AppSidebar from '../AppSidebar';
import RecentArticles from '../RecentArticles';
import Counter from '../Counter';
import GridLayout from '../GridView';
import './styles.css';

axios.defaults.baseURL = 'http://localhost:5000/exposed';

const App = () => (
  <Grid columns={2}>
    {/* <MainMenu /> */}
    <Grid.Column width={14} className="app-container-column">
      <main className="app-container">
        <Route exact path="/" component={MapView} />
        <Route exact path="/counter" component={Counter} />
        <Route exact path="/grid" component={GridLayout} />
      </main>
    </Grid.Column>

    <Grid.Column width={2} className="sidebar-container-column">
      <AppSidebar>
        <Route exact path="/" component={RecentArticles} />
      </AppSidebar>
    </Grid.Column>
  </Grid> 
);

export default App;
