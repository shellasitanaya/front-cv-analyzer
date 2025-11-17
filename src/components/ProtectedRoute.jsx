import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // No token → redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = jwtDecode(token);
    const userRole = payload.role;

    // Check if user role is allowed
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    // User is authorized
    return children;
  } catch (err) {
    console.error("Invalid token:", err);
    return <Navigate to="/" replace />;
  }
}