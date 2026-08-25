const mongoose = require('mongoose');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Middleware to validate if a route parameter is a valid MongoDB ObjectId.
 * 
 * Usage: router.get('/:id', validateObjectId, getTaskById)
 */
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return ApiResponse.badRequest(res, 'Invalid ID format');
  }
  next();
};

module.exports = validateObjectId;
