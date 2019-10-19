import React, { useContext } from 'react';
import CreateReactAppServerHelmetContext from './CreateReactAppServerHelmetContext';
export default (function (props) {
  var Helmet = useContext(CreateReactAppServerHelmetContext);
  return React.createElement(Helmet, props);
});