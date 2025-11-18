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

// Di jobSeekerApi.js - perbaiki semua functions
export const jobSeekerApi = {
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
        timeout: 30000,
      });
      
      // Handle both response structures
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'Network error';
      throw { error: errorMsg };
    }
  },

  getMyCVs: async () => {
    try {
      const response = await api.get('/api/jobseeker/my-cvs');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'Network error';
      throw { error: errorMsg };
    }
  },

  getAnalysisDetail: async (analysisId) => {
    try {
      const response = await api.get(`/api/jobseeker/analysis/${analysisId}`);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'Network error';
      throw { error: errorMsg };
    }
  },

  deleteCV: async (cvId) => {
    try {
      const response = await api.delete(`/api/jobseeker/cv/${cvId}`);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      'Network error';
      throw { error: errorMsg };
    }
  },
};

// Tambahkan di jobSeekerApi.js sebelum export
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('=== DEBUG API REQUEST ===');
  console.log('URL:', config.url);
  console.log('Token exists:', !!token);
  console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');
  console.log('===================');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default jobSeekerApi;