// Zod schema for lessons: enforces title, summary, 3-6 sections with unique IDs, and non-empty strings.
import { z } from 'zod';

export const LessonSectionSchema = z.object({
  id: z.string().trim().min(1, 'Section id cannot be empty'),
  heading: z.string().trim().min(1, 'Section heading cannot be empty'),
  explanation: z.string().trim().min(1, 'Section explanation cannot be empty'),
  keyPoints: z.array(z.string().trim().min(1, 'Key point cannot be empty')).min(1, 'At least one key point is required'),
  example: z.string().trim().min(1, 'Example cannot be empty').optional(),
});

export const LessonSchema = z
  .object({
    title: z.string().trim().min(1, 'Lesson title cannot be empty'),
    summary: z.string().trim().min(1, 'Lesson summary cannot be empty'),
    sections: z
      .array(LessonSectionSchema)
      .min(3, 'Lesson must contain at least 3 sections')
      .max(6, 'Lesson cannot contain more than 6 sections'),
  })
  .refine(
    (data) => {
      const ids = data.sections.map((s) => s.id);
      return new Set(ids).size === ids.length;
    },
    {
      message: 'Section ids must be unique within a lesson',
      path: ['sections'],
    }
  );
