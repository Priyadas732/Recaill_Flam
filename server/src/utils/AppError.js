// Typed application error class with predefined error codes and HTTP status mappings.

export class AppError extends Error {
  /**
   * @param {'TIMEOUT' | 'BAD_JSON' | 'BAD_SHAPE' | 'EMPTY' | 'UPSTREAM' | 'BAD_INPUT'} code
   * @param {string} message
   * @param {number} [httpStatus=500]
   */
  constructor(code, message, httpStatus = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
  }
}
