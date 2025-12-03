import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Terima prop 'activeFeature' ('analyze' atau 'generate')
export default function Layout({ children, activeFeature = 'analyze' }) {
  const navigate = useNavigate();
  const location = useLocation();

  let userRole = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = jwtDecode(token);
      userRole = payload.role;
    } catch (e) {
      localStorage.removeItem("token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNavigation = (path, hash = "") => {
    if (location.pathname === path) {
      if (hash) {
        const element = document.getElementById(hash);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      navigate(path, { state: { scrollTo: hash } });
    }
  };

  // --- LOGIKA MENU DINAMIS ---
  const getNavItems = () => {
    let items = [];

    // MENU KHUSUS HR / ADMIN (Selalu muncul di atas atau bawah, tergantung preferensi)
    // Disini saya taruh logic agar HR punya menu sendiri, tapi User punya menu dinamis
    
    if (userRole === 'hr' || userRole === 'admin') {
       // Menu HR tetap konsisten
       items = [
         { label: "Dashboard", path: "/user-cv-analysis", hash: "" }, // HR juga butuh akses dashboard user
         { label: "Candidate Search", path: "/talent-pool" },
          { label: "Job Posting", path: "/create-job" },
         { label: "Screening", path: "/hr-screening" },
       ];
    } 
    
    // JIKA USER (atau HR yang sedang di halaman User Dashboard)
    if (activeFeature === 'analyze') {
      // --- MENU ANALYSIS ---
      items = [
        { label: "Dashboard", path: "/user-cv-analysis", hash: "" },
        { label: "Analyze CV", path: "/user-cv-analysis", hash: "upload-section" },
        { label: "History", path: "/user-cv-analysis", hash: "history-section" },
        // Tambahkan menu HR di bawah jika dia HR
        ...(userRole === 'hr' || userRole === 'admin' ? [
            { label: "--- HR Tools ---", path: "#", disabled: true },
            { label: "Candidate Search", path: "/talent-pool" },
            { label: "Job Posting", path: "/create-job" },
            { label: "Screening", path: "/hr-screening" }
        ] : [])
      ];
    } else if (activeFeature === 'generate') {
      // --- MENU GENERATOR ---
      items = [
        { label: "Templates", path: "/user-cv-analysis", hash: "" },
        { label: "My Resumes", path: "/user-cv-analysis", hash: "saved-resumes" }, // Placeholder jika nanti ada fitur save
        // Tambahkan menu HR di bawah jika dia HR
        ...(userRole === 'hr' || userRole === 'admin' ? [
            { label: "--- HR Tools ---", path: "#", disabled: true },
            { label: "Candidate Search", path: "/talent-pool" },
            { label: "Job Posting", path: "/create-job" },
            { label: "Screening", path: "/hr-screening" }
        ] : [])
      ];
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="flex min-h-screen bg-[#F8FAFF] font-sans">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-8 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-[#94B0DA] rounded-lg flex items-center justify-center text-white font-bold text-lg">B</div>
          <h1 className="font-bold text-[#343F3E] text-lg leading-tight">Smart CV <br/> Analyzer</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item, idx) => {
             if (item.disabled) {
                 return (
                    <div key={idx} className="px-5 py-2 text-xs font-bold text-gray-300 uppercase mt-2">
                        {item.label}
                    </div>
                 )
             }

            // Highlight Logic: Cek path DAN hash (khususnya untuk Analysis vs History)
            const isActive = location.pathname === item.path && (!item.hash || location.hash === `#${item.hash}`);
            
            return (
              <button
                key={idx}
                onClick={() => handleNavigation(item.path, item.hash)}
                className={`w-full flex items-center px-5 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                  isActive 
                    ? "bg-[#94B0DA] text-white shadow-md shadow-blue-100" 
                    : "text-[#505A5B] hover:bg-[#DCEDFF] hover:text-[#343F3E]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button onClick={handleLogout} className="flex items-center gap-3 text-[#8F91A2] hover:text-red-500 transition-colors w-full px-2">
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-10 sticky top-0 bg-[#F8FAFF]/90 backdrop-blur-sm z-10 py-4">
          <div>
            <h2 className="text-2xl font-bold text-[#343F3E]">
              {activeFeature === 'generate' ? 'CV Builder' : 'Dashboard'}
            </h2>
            <p className="text-[#8F91A2] text-sm">
                {activeFeature === 'generate' ? 'Create professional resumes in minutes' : 'Optimize your resume with AI insights'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#DCEDFF] flex items-center justify-center text-[#94B0DA] font-bold text-xs">
              {userRole ? userRole.substring(0,2).toUpperCase() : 'US'}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#343F3E] capitalize">{userRole || 'Guest'}</p>
              <p className="text-[10px] text-[#8F91A2]">Active</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}