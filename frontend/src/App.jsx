import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserTest from "./pages/UserTest";
import HRTest from "./pages/HRTest";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/Login";
import AdminLoginPage from "./pages/AdminLogin";
// hr feature pages
// import HRDashboardPage from "./features/hr/DashboardPage";
import ScreeningPage from "./features/hr/ScreeningPage";
import RankingPage from './features/hr/RankingPage';
// generate pages
import FillData from "./pages/FillData";
import PreviewCV from "./pages/PreviewCV";

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
        {/* ---------- AUTH PAGES ---------- */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ---------- TEST PAGES ---------- */}
        <Route
          path="/user-test"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr-test"
          element={
            <ProtectedRoute allowedRoles={["hr", "admin"]}>
              <HRTest />
            </ProtectedRoute>
          }
        />

        {/* ---------- HR PAGES ---------- */}
        {/* <Route
          path="/hr-dashboard"
          element={
            <ProtectedRoute allowedRoles={["hr", "admin"]}>
              <HRDashboardPage />
            </ProtectedRoute>
          }
        /> */}
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

        {/* ---------- ADMIN DASHBOARD (optional future route) ---------- */}
        {/* <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
      {/* generate pages route */}
      <Routes>
        <Route path="/fill-data" element={<FillData />} /> {/* Step 2: isi data */}
        <Route path="/preview" element={<PreviewCV />} /> {/* Step 3: preview */}
      </Routes>
    </Router>
  );
}