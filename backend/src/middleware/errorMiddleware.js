const errorMiddleware = (
  err,
  req,
  res,
  next
) => {
  console.error("API Error:", {
    message: err.message,
    method: req.method,
    path: req.originalUrl,
  });

  const statusCode =
    err.statusCode ||
    err.status ||
    500;

  const message =
    statusCode === 500
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;