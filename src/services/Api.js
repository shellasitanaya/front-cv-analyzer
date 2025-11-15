// src/services/api.js
const API_BASE_URL = "http://localhost:5000/api";

// Endpoint paths
export const Login = "/auth/login";
export const Logout = "/auth/logout";
// Add more paths if needed

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
  console.log("API Response:", data);

  if (!res.ok) {
    throw new Error(data.message || "API request error");
  }

  return data;
}

// adjust as needed
// ======== Auth API ========
export const AuthAPI = {
  login: (email, password, role) =>
    request(Login, { method: "POST", body: { email, password, role } }),
  logout: () => localStorage.removeItem("token"),
};
