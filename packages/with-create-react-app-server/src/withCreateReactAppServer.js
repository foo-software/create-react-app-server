import React, { useContext, useEffect } from 'react';
import CreateReactAppServerContext from './CreateReactAppServerContext';

export default Component => props => {
  if (!window.CREATE_REACT_APP_SERVER_PUPPETEER) {
    return <Component {...props} />;
  }

  const setRenderedString = useContext(CreateReactAppServerContext);

  useEffect(() => {
    setRenderedString();
  }, []);

  return <Component {...props} />;
};
