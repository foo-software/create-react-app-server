import fs from 'fs';
import path from 'path';
import http from 'http';
import createApp from './app';
import compress from './helpers/compress';
import logger from './logger';
import {
  DEFAULT_BUILD_PATH,
  FILENAME_PUPPETEER
} from './constants';

const LOGGER_NAMESPACE = 'server';

// create an HTML file to render on Puppeteer runs
const createPuppeteerFile = ({ craBuildPath }) => {
  const indexPath = `${craBuildPath}/index.html`;
  const templatePathPuppeteer = `${craBuildPath}/${FILENAME_PUPPETEER}`;

  // split the dom after opening <head>
  const [beginningHtml, endingHtml] = fs
    .readFileSync(indexPath)
    .toString()
    .split(/(?<=<head>)/);

  // add the window property and join resulting html as a string
  const updatedHtml = [
    beginningHtml,
    CREATE_REACT_APP_SERVER_PUPPETEER_TAG,
    endingHtml
  ].join('');

  fs.writeFileSync(templatePathPuppeteer, updatedHtml);

  logger.debug(
    `${LOGGER_NAMESPACE}: createPuppeteerFile: file created: ${templatePathPuppeteer}`
  );
};

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = ({ error, port }) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use');
      process.exit(1);
      break;

    default:
      throw error;
  }
};

const onListening = server => {
  const address = server.address();

  global.CREATE_REACT_APP_SERVER_ADDRESS = address;

  const bind =
    typeof address === 'string' ? 'pipe ' + address : 'port ' + address.port;

  logger.info(`Listening on ${bind}`);
};

export const startServer = async ({
  buildPath = DEFAULT_BUILD_PATH,
  ...options
}) => {
  const craBuildPath = path.resolve(buildPath);

  if (options.compression) {
    await compress({
      directory: craBuildPath,
      concurrent: options.compressionIsConcurrent,
      graceful: options.compressionIsGraceful,
    });
  }

  createPuppeteerFile({ craBuildPath });

  const app = createApp({
    ...options,
    craBuildPath
  });

  const port = normalizePort(options.port || '3000');
  app.set('port', port);

  const server = http.createServer(app);

  server.listen(port);
  server.on('error', error => onError({ error, port }));
  server.on('listening', () => onListening(server));
};
