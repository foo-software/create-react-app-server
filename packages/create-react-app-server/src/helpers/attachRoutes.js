import createReactApp from '../routes/createReactApp';
import logger from '../logger';
import createReactAppServerHealth from '../routes/createReactAppServerHealth';
import { addUrl } from '../store';
import { HEADER_ERROR } from '../constants';

/**
 * Attaches routes to our Express route and error handling.
 *
 * @param {Object} app An instance of Express.
 * @param {Object} options A set of options defined by the user.
 */
export default ({ app, options }) => {
  app.get('/create-react-app-server/health', createReactAppServerHealth);
  app.get('/*', (req, res, next) =>
    createReactApp({ req, res, next, options })
  );

  const buildIndex = `${options.craBuildPath}/index.html`;

  // @TODO - allow an option for 404 and 5xx files.

  // 404
  app.use((req, res) => {
    const status = 404;

    // add the url to the store so we request it directly next time
    addUrl({ path: buildIndex, status, url: req.url });

    return res.status(status).sendFile(buildIndex);
  });

  // error handling
  app.use((error, req, res, next) => {
    logger.error(error);

    const status = 500;

    // add the url to the store so we request it directly next time
    addUrl({ path: buildIndex, status, url: req.url });

    // if opted in - we set a header with the error
    if (options.setErrorHeader) {
      res.set(HEADER_ERROR, error);
    }

    return res.status(status).sendFile(buildIndex);
  });
};
