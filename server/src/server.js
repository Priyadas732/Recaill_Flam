// Server entry point: loads validated environment and boots the Express HTTP server.
import { env } from './config/env.js';
import app from './app.js';

app.listen(env.port, () => {
  console.log(`[Recall Server] Listening on http://localhost:${env.port} (${env.nodeEnv})`);
});
