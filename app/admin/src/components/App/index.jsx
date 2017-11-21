import React from 'react';
import { Route } from 'react-router-dom';
import axios from 'axios';
import Home from '../Home';
import Users from '../Users';
import Counter from '../Counter';
import Sidebar from '../Sidebar';
import './styles.css';

axios.defaults.baseURL = 'http://localhost:5000/api';

const App = () => (
  <div>
    <Sidebar>
      <main>
        <Route exact path="/" component={Home} />
        <Route exact path="/users" component={Users} />
        <Route exact path="/counter" component={Counter} />
      </main>
    </Sidebar>
  </div>
);

export default App;
