import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import LoginPage from "./pages/Login";
import AdminLoginPage from "./pages/admin/AdminLogin";

// User Pages
import UserTest from "./pages/js/UserTest";
import FillData from "./pages/js/FillData";
import PreviewCV from "./pages/js/PreviewCV";

// HR Pages
import HRTest from "./pages/hr/HRTest";
import ScreeningPage from "./features/hr/ScreeningPage";
import RankingPage from "./features/hr/RankingPage";
import JobPosting from "./pages/hr/JobPosting";

// Admin Pages (future expansion)
// import AdminDashboardPage from "./pages/admin/AdminDashboard";

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
        {/* ---------- AUTHENTICATION ---------- */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ---------- USER ROUTES ---------- */}
        <Route
          path="/user-test"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserTest />
            </ProtectedRoute>
          }
        />
        <Route path="/fill-data" element={<FillData />} />
        <Route path="/preview" element={<PreviewCV />} />

        {/* ---------- HR ROUTES ---------- */}
        <Route
          path="/hr-test"
          element={
            <ProtectedRoute allowedRoles={["hr", "admin"]}>
              <HRTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr-screening"
          element={
            <ProtectedRoute allowedRoles={["hr", "admin"]}>
              <ScreeningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr-ranking/:jobId"
          element={
            <ProtectedRoute allowedRoles={["hr", "admin"]}>
              <RankingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/create-job"
          element={
            <ProtectedRoute allowedRoles={["hr", "admin"]}>
              <JobPosting />
            </ProtectedRoute>
          }
        />

        {/* ---------- ADMIN ROUTES (optional) ---------- */}
        {/* <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </Router>
  );
}
