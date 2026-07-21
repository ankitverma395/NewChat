import express from 'express';
import { getStats, createAnonymousUser, checkHealth } from '../controllers/sessionController.js';
import Feedback from '../models/Feedback.js';

const router = express.Router();

router.get('/health', checkHealth);
router.get('/stats', getStats);
router.post('/sessions/create-anonymous', createAnonymousUser);

router.post('/feedback', async (req, res, next) => {
  try {
    const { suggestion } = req.body;
    if (!suggestion || !suggestion.trim()) {
      return res.status(400).json({ success: false, message: 'Suggestion is required' });
    }

    const newFeedback = new Feedback({ suggestion });
    await newFeedback.save();

    res.status(201).json({ success: true, message: 'Feedback saved successfully' });
  } catch (error) {
    next(error);
  }
});

// Admin Authorization Middleware
const adminAuth = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const providedPassword = req.headers['x-admin-password'];
  if (providedPassword === adminPassword) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized. Invalid admin password.' });
  }
};

// Admin Login
router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === adminPassword) {
    return res.json({ success: true, token: adminPassword });
  }
  res.status(401).json({ success: false, message: 'Invalid admin password' });
});

// Fetch all logged suggestions
router.get('/admin/feedback', adminAuth, async (req, res, next) => {
  try {
    const list = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

// Delete a suggestion
router.delete('/admin/feedback/:id', adminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Feedback.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Suggestion not found' });
    }
    res.json({ success: true, message: 'Suggestion deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
