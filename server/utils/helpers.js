// Utility helper to generate unique IDs
export const generateUUID = () => {
  return 'room_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// Basic text sanitization to protect chat from XSS injections
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};
