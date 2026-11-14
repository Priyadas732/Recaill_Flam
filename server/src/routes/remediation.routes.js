// Remediation routes: mounts POST /api/remediation with input validation middleware.
import { Router } from 'express';
import { createRemediation } from '../controllers/remediation.controller.js';
import { validateRemediationRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post('/', validateRemediationRequest, createRemediation);

export default router;
