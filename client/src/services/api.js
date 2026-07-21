import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:5000/api'
);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getServerStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching server stats:', error);
    return { success: false, activeUsers: 0, totalSessionsMatches: 0 };
  }
};

export const createAnonymousId = async () => {
  try {
    const response = await api.post('/sessions/create-anonymous');
    return response.data.tempUserId;
  } catch (error) {
    console.error('Error creating anonymous user session:', error);
    // Generate fallback locally if backend is unreachable
    return 'stranger_' + Math.random().toString(36).substring(2, 14);
  }
};

export const submitFeedback = async (suggestion) => {
  try {
    const response = await api.post('/feedback', { suggestion });
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to submit feedback' };
  }
};

export const loginAdmin = async (password) => {
  try {
    const response = await api.post('/admin/login', { password });
    return response.data;
  } catch (error) {
    console.error('Error logging in admin:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to login' };
  }
};

export const getAdminFeedback = async (password) => {
  try {
    const response = await api.get('/admin/feedback', {
      headers: { 'x-admin-password': password }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin feedback:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to load feedback list' };
  }
};

export const deleteAdminFeedback = async (id, password) => {
  try {
    const response = await api.delete(`/admin/feedback/${id}`, {
      headers: { 'x-admin-password': password }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to delete suggestion' };
  }
};

export default api;
