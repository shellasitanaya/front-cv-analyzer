import React from 'react';

function AnalysisDetailed({ analysisData }) {
  if (!analysisData) return null;

  const { match_score, gemini_result, job_info } = analysisData;
  const aiAnalysis = gemini_result?.ai_analysis || {};
  const skills = aiAnalysis.skills_analysis || [];
  const suggestion = aiAnalysis.suggestion;

  // Helper Badge Baru (Sesuai Prompt Optimizer)
  const getLevelBadge = (level) => {
    const l = level?.toLowerCase() || '';
    
    // Level 1: Strong (10) - Hijau
    if (l.includes('strong') || l.includes('expert')) 
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md border border-green-200">SANGAT MEYAKINKAN</span>;
    
    // Level 2: Standard (7.5) - Biru
    if (l.includes('standard') || l.includes('intermediate') || l.includes('good')) 
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md border border-blue-200">KONTEKS CUKUP</span>;
    
    // Level 3: Listed/Mentioned (5.0) - Kuning
    if (l.includes('listed') || l.includes('mentioned') || l.includes('beginner')) 
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md border border-yellow-200">KURANG KONTEKS</span>;
    
    // Level 4: Missing (0) - Merah
    return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md border border-red-200">TIDAK DITEMUKAN</span>;
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Detail Header */}
      <div className="flex justify-between items-center pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Audit Kualitas Skill</h2>
          <p className="text-slate-500 text-sm">Analisis bukti kompetensi terhadap <span className="text-[#94B0DA] font-semibold">{job_info?.title}</span></p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 uppercase font-bold">Final Score</span>
          <div className="text-3xl font-extrabold text-[#94B0DA]">{match_score}%</div>
        </div>
      </div>

      {/* 2. Skills Breakdown List */}
      <div className="grid grid-cols-1 gap-4">
        {skills.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Tidak ada analisis skill spesifik.</p>
        ) : (
          skills.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row gap-4">
              
              {/* Kiri: Nama & Status */}
              <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-50 pb-2 md:pb-0 md:pr-4">
                <div className="flex justify-between md:block items-center">
                  <h4 className="font-bold text-slate-800 text-md">{item.skill}</h4>
                  <div className="mt-1 md:mt-2">
                    {getLevelBadge(item.level)}
                  </div>
                </div>
                {/* Mini Progress Bar */}
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 hidden md:block">
                  <div 
                    className={`h-1.5 rounded-full ${
                        item.score >= 10 ? 'bg-green-400' : 
                        item.score >= 7.5 ? 'bg-blue-400' : 
                        item.score >= 5 ? 'bg-yellow-400' : 'bg-red-400'
                    }`} 
                    style={{ width: `${item.score * 10}%` }}
                  ></div>
                </div>
              </div>

              {/* Kanan: Feedback Optimizer */}
              <div className="md:w-2/3">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Saran Optimasi</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.reason}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Strategic Advice */}
      {suggestion && (
        <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-xl p-6">
          <h3 className="font-bold text-[#92400E] mb-2 flex items-center gap-2">
            <span>💡</span> Rekomendasi Strategis
          </h3>
          <p className="text-[#B45309] text-sm leading-relaxed">
            {suggestion}
          </p>
        </div>
      )}

    </div>
  );
}

export default AnalysisDetailed;