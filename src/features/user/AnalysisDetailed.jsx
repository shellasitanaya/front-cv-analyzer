import React from 'react';

function AnalysisDetailed({ analysisData }) {
  if (!analysisData) return null;

  const { match_score, gemini_result, job_info } = analysisData;
  const aiAnalysis = gemini_result?.ai_analysis || {};
  const skills = aiAnalysis.skills_analysis || [];
  const suggestion = aiAnalysis.suggestion;

  const getLevelBadge = (level) => {
    const l = level?.toLowerCase() || '';
    if (l.includes('expert') || l.includes('strong')) 
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md border border-green-200">EXPERT</span>;
    if (l.includes('intermediate') || l.includes('good')) 
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md border border-blue-200">INTERMEDIATE</span>;
    if (l.includes('beginner') || l.includes('mentioned')) 
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md border border-yellow-200">BEGINNER</span>;
    return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md border border-red-200">MISSING</span>;
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Detail Header */}
      <div className="flex justify-between items-center pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Deep Skill Analysis</h2>
          <p className="text-slate-500 text-sm">Detailed breakdown against <span className="text-[#94B0DA] font-semibold">{job_info?.title}</span></p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 uppercase font-bold">Final Score</span>
          <div className="text-3xl font-extrabold text-[#94B0DA]">{match_score}%</div>
        </div>
      </div>

      {/* 2. Skills Breakdown List */}
      <div className="grid grid-cols-1 gap-4">
        {skills.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No specific skill analysis available.</p>
        ) : (
          skills.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row gap-4">
              
              {/* Left: Skill Name & Level */}
              <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-50 pb-2 md:pb-0 md:pr-4">
                <div className="flex justify-between md:block items-center">
                  <h4 className="font-bold text-slate-800 text-md">{item.skill}</h4>
                  <div className="mt-1 md:mt-2">
                    {getLevelBadge(item.level)}
                  </div>
                </div>
                {/* Score Bar */}
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 hidden md:block">
                  <div 
                    className={`h-1.5 rounded-full ${item.score >= 7.5 ? 'bg-green-400' : 'bg-orange-400'}`} 
                    style={{ width: `${item.score * 10}%` }}
                  ></div>
                </div>
              </div>

              {/* Right: AI Reasoning */}
              <div className="md:w-2/3">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">AI Reasoning & Advice</p>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{item.reason}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Final Strategic Advice */}
      {suggestion && (
        <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-xl p-6">
          <h3 className="font-bold text-[#92400E] mb-2 flex items-center gap-2">
            <span>💡</span> Strategic Recommendation
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