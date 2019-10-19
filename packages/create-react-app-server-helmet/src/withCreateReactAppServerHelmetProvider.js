import React from 'react';
import { Helmet } from 'react-helmet';
import CreateReactAppServerHelmetContext from './CreateReactAppServerHelmetContext';

export default Component => props => (
  <CreateReactAppServerHelmetContext.Provider
    value={Helmet}
  >
    <Component {...props} />
  </CreateReactAppServerHelmetContext.Provider>
);
