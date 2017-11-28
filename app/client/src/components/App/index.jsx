import React from 'react';
import { Route } from 'react-router-dom';
import axios from 'axios';
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
      <Route exact path="/" component={MapView} />
      <Route exact path="/counter" component={Counter} />
      <Route exact path="/grid" component={GridLayout} />
    </main>

    <AppSidebar>
      <Route to="/" component={RecentArticles} />
      <Route to="/" component={TestComponent} />
      <Route to="/" component={RecentArticles} />
    </AppSidebar>
  </div>
);

export default App;
