// Controller: handles lesson generation requests. Thin: validate -> prompt -> ai -> parser -> view.
import { lessonPrompt } from '../services/prompts.js';
import { callWithRetry } from '../services/parser.service.js';
import { LessonSchema } from '../models/lesson.model.js';
import { ResponseView } from '../views/response.view.js';

export async function createLesson(req, res, next) {
  try {
    const { topic, level } = req.body;
    const { systemPrompt, userPrompt } = lessonPrompt(topic, level);

    const data = await callWithRetry({
      systemPrompt,
      userPrompt,
      validatorFn: LessonSchema,
      signal: req,
    });

    return res.status(200).json(ResponseView.success({ data }));
  } catch (error) {
    next(error);
  }
}
