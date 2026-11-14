// Controller: handles targeted remediation requests. Thin: validate -> prompt -> ai -> parser -> view.
import { remediationPrompt } from '../services/prompts.js';
import { callWithRetry } from '../services/parser.service.js';
import { validateRemediation } from '../models/remediation.model.js';
import { ResponseView } from '../views/response.view.js';

export async function createRemediation(req, res, next) {
  try {
    const { lesson, weakSectionIds, wrongQuestions = [] } = req.body;

    // Extract weak sections from the provided lesson
    const weakSections = (lesson?.sections || []).filter((s) => weakSectionIds.includes(s.id));
    const { systemPrompt, userPrompt } = remediationPrompt({ weakSections, wrongQuestions });

    let droppedCount = 0;
    const data = await callWithRetry({
      systemPrompt,
      userPrompt,
      validatorFn: (raw) => {
        const result = validateRemediation(raw, weakSectionIds);
        droppedCount = result.droppedCount;
        return result.remediation;
      },
      signal: req,
    });

    const warnings = droppedCount > 0 ? [`${droppedCount} reteach section${droppedCount > 1 ? 's were' : ' was'} dropped`] : [];
    return res.status(200).json(ResponseView.success({ data, warnings }));
  } catch (error) {
    next(error);
  }
}
