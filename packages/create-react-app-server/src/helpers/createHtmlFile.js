import fs from 'fs';
import logger from '../logger';

const LOGGER_NAMESPACE = 'createHtmlFile';

/**
 * @param {String} head A string of HTML to be inserted in the <head>
 * @param {String} head A string of HTML to be inserted in <div id="root">
 * @param {String} templatePath A path to template HTML file (most likely index.html)
 * @param {String} path A path to output the file
 */
export default ({ head, html, templatePath, path }) => {
  // split the html assuming a standard CRA app with <div id="root"></div>
  const [beginningHtml, endingHtml] = fs
    .readFileSync(templatePath)
    .toString()
    .split(/(?<=id="root">)/);

  // inject html
  let updatedHtml = [beginningHtml, html, endingHtml].join('');

  // update <head> if we have it
  if (head) {
    const [beforeClosingHead, closingHeadAndAfter] = updatedHtml.split(
      /(?=<\/head>)/
    );

    logger.debug(`${LOGGER_NAMESPACE}: beforeClosingHead: \n\n${beforeClosingHead}\n\n`);
    logger.debug(`${LOGGER_NAMESPACE}: head: \n\n${head}\n\n`);
    logger.debug(`${LOGGER_NAMESPACE}: closingHeadAndAfter: \n\n${closingHeadAndAfter}\n\n`);

    updatedHtml = [beforeClosingHead, head, closingHeadAndAfter].join('');
    logger.debug(`${LOGGER_NAMESPACE}: updated html with head`);
  }

  // get the full directory path by removing the last part of the path
  const directoryPath = path.substring(0, path.lastIndexOf('/'));
  fs.mkdirSync(directoryPath, { recursive: true });
  fs.writeFileSync(path, updatedHtml);

  logger.debug(`${LOGGER_NAMESPACE}: file created at ${path}`);

  return path;
};
