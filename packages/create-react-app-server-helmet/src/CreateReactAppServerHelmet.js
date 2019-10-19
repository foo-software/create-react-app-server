import React, { useContext } from 'react';
import CreateReactAppServerHelmetContext from './CreateReactAppServerHelmetContext';

export default props => {
  const Helmet = useContext(CreateReactAppServerHelmetContext);

  return <Helmet {...props} />;
};
