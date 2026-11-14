// Loads and validates environment variables; fails fast if required secrets are missing.
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Attempt to load .env from cwd and from the server package root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
  throw new Error('[FATAL] Missing required environment variable: GEMINI_API_KEY in server/.env');
}

export const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY.trim(),
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || process.env.REQUEST_TIMEOUT_MS, 10) || 60000,
  aiTimeoutMs: parseInt(process.env.AI_TIMEOUT_MS || process.env.REQUEST_TIMEOUT_MS, 10) || 60000,
};
