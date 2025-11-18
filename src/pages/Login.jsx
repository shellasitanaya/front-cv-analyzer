import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { AuthAPI } from "../services/Api";
import illustration from "../assets/images/login.jpg";

export default function LoginPage() {
  const [role, setRole] = useState("user"); // "user" or "hr"
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
        redirectByRole(payload.role);
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  const redirectByRole = (userRole) => {
    if (userRole === "user") navigate("/user-test");
    else if (userRole === "hr") navigate("/hr-test");
    else if (userRole === "admin") navigate("/user-test");
  };

  const handleLogin = async () => {
    setError("");
    try {
      const data = await AuthAPI.login(email, password, role);
      const token = data.access_token;

      if (token) {
        console.log(token);
        localStorage.setItem("token", token);
        const payload = jwtDecode(token);
        redirectByRole(payload.role);
      }

    } catch (err) {
      console.error(err);

      setError(err.message || "Login failed. Check your email, password, or selected role.");
    }
  };

  // Dynamic description text based on role
  const descriptionText =
    role === "user"
      ? "Log in to your account and manage your CV analysis dashboard."
      : "Access candidate data, evaluate applications, and manage job postings.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#DCEDFF] via-[#94B0DA] to-[#8F91A2]">
      <div className="bg-[#FFFFFFEE] backdrop-blur-md rounded-3xl shadow-2xl flex flex-col md:flex-row max-w-4xl w-full overflow-hidden">
        
        {/* Illustration */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-[#94B0DA] to-[#8F91A2] items-center justify-center">
          <img
            src={illustration}
            alt="AI CV illustration"
            className="p-10 w-3/4 h-auto"
          />
        </div>

        {/* Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-[#343F3E] mb-4">Welcome Back!</h1>
          <p className="text-[#505A5B] mb-8">{descriptionText}</p>

          {/* Role Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                role === "user"
                  ? "bg-[#94B0DA] text-white shadow-md"
                  : "bg-white text-[#505A5B] border border-[#94B0DA] hover:bg-[#F0F4FF]"
              }`}
              onClick={() => setRole("user")}
            >
              User
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                role === "hr"
                  ? "bg-[#94B0DA] text-white shadow-md"
                  : "bg-white text-[#505A5B] border border-[#94B0DA] hover:bg-[#F0F4FF]"
              }`}
              onClick={() => setRole("hr")}
            >
              HR
            </button>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <input
            type="email"
            placeholder="Email"
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

          <p className="text-sm text-blue-600 mb-6 cursor-pointer">Forgot Password?</p>

          <button
            className="w-full py-3 bg-[#94B0DA] text-white rounded-lg shadow-md hover:bg-[#8F91A2] transition font-semibold mb-4"
            onClick={handleLogin}
          >
            Login
          </button>

          {/* enable this if registration is implemented */}
          {/* <p className="text-center text-[#505A5B]">
            Don't have an account?{" "}
            <span className="text-[#94B0DA] cursor-pointer font-semibold">Register</span>
          </p> */}
        </div>
      </div>
    </div>
  );
}