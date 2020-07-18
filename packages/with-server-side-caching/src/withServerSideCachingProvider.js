import React, { useRef } from 'react';
import CreateReactAppServerContext from './CreateReactAppServerContext';
import { CreateReactAppServerHelmet } from '@foo-software/create-react-app-server-helmet';

const DATA_REACT_HELMET = 'data-react-helmet';

// returns an array of attribute / value strings as they would appear
// as part of an HTML tag.
const getAttributes = data =>
  Object.keys(data).map(current =>
    data[current] !== true ? `${current}="${data[current]}"` : current
  );

// returns a string - an HTML opening tag.
const getOpeningTag = ({ attributeNames, attributes, isTitle, tagName }) => {
  const dataAttribute = !isTitle
    ? `${DATA_REACT_HELMET}="true"`
    : `${DATA_REACT_HELMET}="${attributeNames.join() || 'true'}"`;

  return `<${tagName} ${
    !attributes.length
      ? dataAttribute
      : `${attributes.join(' ')} ${dataAttribute}`
  }>`;
};

// returns a string - an HTML tag based on params.
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

// returns a string - a set of HTML tags based on params.
const getTags = ({ helmet, helmetName, tagName }) => {
  if (!helmet[helmetName].length) {
    return '';
  }

  return helmet[helmetName]
    .map(current =>
      getTag({
        data: current,
        tagName
      })
    )
    .join('');
};

// returns a string - an HTML (innerHTML) type of string from `react-helmet`.
// this string will be injected into the <head /> of the document. each method
// checks for existence of duplicates.
const getHeadString = ({ head, helmet }) => {
  const linkTags = getTags({ helmet, helmetName: 'linkTags', tagName: 'link' });
  const metaTags = getTags({ helmet, helmetName: 'metaTags', tagName: 'meta' });
  const scriptTags = getTags({
    helmet,
    helmetName: 'scriptTags',
    tagName: 'script'
  });
  const styleTags = getTags({
    helmet,
    helmetName: 'styleTags',
    tagName: 'style'
  });

  const baseTag = !helmet.baseTag.length
    ? ''
    : getTag({ data: helmet.baseTag[0], tagName: 'base' });

  // if we have a new base tag remove the old one if it existed.
  const oldBaseTag = head.getElementsByTagName('base')[0];
  if (baseTag && oldBaseTag) {
    oldBaseTag.remove();
  }

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

  // if we have a new title tag remove the old one if it existed.
  const oldTitleTag = head.getElementsByTagName('title')[0];
  if (titleTag && oldTitleTag) {
    oldTitleTag.remove();
  }

  // concatenate head html with helmet
  const helmetString =
    metaTags + baseTag + titleTag + linkTags + scriptTags + styleTags;
  const headString = head.innerHTML;

  return headString + helmetString;
};

export default Component => props => {
  // we only run the contents of this component when we're in a
  // puppeteer environment.
  if (!window.CREATE_REACT_APP_SERVER_PUPPETEER) {
    return <Component {...props} />;
  }

  // our DOM node container to get innerHTML.
  const containerEl = useRef(null);

  // expose data to window for Puppeteer to extract
  const setRenderedString = () => {
    // get a cloned version of the head element so we can manipulate
    const head = document.getElementsByTagName('head')[0].cloneNode(true);

    // merge head with helmet and workout any dupes
    window.CREATE_REACT_APP_SERVER_HEAD = getHeadString({
      head,
      helmet: CreateReactAppServerHelmet.peek()
    });
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
