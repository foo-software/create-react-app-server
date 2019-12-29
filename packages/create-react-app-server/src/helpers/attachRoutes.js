import createReactApp from '../routes/createReactApp';
import logger from '../logger';
import createReactAppServerHealth from '../routes/createReactAppServerHealth';
import getCompressedHeaders from './getCompressedHeaders';
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

  // fallback
  app.use((req, res) => {
    // fallback to 200 status. 404s should be intentionally set via
    // `create-react-app-server-status`
    const status = 200;

    // add the url to the store so we request it directly next time
    addUrl({ path: buildIndex, status, url: req.url });

    const acceptEncoding = req.header('Accept-Encoding');
    const compressedHeaders = getCompressedHeaders(acceptEncoding);
    return res.status(status).sendFile(buildIndex, { headers: compressedHeaders });
  });

  // error handling
  app.use((error, req, res, next) => {
    logger.error(error);

    // serve 500 unless it was a timeout, then 404
    const status = error && error.name === 'TimeoutError'
      ? 404
      : 500;

    // add the url to the store so we request it directly next time
    addUrl({ path: buildIndex, status, url: req.url });

    // if opted in - we set a header with the error
    if (options.setErrorHeader) {
      res.set(HEADER_ERROR, error);
    }

    return res.status(status).sendFile(buildIndex, { headers: compressedHeaders });
  });
};
