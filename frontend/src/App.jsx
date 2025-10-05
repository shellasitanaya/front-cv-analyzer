import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserTest from "./pages/UserTest";
import HRTest from "./pages/HRTest";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/Login";
import AdminLoginPage from "./pages/AdminLogin";

function Unauthorized() {
  return (
    <div className="p-6 text-center text-red-600 font-semibold">
      Unauthorized access!
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />

        {/* Unauthorized Page */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* User Test Page: accessible by user and admin */}
        <Route
          path="/user-test"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserTest />
            </ProtectedRoute>
          }
        />

        {/* HR Test Page: accessible by hr and admin */}
        <Route
          path="/hr-test"
          element={
            <ProtectedRoute allowedRoles={["hr", "admin"]}>
              <HRTest />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
