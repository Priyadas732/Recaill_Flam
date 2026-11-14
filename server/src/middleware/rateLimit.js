// Rate limiter middleware using express-rate-limit to protect API endpoints (20 requests per minute per IP).
import rateLimit from 'express-rate-limit';
import { ResponseView } from '../views/response.view.js';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 20, // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json(
      ResponseView.failure({
        code: 'UPSTREAM',
        message: 'Too many requests. Please wait a minute before trying again.',
      })
    );
  },
});
