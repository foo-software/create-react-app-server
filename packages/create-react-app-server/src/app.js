import express from 'express';
import logger from 'morgan';
import attachRoutes from './helpers/attachRoutes';
import staticMiddleware from './middleware/static';

const isDebug = process.env.LOG_LEVEL === 'debug';

export default (options) => {
  const app = express();

  // log all requests if in debug mode, otherwise only errors
  app.use(
    logger('dev', {
      skip: (req, res) => !isDebug && res.statusCode < 400
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // static files
  app.use('/', (req, res, next) =>
    staticMiddleware({ craBuildPath: options.craBuildPath, req, res, next })
  );

  // @TODO: allow option to pass in middleware.

  // attach routing
  attachRoutes({ app, options });

  return app;
};
