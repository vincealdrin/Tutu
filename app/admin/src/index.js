import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import store, { history } from './store';
import App from './components/App';

import './index.css';

const target = document.querySelector('#root');

const renderApp = () => {
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>,
    target,
  );
};

renderApp();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    renderApp();
  });
}
