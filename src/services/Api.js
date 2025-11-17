const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Endpoint paths - PERBAIKI INI
export const Login = "/api/auth/login";  // ✅ PERBAIKI PATH
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
    
    // ✅ TAMBAHKAN INI - Handle 401 Unauthorized
    if (res.status === 401) {
      console.warn('⚠️ Token expired or invalid. Logging out...');
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error('Session expired. Please login again.');
    }
    
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