import createError from 'http-errors';
import logger from '../logger';

/**
 * Formats a response object for consistency.
 *
 * @param {object} data A payload to be provided in the response.
 * @param {string} error An custom error message to extend an error.
 * @param {string} message A custom message to be provided in the response.
 * @param {number} status An HTTP status code to be provided in the response.
 * @return {object} An object to be used in the response.
 */
export default ({
  data = null,
  error: customError,
  message = 'ok',
  status = 200
}) => {
  // if we have an error, let's formulate the message and
  // log the error for debug mode.
  if (status > 299) {
    const errorMessage = customError || message || 'fail';
    const error = createError(status, errorMessage);
    logger.error(error);

    return {
      code: error.name,
      data,
      message: errorMessage,
      status
    };
  }

  return {
    code: 'Ok',
    data,
    message,
    status
  };
};
