// Input validation middleware: Zod checks on request bodies, returning BAD_INPUT with clear messages.
import { z } from 'zod';
import { AppError } from '../utils/AppError.js';

// Schema for POST /api/lesson
export const LessonRequestSchema = z.object({
  topic: z
    .string({ required_error: 'Topic is required.' })
    .trim()
    .min(3, 'Topic must be between 3 and 8000 characters.')
    .max(8000, 'Topic must be between 3 and 8000 characters.'),
  level: z
    .enum(['beginner', 'intermediate', 'advanced'], {
      errorMap: () => ({ message: 'Level must be beginner, intermediate, or advanced.' }),
    })
    .default('beginner'),
});

// Schema for POST /api/quiz
export const QuizRequestSchema = z.object({
  lesson: z.object(
    {
      title: z.string().optional(),
      summary: z.string().optional(),
      sections: z
        .array(
          z.object({
            id: z.string().trim().min(1, 'Each section must have a valid id.'),
            heading: z.string().optional(),
            title: z.string().optional(),
            explanation: z.string().optional(),
            summary: z.string().optional(),
          })
        )
        .min(1, 'Lesson must contain at least one section.'),
    },
    { required_error: 'Lesson object with sections is required.' }
  ),
  count: z
    .preprocess((val) => {
      const num = Number(val);
      return Number.isInteger(num) && num >= 1 && num <= 50 ? num : 10;
    }, z.number().int().min(1).max(50))
    .optional()
    .default(10),
});

// Schema for POST /api/remediation
export const RemediationRequestSchema = z.object({
  lesson: z.object(
    {
      title: z.string().optional(),
      summary: z.string().optional(),
      sections: z
        .array(
          z.object({
            id: z.string().trim().min(1, 'Each section must have a valid id.'),
            heading: z.string().optional(),
            title: z.string().optional(),
            explanation: z.string().optional(),
            summary: z.string().optional(),
          })
        )
        .min(1, 'Lesson must contain at least one section.'),
    },
    { required_error: 'Lesson object is required for remediation.' }
  ),
  weakSectionIds: z
    .array(z.string().trim().min(1, 'Weak section id cannot be empty.'), {
      required_error: 'weakSectionIds array is required.',
    })
    .min(1, 'At least one weakSectionId is required.'),
  wrongQuestions: z.array(z.any()).optional().default([]),
});

/**
 * Generic helper to validate a request body with a Zod schema.
 * Throws AppError('BAD_INPUT', ...) with the first formatted error message.
 */
function validateWithSchema(schema, req, next) {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue?.message || 'Invalid request body.';
    return next(new AppError('BAD_INPUT', message, 400));
  }
  req.body = result.data;
  next();
}

export function validateLessonRequest(req, res, next) {
  validateWithSchema(LessonRequestSchema, req, next);
}

export function validateQuizRequest(req, res, next) {
  validateWithSchema(QuizRequestSchema, req, next);
}

export function validateRemediationRequest(req, res, next) {
  // Support both weakSectionIds and weakSections for flexible payload handling
  if (!req.body?.weakSectionIds && Array.isArray(req.body?.weakSections)) {
    req.body.weakSectionIds = req.body.weakSections
      .map((s) => (typeof s === 'string' ? s : s.sectionId || s.id))
      .filter(Boolean);
  }
  validateWithSchema(RemediationRequestSchema, req, next);
}
