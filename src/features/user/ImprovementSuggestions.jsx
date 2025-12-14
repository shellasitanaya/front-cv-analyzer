import React from 'react';

function ImprovementSuggestions({ analysisData, compact = false }) {
  if (!analysisData) return null;

  const geminiData = analysisData.gemini_result || {};
  const aiAnalysis = geminiData.ai_analysis || {};
  const suggestions = aiAnalysis.skills_analysis || [];
  const generalSuggestion = aiAnalysis.suggestion;

  // Filter only items that are NOT Expert (Intermediate, Beginner, Missing)
  const priorityItems = suggestions.filter(s => s.score < 10).slice(0, 2);

  return (
    <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
      
      {/* 1. Critical Gaps (Yellow Card style) */}
      {priorityItems.length > 0 ? priorityItems.map((item, idx) => (
        <div key={idx} className="bg-[#FFFBEB] border border-[#FCD34D] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#F59E0B]"></div>
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-slate-800 mb-1">Improve: {item.skill}</h4>
              <p className="text-sm text-slate-600 mb-3">{item.reason}</p>
              <span className="bg-[#FEF3C7] text-[#D97706] text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                Medium Priority
              </span>
            </div>
          </div>
        </div>
      )) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <p className="text-green-800 font-medium">Great job! No critical skill gaps found.</p>
        </div>
      )}

      {/* 2. General Strategy (Blue Card style) */}
      {generalSuggestion && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#3B82F6]"></div>
          <div className="flex items-start gap-4">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-bold text-slate-800 mb-1">Strategic Advice</h4>
              <p className="text-sm text-slate-600 mb-3">{generalSuggestion}</p>
              <span className="bg-[#DBEAFE] text-[#2563EB] text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                High Priority
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImprovementSuggestions;