import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route as RouterRoute,
  Link
} from 'react-router-dom';
import { CreateReactAppServerHelmet } from '@foo-software/create-react-app-server-helmet';
import { withServerSideCaching } from '@foo-software/with-server-side-caching';
import logo from './logo.svg';
import './App.css';

const Route = withServerSideCaching(RouterRoute);

function App() {
  return (
    <Router>
      <div className="App">
        <CreateReactAppServerHelmet>
          <title>React App</title>
        </CreateReactAppServerHelmet>
        <header className="App-header">
          <Switch>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/users">
              <Users />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/users">Users</Link>
              </li>
            </ul>
          </nav>
        </header>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <>
      <CreateReactAppServerHelmet>
        <title>Home</title>
      </CreateReactAppServerHelmet>
      <h2>Home</h2>
    </>
  );
}

function About() {
  return (
    <>
      <CreateReactAppServerHelmet>
        <title>About</title>
      </CreateReactAppServerHelmet>
      <h2>About</h2>
    </>
  );
}

function Users() {
  return (
    <>
      <CreateReactAppServerHelmet>
        <title>Users</title>
      </CreateReactAppServerHelmet>
      <h2>Users</h2>
    </>
  );
}

export default App;
