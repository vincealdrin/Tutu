import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Login from '../Login';
import Home from '../Home';
import Users from '../Users';
import Crawler from '../Crawler';
import Articles from '../Articles';
import NewsSources from '../NewsSources';

export default ({ isLogin, user = { role: '' } }) => {
  if (isLogin && user.role !== 'superadmin') {
    return (
      <Switch>
        <Route exact path="/" component={NewsSources} />
        <Redirect to="/" />
      </Switch>
    );
  }

  if (isLogin) {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/users" component={Users} />
        <Route exact path="/articles" component={Articles} />
        <Route exact path="/crawler" component={Crawler} />
        <Route exact path="/sources" component={NewsSources} />
        <Redirect to="/" />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Redirect to="/" />
    </Switch>
  );
};
