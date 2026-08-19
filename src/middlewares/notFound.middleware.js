import ApiError from "../utils/ApiError.js";

const notFoundMiddleware = (
  req,
  res,
  next
) => {
  next(
    new ApiError(
      404,
      `Route ${req.originalUrl} not found`
    )
  );
};

export default notFoundMiddleware;