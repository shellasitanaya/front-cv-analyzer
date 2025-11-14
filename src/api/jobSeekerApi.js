import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const jobSeekerApi = {
  // Upload and analyze CV
  analyzeCV: async (cvFile, jobDescription, cvTitle = 'Untitled CV') => {
    const formData = new FormData();
    formData.append('cv_file', cvFile);
    formData.append('job_description', jobDescription);
    formData.append('cv_title', cvTitle);

    try {
      const response = await api.post('/api/jobseeker/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  // Get user's CV history
  getMyCVs: async () => {
    try {
      const response = await api.get('/api/jobseeker/my-cvs');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  // Get analysis detail
  getAnalysisDetail: async (analysisId) => {
    try {
      const response = await api.get(`/api/jobseeker/analysis/${analysisId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  // Delete CV
  deleteCV: async (cvId) => {
    try {
      const response = await api.delete(`/api/jobseeker/cv/${cvId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },
};

export default jobSeekerApi;