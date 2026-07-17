import express from 'express';
import { getStats, createAnonymousUser, checkHealth } from '../controllers/sessionController.js';

const router = express.Router();

router.get('/health', checkHealth);
router.get('/stats', getStats);
router.post('/sessions/create-anonymous', createAnonymousUser);

export default router;
