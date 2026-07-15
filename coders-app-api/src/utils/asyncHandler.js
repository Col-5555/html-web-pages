// Wraps an async controller so any rejected promise is forwarded to Express's
// error handler instead of crashing the process. Express 5 already forwards
// async errors, but wrapping keeps the intent explicit and portable.
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
