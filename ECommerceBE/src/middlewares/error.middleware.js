import logger from "../config/logger.js";

const errorMiddleware = (
  err,
  req,
  res,
  next
) => {
    let statusCode = err.statusCode || 500;

  let message =
    err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid Mongo ID";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
  }

  logger.error({
    requestId: req.requestId,

    method: req.method,

    url: req.originalUrl,

    message: err.message,

    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors:err.errors || [],
  });
};

export default errorMiddleware;