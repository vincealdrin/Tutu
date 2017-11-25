import React from 'react';
import { Route } from 'react-router-dom';
import axios from 'axios';
import MainMenu from '../MainMenu';
import MapView from '../MapView';
import Counter from '../Counter';
import GridLayout from '../GridView';
import './styles.css';

axios.defaults.baseURL = 'http://localhost:5000/exposed';

const App = () => (
  <div>
    {/* <MainMenu /> */}

    <main className="container">
      <Route exact path="/" component={MapView} />
      <Route exact path="/counter" component={Counter} />
      <Route exact path="/grid" component={GridLayout} />
    </main>
  </div>
);

export default App;
