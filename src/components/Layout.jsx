import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthAPI } from "../services/Api";
import { jwtDecode } from "jwt-decode";

// Definisikan routes yang boleh diakses oleh masing-masing role
const allowedRoutes = {
  user: ["/user-cv-analysis", "/user-test", "/fill-data", "/preview"],
  hr: ["/hr-test", "/hr-screening", "/hr-ranking", "/user-cv-analysis", "/user-test"],
  admin: ["/user-cv-analysis", "/user-test", "/hr-test", "/hr-screening", "/admin-dashboard"]
};

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user role from token
  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }
    
    try {
      const payload = jwtDecode(token);
      return payload.sub?.role || payload.role;
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      return null;
    }
  };

  const userRole = getUserRole();

  // Jika tidak ada userRole (berarti redirect ke login), jangan render apapun
  if (!userRole) {
    return null;
  }

  const handleLogout = () => {
    AuthAPI.logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "bg-[#94B0DA] text-white" : "text-[#343F3E] hover:bg-[#DCEDFF]";
  };

  // Navigation items berdasarkan role - HANYA routes yang diizinkan
  const getNavigationItems = () => {
    const items = [];
    const userAllowedRoutes = allowedRoutes[userRole] || [];
    
    if (userAllowedRoutes.includes("/user-cv-analysis")) {
      items.push({
        label: "CV Analysis",
        path: "/user-cv-analysis",
        icon: "📊"
      });
    }
    
    if (userAllowedRoutes.includes("/user-test")) {
      items.push({
        label: "CV Generator", 
        path: "/user-test",
        icon: "🎨"
      });
    }
    
    if (userAllowedRoutes.includes("/hr-test")) {
      items.push({
        label: "Candidate Search",
        path: "/hr-test", 
        icon: "🔍"
      });
    }
    
    if (userAllowedRoutes.includes("/hr-screening")) {
      items.push({
        label: "Screening",
        path: "/hr-screening",
        icon: "📋"
      });
    }
    
    if (userAllowedRoutes.includes("/hr-ranking")) {
      items.push({
        label: "Ranking",
        path: "/hr-ranking",
        icon: "🏆"
      });
    }
    
    if (userAllowedRoutes.includes("/admin-dashboard")) {
      items.push({
        label: "Admin",
        path: "/admin-dashboard",
        icon: "⚙️"
      });
    }
    
    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Side Navbar */}
      <aside className="w-64 bg-white shadow-xl border-r border-[#DCEDFF] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#DCEDFF]">
          <div className="text-2xl font-bold text-[#343F3E] mb-2">
            Smart CV Analyzer
          </div>
          <div className="text-sm text-[#94B0DA] font-medium">
            {userRole ? `${userRole.toUpperCase()} DASHBOARD` : 'GUEST'}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium flex items-center gap-3 ${isActive(item.path)}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User Info & Logout */}
        <div className="p-6 border-t border-[#DCEDFF]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-[#505A5B]">
              Logged in as <span className="font-semibold text-[#343F3E]">{userRole}</span>
            </div>
          </div>
          <button
            className="w-full bg-[#8F91A2] hover:bg-[#505A5B] text-white py-3 rounded-lg transition-colors duration-200 font-semibold flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}