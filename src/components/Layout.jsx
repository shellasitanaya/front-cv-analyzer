import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../services/Api";

export default function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthAPI.logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Side Navbar */}
      <aside className="w-64 bg-[#94B0DA] text-white flex flex-col">
        <div className="p-6 text-2xl font-bold">Smart CV Analyzer</div>
        <nav className="flex-1 px-4">
          <ul className="space-y-4">
            <li>
              <button
                className="w-full text-left px-4 py-2 rounded hover:bg-[#8F91A2]"
                onClick={() => navigate("/user-test")}
              >
                User Page
              </button>
            </li>
            <li>
              <button
                className="w-full text-left px-4 py-2 rounded hover:bg-[#8F91A2]"
                onClick={() => navigate("/hr-test")}
              >
                HR Page
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-6">
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
