#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import logger from '../logger';
import { convertOptionsFromArguments } from '../helpers/arguments';
import { PACKAGE_NAME } from '../constants';
import { startServer } from '../server';

const LOGGER_NAMESPACE = PACKAGE_NAME;

const defaultOptions = {
  buildPath: {
    type: 'string',
    value: process.env.CREATE_REACT_APP_SERVER_BUILD_PATH
  },
  configFile: {
    type: 'string',
    value: process.env.CREATE_REACT_APP_SERVER_CONFIG_FILE
  },
  compression: {
    type: 'boolean',
    value: process.env.CREATE_REACT_APP_SERVER_COMPRESSION || true
  },
  compressionIsConcurrent: {
    type: 'boolean',
    value: process.env.CREATE_REACT_APP_SERVER_COMPRESSION_IS_CONCURRENT
  },
  compressionIsGraceful: {
    type: 'boolean',
    value: process.env.CREATE_REACT_APP_SERVER_COMPRESSION_IS_GRACEFUL
  },
  host: {
    type: 'string',
    value: process.env.CREATE_REACT_APP_SERVER_HOST
  },
  port: {
    type: 'string',
    value: process.env.PORT || process.env.CREATE_REACT_APP_SERVER_PORT
  },
  urlPatterns: {
    type: 'array',
    value: process.env.CREATE_REACT_APP_SERVER_URL_PATTERNS
  }
};

// override options with any that are passed in as arguments
let options = convertOptionsFromArguments(defaultOptions);

if (options.configFile) {
  const configFile = path.resolve(options.configFile);
  logger.debug(
    `${LOGGER_NAMESPACE}: reading options from config file at ${configFile}`
  );

  let configJson;
  try {
    const configJsonString = fs.readFileSync(configFile).toString();
    configJson = JSON.parse(configJsonString);
  } catch (error) {
    logger.error(error);
    throw new Error('error reading config file');
  }

  if (configJson.buildPath) {
    const configDirectoryPath = configFile.substring(
      0,
      configFile.lastIndexOf('/')
    );
    configJson.buildPath = path.resolve(
      `${configDirectoryPath}/${configJson.buildPath}`
    );
  }

  // extend params with config json file contents
  options = {
    ...options,
    ...configJson
  };
}

logger.debug(`${LOGGER_NAMESPACE}: options`, options);

startServer(options);
