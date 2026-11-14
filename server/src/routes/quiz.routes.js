// Quiz routes: mounts POST /api/quiz with input validation middleware.
import { Router } from 'express';
import { createQuiz } from '../controllers/quiz.controller.js';
import { validateQuizRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post('/', validateQuizRequest, createQuiz);

export default router;
