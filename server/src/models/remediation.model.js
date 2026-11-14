// Zod schema and lenient validation helper for targeted remediation.
import { z } from 'zod';
import { AppError } from '../utils/AppError.js';

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

/**
 * Lenient validation helper: drops individual invalid reteach items and sanitizes lists.
 * Throws AppError('EMPTY') if zero valid reteach items remain.
 * @param {any} raw
 * @param {string[]} [weakSectionIds=[]]
 * @returns {{ remediation: z.infer<typeof RemediationSchema>, droppedCount: number }}
 */
export function validateRemediation(raw, weakSectionIds = []) {
  if (!raw || typeof raw !== 'object') {
    throw new AppError('EMPTY', 'No valid remediation payload received.', 502);
  }

  const rawReteach = Array.isArray(raw.reteach) ? raw.reteach : [];
  const validWeakSectionIds = new Set(weakSectionIds);
  const validReteach = [];

  for (const item of rawReteach) {
    if (!item || typeof item !== 'object') continue;

    const { sectionId, newExplanation, whyYouMissedIt } = item;

    // Check empty text
    if (
      typeof sectionId !== 'string' || !sectionId.trim() ||
      typeof newExplanation !== 'string' || !newExplanation.trim() ||
      typeof whyYouMissedIt !== 'string' || !whyYouMissedIt.trim()
    ) {
      continue;
    }

    // Check sectionId belongs to weak sections if provided
    if (validWeakSectionIds.size > 0 && !validWeakSectionIds.has(sectionId.trim())) {
      continue;
    }

    validReteach.push({
      sectionId: sectionId.trim(),
      newExplanation: newExplanation.trim(),
      whyYouMissedIt: whyYouMissedIt.trim(),
    });
  }

  const droppedCount = rawReteach.length - validReteach.length;

  if (validReteach.length === 0) {
    throw new AppError('EMPTY', 'No valid reteach items remained after validation.', 502);
  }

  // Sanitize mustRemember and memoryTricks
  const rawMustRemember = Array.isArray(raw.mustRemember) ? raw.mustRemember : [];
  const mustRemember = rawMustRemember
    .filter((m) => typeof m === 'string' && m.trim().length > 0)
    .map((m) => m.trim());

  const rawMemoryTricks = Array.isArray(raw.memoryTricks) ? raw.memoryTricks : [];
  const memoryTricks = rawMemoryTricks
    .filter((t) => typeof t === 'string' && t.trim().length > 0)
    .map((t) => t.trim());

  // Sanitize revisionPlan
  const rawPlan = Array.isArray(raw.revisionPlan) ? raw.revisionPlan : [];
  const revisionPlan = rawPlan
    .filter((p) => p && typeof p === 'object' && typeof p.when === 'string' && p.when.trim() && typeof p.action === 'string' && p.action.trim())
    .map((p) => ({
      when: p.when.trim(),
      action: p.action.trim(),
    }));

  return {
    remediation: {
      reteach: validReteach,
      mustRemember: mustRemember.length > 0 ? mustRemember : ['Review core principles before re-attempting.'],
      memoryTricks: memoryTricks.length > 0 ? memoryTricks : ['Anchor each concept to a real-world analogy.'],
      revisionPlan: revisionPlan.length > 0 ? revisionPlan : [{ when: 'Day 1', action: 'Active recall retrieval sketch' }],
    },
    droppedCount,
  };
}
