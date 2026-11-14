// Aggregates sub-routers and healthcheck under the /api namespace.
import { Router } from 'express';
import lessonRoutes from './lesson.routes.js';
import quizRoutes from './quiz.routes.js';
import remediationRoutes from './remediation.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

router.use('/lesson', lessonRoutes);
router.use('/quiz', quizRoutes);
router.use('/remediation', remediationRoutes);

export default router;
