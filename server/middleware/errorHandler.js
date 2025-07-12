// This is a basic error handling middleware.
// It should be placed after all your routes.

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // If status is 200, it means it's a server error
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Don't send stack trace in production
  });
};

export { errorHandler };