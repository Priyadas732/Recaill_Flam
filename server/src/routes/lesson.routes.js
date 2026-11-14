// Lesson routes: mounts POST /api/lesson with input validation middleware.
import { Router } from 'express';
import { createLesson } from '../controllers/lesson.controller.js';
import { validateLessonRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post('/', validateLessonRequest, createLesson);

export default router;
