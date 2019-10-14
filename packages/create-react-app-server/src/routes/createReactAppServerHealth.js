import getResponse from '../helpers/getResponse';

/**
 * An Express route.
 *
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @return {undefined}
 */
export default (req, res) => {
  const status = 200;
  return res.status(status).json(
    getResponse({
      data: { ok: true },
      message: 'Success!',
      status
    })
  );
};
