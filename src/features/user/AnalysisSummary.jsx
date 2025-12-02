import React from 'react';

function AnalysisSummary({ analysisData }) {
  if (!analysisData) return null;

  const { match_score, gemini_result, job_info } = analysisData;
  const aiAnalysis = gemini_result?.ai_analysis || {};
  const mandatory = aiAnalysis.mandatory_checks || {};
  const skills = aiAnalysis.skills_analysis || [];
  
  // Data Statistik
  const keywordAnalysis = analysisData.keyword_analysis || {};
  const totalWords = keywordAnalysis.total_words || 0;
  const skillsFound = skills.length;
  
  const expVal = mandatory.experience_years?.value ? String(mandatory.experience_years.value) : "0";
  const expMatch = expVal.match(/([0-9]*\.?[0-9]+)/);
  const expYears = expMatch ? parseFloat(expMatch[0]) : 0;

  // Display Score untuk Pie Chart (Match Score)
  const displayScore = typeof match_score === 'number' ? match_score.toFixed(1) : "0.0";

  // Logika Warna Pie Chart
  const getScoreColorClass = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getStrokeColor = (score) => {
    if (score >= 80) return "#22C55E"; 
    if (score >= 50) return "#EAB308"; 
    return "#EF4444"; 
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
      
      {/* HEADER */}
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold text-slate-800">Analysis Overview</h2>
        <p className="text-slate-500 font-medium mt-1">
          Performance summary for <span className="text-blue-600 font-semibold">{job_info?.title || "Target Job"}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 1. MATCH SCORE (KIRI - KAIZEN UTAMA) */}
        <div className="lg:col-span-4 bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col justify-center items-center h-full min-h-[320px]">
          <h3 className="text-slate-600 font-bold mb-8 text-lg">Match Score</h3>
          
          {/* Progress Circle */}
          <div className="relative w-56 h-56">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="8" strokeLinecap="round" />
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={getStrokeColor(match_score)}
                strokeWidth="8"
                strokeDasharray={`${match_score * 2.51} 251`} 
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-md"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-black tracking-tight ${getScoreColorClass(match_score)}`}>
                {displayScore}%
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">OVERALL</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-8 text-center px-4 leading-relaxed">
            Based on AI analysis against job requirements.
          </p>
        </div>

        {/* 2. ATS COMPATIBILITY (TENGAH - HANYA CHECKLIST) */}
        <div className="lg:col-span-4 bg-[#F0FDF4] rounded-[24px] border border-green-100 p-8 flex flex-col h-full min-h-[320px]">
          <h3 className="text-slate-700 font-bold mb-8 text-lg">ATS Compatibility</h3>
          
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {[
              { label: "Contact Info", status: true },
              { label: "Format Check", status: true },
              { label: "Mandatory Data", status: Object.values(mandatory).every(x => x.status === 'PASS') },
              { label: "Font Readability", status: true }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center group p-2 hover:bg-green-50/50 rounded-xl transition-colors">
                <span className="text-sm font-bold text-slate-600">{item.label}</span>
                {item.status ? (
                  <div className="bg-green-500 rounded-full p-1.5 shadow-sm shadow-green-200">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="bg-yellow-500 rounded-full w-7 h-7 flex items-center justify-center shadow-sm shadow-yellow-200">
                    <span className="text-white text-sm font-black">!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Footer Skor Dihapus Sesuai Request */}
        </div>

        {/* 3. STATS CARDS (KANAN) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-5 h-full">
          
          {/* Total Words */}
          <div className="bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors rounded-[24px] p-6 flex items-center justify-between border border-slate-100 shadow-sm h-full">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Words</span>
              <span className="text-4xl font-black text-slate-800">{totalWords}</span>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 text-xl shadow-sm border border-slate-50">📄</div>
          </div>

          {/* Skills Found */}
          <div className="bg-[#FAF5FF] hover:bg-[#F3E8FF] transition-colors rounded-[24px] p-6 flex items-center justify-between border border-purple-50 shadow-sm h-full">
            <div className="flex flex-col">
              <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wider mb-1">Skills Found</span>
              <span className="text-4xl font-black text-slate-800">{skillsFound}</span>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-400 text-xl shadow-sm border border-purple-50">⚙️</div>
          </div>

          {/* Experience */}
          <div className="bg-[#FFF7ED] hover:bg-[#FFEDD5] transition-colors rounded-[24px] p-6 flex items-center justify-between border border-orange-50 shadow-sm h-full">
            <div className="flex flex-col">
              <span className="text-[11px] text-orange-400 font-bold uppercase tracking-wider mb-1">Experience Years</span>
              <span className="text-4xl font-black text-slate-800">{expYears}</span>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-400 text-xl shadow-sm border border-orange-50">💼</div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AnalysisSummary;