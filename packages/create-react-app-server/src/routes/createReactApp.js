import createHtmlFile from '../helpers/createHtmlFile';
import logger from '../logger';
import { addUrl, getUrl } from '../store';
import { getDomHtml } from '../puppeteer';
import { FILENAME_PUPPETEER, HEADER_PUPPETEER } from '../constants';

const LOGGER_NAMESPACE = 'createReactApp';

/**
 * an Express route. we determine if we have an HTML file to server
 * side render. this is an efficient check to an in memory object and
 * if we have one - we return it immediately. if we don't - utilize
 * Puppeteer to fetch client side HTML, and populate it in a new HTML
 * we save to disk. since the request could be coming from Puppeteer
 * - we handle that case by serving a copy of the original HTML file,
 * to mimic the CRA render (client side).
 *
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Object} options A set of options defined by the user.
 */
export default async ({ req, res, next, options }) => {
  let routeError;

  try {
    const [, secondCharacter] = req.url.split('');
    const isHome = req.url === '/' || secondCharacter === '?';

    // if we're on the home page
    const url = isHome ? req.url.replace('/', '/index') : req.url;
    logger.debug(`${LOGGER_NAMESPACE}: url: ${url}`);

    // we check our in-memory store. if we have the html file - serve it
    const storeUrlItem = getUrl(url);

    if (storeUrlItem) {
      logger.debug(
        `${LOGGER_NAMESPACE}: serving from cache: ${url}`,
        storeUrlItem
      );
      if (storeUrlItem.status !== 200) {
        return res.status(storeUrlItem.status).sendFile(storeUrlItem.path);
      }

      // we don't assign a status, so we can let the server use its default behavior.
      return res.sendFile(storeUrlItem.path);
    } else if (req.headers[HEADER_PUPPETEER]) {
      // else if the request is coming from puppeteer - mimic cra
      logger.debug(`${LOGGER_NAMESPACE}: serving for puppeteer: ${url}`);
      return res.sendFile(`${options.craBuildPath}/${FILENAME_PUPPETEER}`);
    } else {
      // else - we don't have this html file yet, so we need to create one
      let shouldRunPuppeteer = true;

      // if the url doesn't fit into the acceptable patterns we won't create html
      if (options.urlPatterns && options.urlPatterns.length) {
        // example urlPatterns: ['^((?!/api).)*$']
        for (const urlPatternString of options.urlPatterns) {
          const urlPattern = new RegExp(urlPatternString);
          if (!urlPattern.test(req.url)) {
            logger.debug(
              `${LOGGER_NAMESPACE}: url doesn't match specified patterns: ${url}`
            );
            shouldRunPuppeteer = false;
            break;
          }
        }
      }

      // if we want to create a new html file, utilize puppeteer
      if (shouldRunPuppeteer) {
        const { address, port } = global.CREATE_REACT_APP_SERVER_ADDRESS;
        const host = options.host ||
          (address.split('')[0] === ':'
            ? `http://[${address}]:${port}`
            : `http://${address}:${port}`);

        logger.debug(`${LOGGER_NAMESPACE}: running puppeteer on ${host}`);

        // get the cra dom and head string from Puppeteer if applicable
        const { head, html, status } = await getDomHtml({
          // 10 seconds should be sufficient for pages without side effects
          timeout: options.puppeteerTimeout || 10000,
          url: `${host}${!isHome ? url : req.url}`
        });

        if (head || html) {
          const filename = !isHome ? `${url}.html` : '/home.html';
          const path = `${options.craBuildPath}${filename}`;
          createHtmlFile({
            head,
            html,
            templatePath: `${options.craBuildPath}/index.html`,
            path
          });

          // save the url so we request the file directly next time
          addUrl({ path, status, url });

          // respond with our new html file
          if (!status || status === 200) {
            return res.sendFile(path);
          }
          return res.status(status).sendFile(path);
        }
      }
    }
  } catch (error) {
    routeError = error;
  }

  // if we have no error or if it's a timeout error, we can serve a 404
  if (!routeError || routeError.name === 'TimeoutError') {
    next();
  } else {
    next(routeError);
  }
};
