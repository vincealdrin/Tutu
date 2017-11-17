import React from 'react';
import { Route, Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import Home from '../Home';
import Counter from '../Counter';

const App = () => (
  <div>
    <Menu>
      <Menu.Item name="home" to="/" as={Link} />
      <Menu.Item name="counter" to="/counter" as={Link} />
    </Menu>

    <main>
      <Route exact path="/" component={Home} />
      <Route exact path="/counter" component={Counter} />
    </main>
  </div>
);

export default App;
