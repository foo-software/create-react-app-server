import React from 'react';
import ReactDOM from 'react-dom';
import { withServerSideCachingProvider } from '@foo-software/with-server-side-caching';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const AppWithServerSideCaching = withServerSideCachingProvider(App);
const rootElement = document.getElementById('root');
const render = !rootElement.hasChildNodes()
  ? ReactDOM.render
  : ReactDOM.hydrate;

render(<AppWithServerSideCaching />, rootElement);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
