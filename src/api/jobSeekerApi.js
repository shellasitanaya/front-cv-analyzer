import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const jobSeekerApi = {
  // UPDATE: Terima jobTitle juga
  analyzeCV: async (cvFile, jobDescription, cvTitle = 'Untitled CV', jobTitle = 'Custom Job') => {
    const formData = new FormData();
    formData.append('cv_file', cvFile);
    formData.append('job_description', jobDescription); // Ini Text
    formData.append('job_title_input', jobTitle);       // Ini Judul
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

  getMyCVs: async () => {
    try {
      const response = await api.get('/api/jobseeker/my-cvs');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  getAnalysisDetail: async (analysisId) => {
    try {
      const response = await api.get(`/api/jobseeker/analysis/${analysisId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

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