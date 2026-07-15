// Builds an Error carrying an HTTP status, which the central error handler reads
// to set the response code. e.g. `throw httpError(404, "Coder not found")`.
export const httpError = (status, message) =>
  Object.assign(new Error(message), { status });
