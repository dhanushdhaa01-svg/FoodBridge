/**
 * ApiResponse
 *
 * Standardizes all successful API responses to a consistent JSON contract:
 * { success: true, message: string, data: object | null }
 *
 * Usage:
 *   res.status(200).json(new ApiResponse(200, 'User fetched.', { user }));
 *   res.status(201).json(new ApiResponse(201, 'Account created.', { user, token }));
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (2xx)
   * @param {string} message    - Human-readable success message
   * @param {*}      data       - Response payload (null if no data to return)
   */
  constructor(statusCode, message, data = null) {
    this.success = statusCode >= 200 && statusCode < 400;
    this.message = message;

    // Only include `data` key when there is actual data to return
    if (data !== null && data !== undefined) {
      this.data = data;
    }
  }
}

export default ApiResponse;
