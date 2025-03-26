import axios from 'axios';

// Configure base URL based on environment
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tcupboard.org/api'
  : 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Xenforo specific API calls
export const xenforoApi = {
  getLatestThreads: async (page = 1) => {
    try {
      const response = await apiClient.get('/forum/threads', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching latest threads:', error);
      throw error;
    }
  },

  getForumThreads: async (forumId = 12, page = 1) => {
    try {
      const response = await apiClient.get(`/forum/forums/${forumId}`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forum threads:', error);
      throw error;
    }
  }
};

export default apiClient;