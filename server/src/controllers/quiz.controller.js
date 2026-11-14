// Controller: handles diagnostic quiz generation. Thin: validate -> prompt -> ai -> parser -> view.
import { quizPrompt } from '../services/prompts.js';
import { callWithRetry } from '../services/parser.service.js';
import { validateQuiz } from '../models/quiz.model.js';
import { ResponseView } from '../views/response.view.js';

export async function createQuiz(req, res, next) {
  try {
    const { lesson, count } = req.body;
    const targetCount = typeof count === 'number' && count >= 10
      ? count
      : Math.max(10, (lesson?.sections?.length || 3) * 2);
    const lessonSectionIds = (lesson.sections || []).map((s) => s.id);
    const { systemPrompt, userPrompt } = quizPrompt(lesson, targetCount);

    let droppedCount = 0;
    const data = await callWithRetry({
      systemPrompt,
      userPrompt,
      validatorFn: (raw) => {
        const result = validateQuiz(raw, lessonSectionIds);
        droppedCount = result.droppedCount;
        return { questions: result.questions };
      },
      signal: req,
    });

    const warnings = droppedCount > 0 ? [`${droppedCount} question${droppedCount > 1 ? 's were' : ' was'} dropped`] : [];
    return res.status(200).json(ResponseView.success({ data, warnings }));
  } catch (error) {
    next(error);
  }
}
