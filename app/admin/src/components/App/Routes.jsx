import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Login from '../Login';
import Home from '../Home';
import Users from '../Users';
import Crawler from '../Crawler';
import NewsSources from '../NewsSources';

export default ({ isLogin }) => (
  <main>
    {isLogin
      ? (
        <div>
          <Route exact path="/" component={Home} />
          <Route exact path="/users" component={Users} />
          <Route exact path="/crawler" component={Crawler} />
          <Route exact path="/sources" component={NewsSources} />
          <Redirect to="/" />
        </div>
        )
      : (
        <div>
          <Route path="/" component={Login} />
          <Redirect to="/" />
        </div>
      )}
  </main>
);
