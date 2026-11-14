// Zod schema and lenient validation helper for diagnostic quizzes.
import { z } from 'zod';
import { AppError } from '../utils/AppError.js';

export const QuizQuestionSchema = z.object({
  id: z.string().trim().min(1, 'Question id cannot be empty'),
  sectionId: z.string().trim().min(1, 'Section id cannot be empty'),
  question: z.string().trim().min(1, 'Question text cannot be empty'),
  options: z
    .array(z.string().trim().min(1, 'Option text cannot be empty'))
    .length(4, 'Options must contain exactly 4 choices')
    .refine((opts) => new Set(opts).size === 4, {
      message: 'Options must not contain duplicate choices',
    }),
  answerIndex: z.number().int().min(0).max(3, 'Answer index must be an integer between 0 and 3'),
  explanation: z.string().trim().min(1, 'Explanation cannot be empty'),
});

export const QuizSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1, 'Quiz must have at least one valid question'),
});

/**
 * Lenient validation helper: drops individual invalid questions and returns partial success.
 * Throws AppError('EMPTY') if zero valid questions remain.
 * @param {any} raw
 * @param {string[]} [lessonSectionIds=[]]
 * @returns {{ questions: Array<z.infer<typeof QuizQuestionSchema>>, droppedCount: number }}
 */
export function validateQuiz(raw, lessonSectionIds = []) {
  const rawQuestions = Array.isArray(raw?.questions) ? raw.questions : [];
  const validSectionIdSet = new Set(lessonSectionIds);
  const validQuestions = [];

  for (const q of rawQuestions) {
    if (!q || typeof q !== 'object') continue;

    const { id, sectionId, question, options, answerIndex, explanation } = q;

    // Check empty strings
    if (
      typeof id !== 'string' || !id.trim() ||
      typeof sectionId !== 'string' || !sectionId.trim() ||
      typeof question !== 'string' || !question.trim() ||
      typeof explanation !== 'string' || !explanation.trim()
    ) {
      continue;
    }

    // Check sectionId belongs to lesson
    if (validSectionIdSet.size > 0 && !validSectionIdSet.has(sectionId.trim())) {
      continue;
    }

    // Check options: exactly 4 non-empty strings, no duplicates
    if (!Array.isArray(options) || options.length !== 4) {
      continue;
    }

    const trimmedOptions = options.map((opt) => (typeof opt === 'string' ? opt.trim() : ''));
    if (trimmedOptions.some((opt) => !opt) || new Set(trimmedOptions).size !== 4) {
      continue;
    }

    // Check answerIndex range [0, 3]
    if (typeof answerIndex !== 'number' || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      continue;
    }

    validQuestions.push({
      id: id.trim(),
      sectionId: sectionId.trim(),
      question: question.trim(),
      options: trimmedOptions,
      answerIndex,
      explanation: explanation.trim(),
    });
  }

  const droppedCount = rawQuestions.length - validQuestions.length;

  if (validQuestions.length === 0) {
    throw new AppError('EMPTY', 'No valid quiz questions remained after validation.', 502);
  }

  return {
    questions: validQuestions,
    droppedCount,
  };
}
