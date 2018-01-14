import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Login from '../Login';
import Home from '../Home';
import Users from '../Users';
import Crawler from '../Crawler';
import Articles from '../Articles';
import NewsSources from '../NewsSources';

export default ({ isLogin }) => (
  <main>
    {isLogin
      ? (
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/users" component={Users} />
          <Route exact path="/articles" component={Articles} />
          <Route exact path="/crawler" component={Crawler} />
          <Route exact path="/sources" component={NewsSources} />
          <Redirect to="/" />
        </Switch>
        )
      : (
        <Switch>
          <Route path="/" component={Login} />
          <Redirect to="/" />
        </Switch>
      )}
  </main>
);
