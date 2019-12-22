import expressStaticGzip from 'express-static-gzip';

export default ({ craBuildPath, req, res, next }) => {
  const hasPeriodRegEx = /[.]/;
  if (!hasPeriodRegEx.test(req.url)) {
    return next();
  } else {
    // support brotli and gzip compression
    expressStaticGzip(craBuildPath, {
      enableBrotli: true,
      orderPreference: ['br', 'gz']
    })(req, res, next);
  }
};
