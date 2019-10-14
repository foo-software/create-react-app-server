import winston from 'winston';
import { PACKAGE_NAME } from './constants';

const level = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level,
  name: PACKAGE_NAME,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      json: true
    })
  ]
});

export default logger;
