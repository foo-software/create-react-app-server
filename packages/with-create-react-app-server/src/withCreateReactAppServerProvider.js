import React from 'react';
import ReactDOMServer from 'react-dom/server';
import CreateReactAppServerContext from './CreateReactAppServerContext';
import {
  CreateReactAppServerHelmet
} from '@foo-software/create-react-app-server-helmet';

const DATA_REACT_HELMET = 'data-react-helmet';

const getAttributes = data =>
  Object.keys(data).map(current =>
    data[current] !== true ? `${current}="${data[current]}"` : current
  );

const getOpeningTag = ({ attributeNames, attributes, isTitle, tagName }) => {
  const dataAttribute = !isTitle
    ? `${DATA_REACT_HELMET}="true"`
    : `${DATA_REACT_HELMET}="${attributeNames.join()}"`;

  return `<${tagName} ${
    !attributes.length
      ? dataAttribute
      : `${attributes.join(' ')} ${dataAttribute}`
  }>`;
};

const getTag = ({ data, isTitle, tagName }) => {
  const { cssText, innerHTML, ...rest } = data;

  const attributes = getAttributes(rest);

  let tag = getOpeningTag({
    attributeNames: Object.keys(rest),
    attributes,
    isTitle,
    tagName
  });

  const contents = cssText || innerHTML;

  if (contents) {
    // remove multiple spaces and space from start and ending
    tag = `${tag}${contents.replace(/\s\s+/g, ' ').trim()}</${tagName}>`;
  }

  return tag;
};

const getTags = ({ helmet, helmetName, tagName }) => {
  if (!helmet[helmetName].length) {
    return '';
  }

  return helmet[helmetName]
    .map(current =>
      getTag({
        data: current,
        tagName,
      })
    )
    .join('');
};

const getHelmetString = helmet => {
  const linkTags = getTags({ helmet, helmetName: 'linkTags', tagName: 'link' });
  const metaTags = getTags({ helmet, helmetName: 'metaTags', tagName: 'meta' });
  const scriptTags = getTags({ helmet, helmetName: 'scriptTags', tagName: 'script' });
  const styleTags = getTags({ helmet, helmetName: 'styleTags', tagName: 'style' });

  const baseTag = !helmet.baseTag.length
    ? ''
    : getTag({ data: helmet.baseTag[0], tagName: 'base' });

  const titleTag = !helmet.title
    ? ''
    : getTag({
        data: {
          ...helmet.titleAttributes,
          innerHTML: helmet.title
        } || { innerHTML: helmet.title },
        tagName: 'title',
        isTitle: true
      });

  return titleTag + baseTag + linkTags + metaTags + scriptTags + styleTags;
};

export default Component => props => {
  if (!window.CREATE_REACT_APP_SERVER_PUPPETEER) {
    return <Component {...props} />;
  }

  const setRenderedString = () => {
    window.CREATE_REACT_APP_SERVER_HEAD = getHelmetString(CreateReactAppServerHelmet.peek());
    window.CREATE_REACT_APP_SERVER_DOM = ReactDOMServer.renderToString(<Component {...props} />);
  };

  return (
    <CreateReactAppServerContext.Provider
      value={setRenderedString}
    >
      <Component {...props} />
    </CreateReactAppServerContext.Provider>
  );
};
