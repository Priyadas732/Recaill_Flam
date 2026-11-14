// Express app configuration: CORS for Vite dev server, 1MB JSON limit, rate limiting, and error handling.
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Allow Vite dev origin
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

// JSON body parser with strict 1MB limit
app.use(express.json({ limit: '1mb' }));

// Rate limit API endpoints
app.use('/api', apiLimiter);

// Mount all routes under /api (includes /api/health)
app.use('/api', routes);

// Final centralized error handler
app.use(errorHandler);

export default app;
