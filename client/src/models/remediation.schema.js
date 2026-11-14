// Zod schema for targeted remediation: exactly matches server/src/models/remediation.model.js.
import { z } from 'zod';

export const ReteachItemSchema = z.object({
  sectionId: z.string().trim().min(1, 'Section id cannot be empty'),
  newExplanation: z.string().trim().min(1, 'New explanation cannot be empty'),
  whyYouMissedIt: z.string().trim().min(1, 'whyYouMissedIt cannot be empty'),
});

export const RevisionPlanItemSchema = z.object({
  when: z.string().trim().min(1, 'Revision timeframe (when) cannot be empty'),
  action: z.string().trim().min(1, 'Revision action cannot be empty'),
});

export const RemediationSchema = z.object({
  reteach: z.array(ReteachItemSchema).min(1, 'At least one reteach section is required'),
  mustRemember: z.array(z.string().trim().min(1)).min(1, 'At least one key concept to remember is required'),
  memoryTricks: z.array(z.string().trim().min(1)).min(1, 'At least one memory trick or hook is required'),
  revisionPlan: z.array(RevisionPlanItemSchema).min(1, 'Revision plan is required'),
});
