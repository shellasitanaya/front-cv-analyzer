// src/services/api.js
const API_BASE_URL = "http://localhost:5000/api";

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

  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API request error");
  }

  return data;
}

// ======== Auth API ========
export const AuthAPI = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  logout: () => {
    localStorage.removeItem("token");
  },
};

// ======== User API ======== (adjust as needed)
export const UserAPI = {
  // getProfile: () => request("/user/profile"),
};
