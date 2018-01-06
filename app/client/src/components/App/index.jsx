import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import 'react-tippy/dist/tippy.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'rc-slider/assets/index.css';
import MapView from '../MapView';
import AppSidebar from '../AppSidebar';
import RecentArticles from '../RecentArticles';
import PopularArticles from '../PopularArticles';
import Filter from '../Filter';
import About from '../About';
import Categories from '../Categories';
import Submit from '../Submit';
import Insights from '../Insights';
import MapThemes from '../MapThemes';
import Counter from '../Counter';
// import GridLayout from '../GridView';
import './styles.css';

axios.defaults.baseURL = '/api/exposed';

const App = () => (
  <div>
    <main className="app-container">
      <Switch>
        <Route
          path="/(popular|recent|preferences|about|categories|submit|themes)?"
          component={MapView}
          exact
        />
        <Route path="/counter" component={Counter} />
        {/* <Route path="/grid" component={GridLayout} /> */}
        <Redirect to="/" />
      </Switch>
    </main>

    <AppSidebar topChildren={<Insights />}>
      <Switch>
        <Route path="/" component={PopularArticles} exact />
        <Route path="(.*)/popular" component={PopularArticles} exact />
        <Route path="(.*)/recent" component={RecentArticles} exact />
        <Route path="(.*)/preferences" component={Filter} exact />
        <Route path="(.*)/about" component={About} exact />
        <Route path="(.*)/submit" component={Submit} exact />
        <Route path="(.*)/categories" component={Categories} exact />
        <Route path="(.*)/themes" component={MapThemes} exact />
        <Redirect to="/" />
      </Switch>
    </AppSidebar>
  </div>
);

export default App;
