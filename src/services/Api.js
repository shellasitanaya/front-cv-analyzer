const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const Login = "/api/auth/login";  
export const Register = "/api/auth/register";
export const Logout = "/api/auth/logout";

// ======== Helper ========
function getToken() {
  return localStorage.getItem("token");
}

async function request(endpoint, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  console.log(`🔄 API Call: ${method} ${API_BASE_URL}${endpoint}`);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API request error: ${res.status}`);
    }

    const data = await res.json();
    return data;
    
  } catch (error) {
    console.error("❌ API Error:", error);
    if (error.name === 'TypeError') {
      throw new Error('Network error: Cannot connect to server');
    }
    throw error;
  }
}

// ======== Auth API ========
export const AuthAPI = {
  login: (email, password, role) =>
    request(Login, { method: "POST", body: { email, password, role } }),

  register: (name, email, password, role) =>
    request(Register, { method: "POST", body: { name, email, password, role } }),

  logout: () => localStorage.removeItem("token"),
  
};

// ======== Job Seeker API ========
export const JobSeekerAPI = {
  analyzeCV: (formData) => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/jobseeker/analyze`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Analysis error: ${res.status}`);
      }
      return data;
    });
  },
};

export const transformAstraAnalysis = (backendData) => {
  return {
    match_score: backendData.analysis_result?.skor_akhir || 0,
    ats_friendliness: {
      compatibility_score: backendData.analysis_result?.skor_akhir || 0,
      format_check: "Good",
      readability: "Good",
      sections_status: "Complete",
      contact_info: {
        email_found: !!backendData.parsed_info?.email,
        phone_found: !!backendData.parsed_info?.phone
      }
    },
    keyword_analysis: {
      total_words: backendData.parsed_info?.cv_full_text?.split(/\s+/).length || 0,
      skills_found: backendData.analysis_result?.detail_skor?.nice_to_have?.skor || 0
    },
    job_info: backendData.job_info,
    parsed_info: backendData.parsed_info,
    // Simpan data asli untuk referensi
    _raw: backendData
  };
};

// ======== Astra API ========
export const AstraAPI = {
  // Get available Astra jobs
  getJobs: () => request("/api/astra/jobs"),  // ✅ PERBAIKI PATH
  
  // Analyze CV for specific Astra job
  analyzeCV: (jobType, formData) => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/api/astra/analyze/${jobType}`, {  // ✅ PERBAIKI PATH
      method: "POST",
      headers: {
        // Jangan set Content-Type untuk FormData
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Astra analysis error: ${res.status}`);
      }
      return data;
    });
  },
  
  // Analyze CV text (without file upload)
  analyzeCVText: (jobType, cvText) => 
    request(`/api/astra/analyze-text/${jobType}`, {  // ✅ PERBAIKI PATH
      method: "POST", 
      body: { cv_text: cvText } 
    }),
};

// ======== CV API ========
// Di bagian CvAPI - perbaiki endpoints
export const CvAPI = {
  // Generate CV preview - gunakan endpoint yang benar
  previewCV: (data) => 
    request("/cv/generate_custom", { 
      method: "POST", 
      body: data 
    }),
  
  // Generate CV from candidate data
  generateCV: (candidateId) => 
    request(`/cv/generate/${candidateId}`),
  
  // Upload CV for OCR
  uploadCVForOCR: (formData) => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/cv/upload_cv`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `OCR upload error: ${res.status}`);
      }
      return data;
    });
  },
};

// ======== User API ========
export const UserAPI = {
  // Get user's uploaded CVs
  getMyCVs: () => request("/user/cvs"),
  
  // Get CV analysis history
  getAnalysisHistory: (cvId) => request(`/user/cvs/${cvId}/analyses`),
  
  // Delete CV
  deleteCV: (cvId) => request(`/user/cvs/${cvId}`, { method: "DELETE" }),
};

// ======== Utility Functions ========
export const checkServerStatus = async () => {
  try {
    // Test multiple endpoints
    const responses = await Promise.all([
      fetch(`${API_BASE_URL}/api/astra/test`),
      fetch(`${API_BASE_URL}/api/hr/test`)
    ]);
    
    const allOk = responses.every(response => response.ok);
    console.log('🔍 Server status check:', allOk ? '✅ Connected' : '❌ Disconnected');
    return allOk;
  } catch (error) {
    console.error('❌ Server status check failed:', error);
    return false;
  }
};

export const handleApiError = (error) => {
  console.error("API Error:", error);
  
  if (error.message.includes('Network error') || error.message.includes('Cannot connect')) {
    return "Server tidak dapat dihubungi. Periksa koneksi internet dan pastikan backend berjalan.";
  }
  
  if (error.message.includes('401')) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return "Session expired. Silakan login kembali.";
  }
  
  return error.message || "Terjadi kesalahan pada server.";
};

// Export default untuk backward compatibility
export default {
  AuthAPI,
  JobSeekerAPI, 
  AstraAPI,
  CvAPI,
  UserAPI
};

// src/services/api.js - modifikasi candidateAPI
export const candidateAPI = {
  // Get single candidate by ID - coba multiple endpoints
  getCandidateById: async (id) => {
    const endpoint = `/api/candidates/${id}`;
    console.log(`🔍 Fetching candidate from: ${API_BASE_URL}${endpoint}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      console.log(`📊 Response status: ${response.status}`);
      
      if (!response.ok) {
        // Coba endpoint alternatif
        console.log('⚠️ Trying alternative endpoint...');
        const altResponse = await fetch(`${API_BASE_URL}/api/hr/candidates/${id}`);
        if (altResponse.ok) {
          console.log('✅ Success with alternative endpoint');
          return altResponse.json();
        }
        
        let errorMessage = `Failed to fetch candidate data (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.log('📄 Error data:', errorData);
        } catch (e) {
          const text = await response.text();
          console.log('📄 Response text:', text.substring(0, 200));
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ Candidate data received:', data);
      return data;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      
      // Fallback ke mock data jika backend down
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Using fallback mock data...');
        return mockCandidateAPI.getCandidateById(id);
      }
      
      throw error;
    }
  },

  // Get candidate with skills
  getCandidateWithSkills: async (id) => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    
    console.log(`🔍 [Frontend] Mencari skills untuk candidate: ${id}`);
    
    // Coba endpoint utama
    const endpoint = `/api/candidates/${id}/skills`;
    console.log(`🔍 [Frontend] Mencoba endpoint: ${API_BASE_URL}${endpoint}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      console.log(`📊 [Frontend] Skills response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [Frontend] Skills data diterima:`, data);
        return data;
      }
      
      // Jika error 500, coba query langsung ke database via endpoint lain
      console.log(`⚠️ [Frontend] Skills endpoint error, menggunakan fallback`);
      
      // Return default skills data
      return {
        candidate_id: id,
        candidate_name: 'Candidate',
        skills: []  // Return empty array sementara
      };
      
    } catch (error) {
      console.error(`❌ [Frontend] Error fetching skills:`, error);
      return {
        candidate_id: id,
        candidate_name: 'Candidate',
        skills: []
      };
    }
  },
};

const mockCandidateAPI = {
  getCandidateById: async (id) => {
    console.log('📦 Using mock data for candidate:', id);
    
    // Mock data sesuai dengan seeder
    const mockData = {
      '27d8c7e3-1866-4e24-b48d-8855f6ba32a8': {
        id: '27d8c7e3-1866-4e24-b48d-8855f6ba32a8',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+628123456789',
        match_score: 87.5,
        education: 'Bachelor of Computer Science, University of Indonesia (2020-2024)',
        experience: 'Backend Developer at ABC Corp (2023-2024)',
        status: 'passed_filter',
        original_filename: 'cv_john_doe.pdf',
        uploaded_at: '2024-01-15T10:30:00Z',
        job_id: 'job-001'
      },
      // Tambahkan data lainnya dari seeder...
    };
    
    if (mockData[id]) {
      return mockData[id];
    }
    
    // Return dummy data jika ID tidak dikenali
    return {
      id: id,
      name: 'Test Candidate',
      email: 'test@example.com',
      phone: '+628123456789',
      match_score: 75.0,
      education: 'Bachelor Degree',
      experience: 'Software Developer',
      status: 'processing',
      original_filename: 'cv_test.pdf',
      uploaded_at: new Date().toISOString(),
      job_id: 'job-001'
    };
  },
  
  getCandidateWithSkills: async (id) => {
    console.log('📦 Using mock skills for candidate:', id);
    
    // Mock skills data
    return {
      candidate_id: id,
      candidate_name: 'Test Candidate',
      skills: [
        { id: '1', name: 'Python', category: 'Programming' },
        { id: '2', name: 'JavaScript', category: 'Programming' },
        { id: '3', name: 'React', category: 'Frontend' },
        { id: '4', name: 'Node.js', category: 'Backend' },
        { id: '5', name: 'PostgreSQL', category: 'Database' }
      ]
    };
  }
};