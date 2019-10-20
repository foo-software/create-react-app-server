import React, { useContext, useEffect } from 'react';
import CreateReactAppServerContext from './CreateReactAppServerContext';

export default Component => props => {
  // we only run the contents of this component when we're in a
  // puppeteer environment.
  if (!window.CREATE_REACT_APP_SERVER_PUPPETEER) {
    return <Component {...props} />;
  }

  // we pull this function out of context, which will cache the entire
  // React DOM tree when called and save in a publicly exposed variable.
  const setRenderedString = useContext(CreateReactAppServerContext);

  useEffect(() => {
    setRenderedString();
  }, []);

  return <Component {...props} />;
};
