/**
 * Standardized API Response Wrapper
 *
 * Every response from the API follows a consistent envelope:
 * {
 *   success:    Boolean   – whether the request succeeded
 *   statusCode: Number    – HTTP status code
 *   message:    String    – human-readable summary
 *   data:       Any|null  – payload (null on errors)
 *   error:      Any|null  – error details (null on success)
 *   timestamp:  String    – ISO-8601 response time
 * }
 */
class ApiResponse {
  constructor(statusCode, message, data = null, error = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  /** Send the response via Express `res` */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      error: this.error,
      timestamp: this.timestamp,
    });
  }

  // ───────── Success Helpers ─────────

  static ok(res, message = 'Success', data = null) {
    return new ApiResponse(200, message, data).send(res);
  }

  static created(res, message = 'Resource created', data = null) {
    return new ApiResponse(201, message, data).send(res);
  }

  // ───────── Client-Error Helpers ─────────

  static badRequest(res, message = 'Bad request', error = null) {
    return new ApiResponse(400, message, null, error).send(res);
  }

  static notFound(res, message = 'Resource not found') {
    return new ApiResponse(404, message).send(res);
  }

  // ───────── Server-Error Helpers ─────────

  static internal(res, message = 'Internal server error', error = null) {
    return new ApiResponse(500, message, null, error).send(res);
  }
}

module.exports = ApiResponse;
