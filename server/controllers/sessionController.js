import ChatSession from '../models/Session.js';

// In-memory counter for real-time tracking (synced via socket handler)
export let activeConnectionsCount = 0;

export const incrementActiveCount = () => {
  activeConnectionsCount++;
};

export const decrementActiveCount = () => {
  activeConnectionsCount = Math.max(0, activeConnectionsCount - 1);
};

// @desc    Get system stats
// @route   GET /api/stats
// @access  Public
export const getStats = async (req, res, next) => {
  try {
    let totalSessions = 0;
    try {
      totalSessions = await ChatSession.countDocuments();
    } catch (dbErr) {
      console.warn('DB counts unavailable, defaulting to 0');
    }

    res.status(200).json({
      success: true,
      activeUsers: activeConnectionsCount,
      totalSessionsMatches: totalSessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create anonymous session ID
// @route   POST /api/sessions/create-anonymous
// @access  Public
export const createAnonymousUser = (req, res) => {
  // Generate random 12-char alphanumeric ID
  const tempUserId = 'stranger_' + Math.random().toString(36).substring(2, 14);
  res.status(200).json({
    success: true,
    tempUserId,
  });
};

// @desc    Check Server health
// @route   GET /api/health
// @access  Public
export const checkHealth = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
  });
};
