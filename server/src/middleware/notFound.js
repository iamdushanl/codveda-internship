const ApiResponse = require('../utils/ApiResponse');

/**
 * Catch-all middleware for handling requests to routes that don't exist.
 */
const notFound = (req, res, next) => {
  return ApiResponse.notFound(res, `Route not found - ${req.originalUrl}`);
};

module.exports = notFound;
