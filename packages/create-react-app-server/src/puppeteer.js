import puppeteer from 'puppeteer';
import { HEADER_PUPPETEER } from './constants';
import logger from './logger';

const LOGGER_NAMESPACE = 'puppeteer';

let isRunning = false;

const RETRY_DELAY = 5000;
const delay = () => new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

export const getDomHtml = async ({ timeout, url }) => {
  const LOGGER_NAMESPACE_FUNCTION = `${LOGGER_NAMESPACE}: getDomHtml`;
  // we can only run puppeteer if it's not already running
  if (isRunning) {
    logger.debug(`${LOGGER_NAMESPACE_FUNCTION}: puppeteer is running already`);
    await delay();
    return getDomHtml({ url });
  }

  isRunning = true;

  logger.debug(`${LOGGER_NAMESPACE_FUNCTION}: launching browser`);
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  logger.debug(`${LOGGER_NAMESPACE_FUNCTION}: launched successfully`);

  browser.on('disconnected', () => {
    isRunning = false;
  });

  const close = async () => {
    await browser.close();
    logger.debug(`${LOGGER_NAMESPACE_FUNCTION}: browser closed`);
  };

  let data;
  try {
    const page = await browser.newPage();
    logger.debug(`${LOGGER_NAMESPACE_FUNCTION}: new page created successfully`);

    page.setDefaultTimeout(timeout);
    page.setDefaultNavigationTimeout(timeout);

    await page.setExtraHTTPHeaders({ [HEADER_PUPPETEER]: 'true' });
    logger.debug(`${LOGGER_NAMESPACE_FUNCTION}: headers set successfully`, {
      [HEADER_PUPPETEER]: 'true'
    });

    await page.goto(url);
    logger.debug(`${LOGGER_NAMESPACE_FUNCTION}: page.goto success`, url);

    logger.debug(`${LOGGER_NAMESPACE_FUNCTION}: waiting`);
    await page.waitForFunction(() => 'CREATE_REACT_APP_SERVER_DOM' in window);
    logger.debug(`${LOGGER_NAMESPACE_FUNCTION}: wait complete, page is ready`);

    data = await page.evaluate(() =>
      JSON.stringify({
        head: window.CREATE_REACT_APP_SERVER_HEAD || '',
        html: window.CREATE_REACT_APP_SERVER_DOM || ''
      })
    );

    await close();
  } catch (error) {
    // catch the error so we can properly shut down if needed
    if (isRunning) {
      logger.debug(
        `${LOGGER_NAMESPACE_FUNCTION}: error caught but still running. closing now`
      );
      await close();
    }

    // we still want to bubble the error up
    throw error;
  }

  const { head, html } = JSON.parse(data);
  logger.debug(`${LOGGER_NAMESPACE_FUNCTION}: data success`, { head, html });

  isRunning = false;

  return { head, html };
};
