import React, { useRef } from 'react';
import CreateReactAppServerContext from './CreateReactAppServerContext';

export default Component => props => {
  // we only run the contents of this component when we're in a
  // puppeteer environment.
  if (!window.CREATE_REACT_APP_SERVER_PUPPETEER) {
    return <Component {...props} />;
  }

  // our DOM node container to get innerHTML
  const containerEl = useRef(null);

  // expose data to window for Puppeteer to extract
  const setRenderedString = () => {
    window.CREATE_REACT_APP_SERVER_HEAD = document.getElementsByTagName(
      'head'
    )[0].innerHTML;
    console.log(
      'window.CREATE_REACT_APP_SERVER_HEAD',
      window.CREATE_REACT_APP_SERVER_HEAD
    );
    window.CREATE_REACT_APP_SERVER_DOM = containerEl.current.innerHTML;
  };

  return (
    <CreateReactAppServerContext.Provider value={setRenderedString}>
      <div ref={containerEl} id="withServerSideCaching">
        <Component {...props} />
      </div>
    </CreateReactAppServerContext.Provider>
  );
};
