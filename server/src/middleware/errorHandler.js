// Global error handler: formats all errors into failure() response without leaking stack traces or secrets.
import { AppError } from '../utils/AppError.js';
import { ResponseView } from '../views/response.view.js';

export function errorHandler(err, req, res, next) {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.httpStatus : (err.status || 500);
  const code = isAppError ? err.code : 'UPSTREAM';

  // Sanitize message: never leak stack traces or raw upstream credentials
  const message = isAppError
    ? err.message
    : 'An unexpected server error occurred. Please try again.';

  // Safe logging: log path and code without printing request body or API key
  console.error(`[API Error] ${req.method} ${req.path} - ${code} (${status})`);

  return res.status(status).json(
    ResponseView.failure({
      code,
      message,
    })
  );
}
