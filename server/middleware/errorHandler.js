const errorHandler = (err, req, res, next) => {
  console.error("Error Handler - Full Error:", err);

  let error = { ...err };
  error.message = err.message;

  // Log to console for development
  if (process.env.NODE_ENV !== "production") {
    console.error("Error Stack:", err.stack);
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { message: message.join(", "), statusCode: 400 };
  }

  // Determine status code
  const statusCode =
    error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    success: false,
    error: error.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export { errorHandler };
