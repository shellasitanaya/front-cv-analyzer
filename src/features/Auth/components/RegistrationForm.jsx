import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthAPI } from "../../../services/Api.js";

export default function RegistrationForm() {
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");

    try {
      const res = await AuthAPI.register(name, email, password, role);

      if (res.success) {
        navigate("/login");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#DCEDFF] via-[#94B0DA] to-[#8F91A2]">
      <div className="bg-[#FFFFFFEE] backdrop-blur-md rounded-3xl shadow-2xl max-w-2xl w-full p-12">

        <h1 className="text-4xl font-extrabold text-[#343F3E] mb-4">
          Create Your Account
        </h1>

        <p className="text-[#505A5B] mb-8">
          Register to start managing your CV or candidate pipeline.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              role === "user"
                ? "bg-[#94B0DA] text-white shadow-md"
                : "bg-white text-[#505A5B] border border-[#94B0DA]"
            }`}
            onClick={() => setRole("user")}
          >
            User
          </button>

          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              role === "hr"
                ? "bg-[#94B0DA] text-white shadow-md"
                : "bg-white text-[#505A5B] border border-[#94B0DA]"
            }`}
            onClick={() => setRole("hr")}
          >
            HR
          </button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-5 py-3 border rounded-lg border-[#94B0DA]"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-5 py-3 border rounded-lg border-[#94B0DA]"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 border rounded-lg border-[#94B0DA]"
          />
          <button
            className="absolute right-3 top-3 text-[#505A5B]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          className="w-full py-3 bg-[#94B0DA] text-white rounded-lg shadow-md font-semibold mb-4"
          onClick={handleRegister}
        >
          Register
        </button>

        <p className="text-center text-[#505A5B]">
          Already have an account?{" "}
          <span
            className="text-[#94B0DA] cursor-pointer font-semibold"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}
