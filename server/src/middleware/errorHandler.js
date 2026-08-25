const ApiResponse = require('../utils/ApiResponse');

/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown in the application and formats them into
 * our standard ApiResponse structure. It specifically looks for common
 * Mongoose errors and translates them into 400 Bad Requests.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return ApiResponse.badRequest(res, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    return ApiResponse.badRequest(res, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return ApiResponse.badRequest(res, message);
  }

  // Default to 500 server error
  return ApiResponse.internal(res, error.message || 'Server Error');
};

module.exports = errorHandler;
