import expressStaticGzip from 'express-static-gzip';

export default ({ craBuildPath, req, res, next }) => {
  const hasPeriodRegEx = /[.]/;
  if (!hasPeriodRegEx.test(req.url)) {
    return next();
  } else {
    // support brotli and gzip compression
    expressStaticGzip(craBuildPath, {
      enableBrotli: true,
      orderPreference: ['br', 'gz'],

      // cache for one year because we use hashes
      maxAge: 31536000,
    })(req, res, next);
  }
};
