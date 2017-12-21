import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import 'react-tippy/dist/tippy.css';
import 'semantic-ui-css/semantic.min.css';
import 'rc-slider/assets/index.css';
import MapView from '../MapView';
import AppSidebar from '../AppSidebar';
import RecentArticles from '../RecentArticles';
import PopularArticles from '../PopularArticles';
import Filter from '../Filter';
import About from '../About';
import Categories from '../Categories';
import Submit from '../Submit';
import MapThemes from '../MapThemes';
import Counter from '../Counter';
import GridLayout from '../GridView';
import './styles.css';

axios.defaults.baseURL = '/api/exposed';

const App = () => (
  <div>
    <main className="app-container">
      <Switch>
        <Route exact path="/(popular|recent|filter|about|categories|submit|themes)?" component={MapView} />
        <Route path="/counter" component={Counter} />
        <Route path="/grid" component={GridLayout} />
        <Redirect to="/" />
      </Switch>
    </main>

    <AppSidebar>
      <Switch>
        <Route path="/" exact component={PopularArticles} />
        <Route path="(.*)/popular" exact component={PopularArticles} />
        <Route path="(.*)/recent" exact component={RecentArticles} />
        <Route path="(.*)/filter" exact component={Filter} />
        <Route path="(.*)/about" exact component={About} />
        <Route path="(.*)/submit" exact component={Submit} />
        <Route path="(.*)/categories" exact component={Categories} />
        <Route path="(.*)/themes" exact component={MapThemes} />
        <Redirect to="/" />
      </Switch>
    </AppSidebar>
  </div>
);

export default App;
