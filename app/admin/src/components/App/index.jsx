import React from 'react';
import { Route } from 'react-router-dom';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import Home from '../Home';
import Users from '../Users';
import Counter from '../Counter';
import Crawler from '../Crawler';
import Sidebar from '../Sidebar';
import './styles.css';

axios.defaults.baseURL = '/api/admin';

const App = () => (
  <div>
    <Sidebar>
      <main>
        <Route exact path="/" component={Home} />
        <Route exact path="/users" component={Users} />
        <Route exact path="/counter" component={Counter} />
        <Route exact path="/crawler" component={Crawler} />
      </main>
    </Sidebar>
  </div>
);

export default App;
