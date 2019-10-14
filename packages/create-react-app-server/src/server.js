import fs from 'fs';
import http from 'http';
import path from 'path';
import shell from 'shelljs';
import createApp from './app';
import logger from './logger';
import {
  CREATE_REACT_APP_SERVER_PUPPETEER,
  FILENAME_PUPPETEER
} from './constants';

const LOGGER_NAMESPACE = 'server';
const CRA_BUILD_DIRECTORY = 'cra-build';

// fetch CRA build. copies files locally, but eventually we'll want
// the option to fetch from a remote source like S3.
const moveBuildFiles = ({ craBuildPath }) => {
  const craAppBuildPath = path.resolve(`./${CRA_BUILD_DIRECTORY}`);
  logger.debug(
    `${LOGGER_NAMESPACE}: moveBuildFiles: craAppBuildPath: ${craAppBuildPath}`
  );

  shell.exec(`mkdir -p ${craAppBuildPath}`);

  // copy contents of build directory
  shell.exec(`cp -R ${craBuildPath}/. ${craAppBuildPath}`);

  const indexPath = `${craAppBuildPath}/index.html`;
  const templatePathPuppeteer = `${craAppBuildPath}/${FILENAME_PUPPETEER}`;

  // split the dom after opening <head>
  const [beginningHtml, endingHtml] = fs
    .readFileSync(indexPath)
    .toString()
    .split(/(?<=<head>)/);

  // window property so cra will know it's being requested by Puppeteer
  const windowSetHtml = `
    <script>window.${CREATE_REACT_APP_SERVER_PUPPETEER} = true</script>
  `;

  // add the window property and join resulting html as a string
  const updatedHtml = [beginningHtml, windowSetHtml, endingHtml].join('');
  fs.writeFileSync(templatePathPuppeteer, updatedHtml);
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

const onError = error => {
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

export const startServer = async ({ craBuildPath, ...options }) => {
  if (!craBuildPath) {
    throw new Error('build path is undefined.');
  }

  moveBuildFiles({ craBuildPath });

  const app = createApp({
    ...options,
    craBuildPath
  });

  const port = normalizePort(options.port || '3000');
  app.set('port', port);

  const server = http.createServer(app);

  server.listen(port);
  server.on('error', onError);
  server.on('listening', () => onListening(server));
};
