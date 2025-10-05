import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect immediately if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = jwtDecode(token);
        const role = payload.identity.role;

        if (role === "user") navigate("/user-test");
        else if (role === "hr") navigate("/hr-test");
        else if (role === "admin") navigate("/user-test");
      } catch (err) {
        localStorage.removeItem("token"); // remove invalid token
      }
    }
  }, [navigate]);

  const login = async () => {
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store JWT token only
      localStorage.setItem("token", data.access_token);

      // Decode token to redirect user based on role
      const payload = jwtDecode(data.access_token);
      const role = payload.identity.role;

      if (role === "user") navigate("/user-test");
      else if (role === "hr") navigate("/hr-test");
      else if (role === "admin") navigate("/user-test");

    } catch (err) {
      console.error(err);
      setError("Server error, please try again.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-20 bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      {error && <p className="text-red-600 text-center">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />

      <button
        onClick={login}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Login
      </button>
    </div>
  );
}
