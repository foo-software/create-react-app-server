import express from 'express';

export default ({ craBuildPath, req, res, next }) => {
  const hasPeriodRegEx = /[.]/;
  if (!hasPeriodRegEx.test(req.url)) {
    return next();
  } else {
    express.static(craBuildPath)(req, res, next);
  }
};
