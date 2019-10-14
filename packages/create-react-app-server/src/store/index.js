import logger from '../logger';

const LOGGER_NAMESPACE = 'store';

const store = {
  urls: {}
};

export const getUrl = key => {
  logger.debug(`${LOGGER_NAMESPACE}: getUrl: ${key}`, store.urls[key]);
  return store.urls[key];
};

export const addUrl = data => {
  store.urls[data.url] = data;
  logger.debug(`${LOGGER_NAMESPACE}: addUrl`, data);
  return true;
};
