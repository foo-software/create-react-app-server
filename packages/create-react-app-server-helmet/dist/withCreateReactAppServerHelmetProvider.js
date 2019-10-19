import React from 'react';
import { Helmet } from 'react-helmet';
import CreateReactAppServerHelmetContext from './CreateReactAppServerHelmetContext';
export default (function (Component) {
  return function (props) {
    return React.createElement(CreateReactAppServerHelmetContext.Provider, {
      value: Helmet
    }, React.createElement(Component, props));
  };
});