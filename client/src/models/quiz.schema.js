// Zod schema for diagnostic quizzes: exactly matches server/src/models/quiz.model.js.
import { z } from 'zod';

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
