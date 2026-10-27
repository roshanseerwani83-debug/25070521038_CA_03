// API base URL configuration
// When running in development, points to the Express server on port 5000
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API;
