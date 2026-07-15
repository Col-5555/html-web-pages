// 404 for any route that didn't match. Mounted after all routers.
export const notFound = (req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
};

// Central error handler (must keep all four args so Express treats it as an
// error handler). Controllers/services throw an error with an optional
// `.status`; anything without one is treated as a 500.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ message: err.message || "Internal server error" });
};
