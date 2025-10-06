import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { AuthAPI } from "../services/Api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = jwtDecode(token);
        if (payload.sub.role === "admin") navigate("/admin-dashboard");
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError("");
    try {
      const data = await AuthAPI.login(email, password, "admin");
      localStorage.setItem("token", data.access_token);

      const payload = jwtDecode(data.access_token);
      if (payload.sub.role !== "admin") {
        setError("Access denied: This account is not an admin.");
        localStorage.removeItem("token");
        return;
      }

    //navigate to admin dashboard (to be implemented)
    //   navigate("/admin-dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8F91A2] via-[#505A5B] to-[#343F3E] ">
      <div className="bg-[#FFFFFFEE] backdrop-blur-md rounded-3xl shadow-2xl flex flex-col md:flex-row max-w-lg w-full overflow-hidden">

        {/* Login Form */}
        <div className="w-full p-12 flex flex-col justify-center">
          <h1 className="text-center text-4xl font-extrabold text-[#343F3E] mb-4">Admin Login</h1>
          <p className="text-center text-[#505A5B] mb-8">
            Secure access to system management and analytics.
          </p>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <input
            type="email"
            placeholder="Admin Email / Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-5 py-3 border rounded-lg border-[#94B0DA] focus:outline-none focus:ring-2 focus:ring-[#8F91A2]"
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border rounded-lg border-[#94B0DA] focus:outline-none focus:ring-2 focus:ring-[#8F91A2]"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-[#505A5B]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            className="w-full py-3 bg-[#94B0DA] text-white rounded-lg shadow-md hover:bg-[#8F91A2] transition font-semibold mb-4"
            onClick={handleLogin}
          >
            Login
          </button>

          <p className="text-center text-[#505A5B] text-sm">
            <span className="text-[#94B0DA] cursor-pointer">Forgot Password?</span>
          </p>
        </div>
      </div>
    </div>
  );
}
