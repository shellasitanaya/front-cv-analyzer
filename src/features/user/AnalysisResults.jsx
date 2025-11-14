import React from 'react';

function AnalysisResults({ analysisData }) {
  const { overview, ats_check, score, job_info } = analysisData;

  // Function untuk determine score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#343F3E]">
            CV Analysis Results
          </h2>
          <p className="text-[#505A5B] mt-1">
            Comprehensive analysis of your CV performance {job_info?.nama && `for ${job_info.nama}`}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full border-2 ${getScoreBgColor(score?.overall)}`}>
          <span className={`text-lg font-bold ${getScoreColor(score?.overall)}`}>
            Overall Score: {score?.overall || '87'}%
          </span>
        </div>
      </div>

      {/* Job Info */}
      {job_info && (
        <div className="bg-gradient-to-r from-[#DCEDFF] to-[#94B0DA] rounded-xl p-6 mb-8 border border-[#94B0DA]">
          <div className="flex items-start gap-4">
            <div className="text-2xl">🎯</div>
            <div>
              <h3 className="font-bold text-[#343F3E] text-lg mb-2">{job_info.nama}</h3>
              <p className="text-[#505A5B] text-sm">{job_info.deskripsi}</p>
              {job_info.requirements_wajib && (
                <p className="text-[#8F91A2] text-xs mt-2">
                  <strong>Requirements:</strong> {job_info.requirements_wajib}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview Column */}
        <div className="bg-gradient-to-br from-[#DCEDFF] to-white rounded-xl p-6 border border-[#DCEDFF] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">📊</div>
            <h3 className="font-bold text-[#343F3E] text-lg">Overview</h3>
          </div>
          <div className="space-y-4">
            <div className="text-center p-4 bg-white rounded-lg border border-[#DCEDFF]">
              <p className="text-[#505A5B] text-sm">Keyword Match</p>
              <p className="text-3xl font-bold text-[#343F3E] mt-1">
                {overview?.keyword_match || '85%'}
              </p>
              <p className="text-xs text-[#8F91A2] mt-2">
                {overview?.keyword_notes || '85% match with target job requirements'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border border-[#DCEDFF]">
                <p className="text-[#505A5B] text-xs">Total Words</p>
                <p className="text-lg font-semibold text-[#343F3E]">847</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-[#DCEDFF]">
                <p className="text-[#505A5B] text-xs">Skills Found</p>
                <p className="text-lg font-semibold text-[#343F3E]">23</p>
              </div>
            </div>
          </div>
        </div>

        {/* ATS Check Column */}
        <div className="bg-gradient-to-br from-[#DCEDFF] to-white rounded-xl p-6 border border-[#DCEDFF] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">✅</div>
            <h3 className="font-bold text-[#343F3E] text-lg">ATS Check</h3>
          </div>
          <div className="space-y-4">
            <div className="text-center p-4 bg-white rounded-lg border border-[#DCEDFF]">
              <p className="text-[#505A5B] text-sm">ATS Compatibility</p>
              <p className="text-3xl font-bold text-[#343F3E] mt-1">
                {ats_check?.compatibility || '0%'}
              </p>
              <p className={`text-xs mt-2 ${
                parseInt(ats_check?.compatibility) >= 70 ? 'text-green-600' : 
                parseInt(ats_check?.compatibility) >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {ats_check?.ats_status || 'Status: Unknown'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border border-[#DCEDFF]">
                <p className="text-[#505A5B] text-xs">Format Check</p>
                <p className={`text-sm font-semibold ${
                  ats_check?.format_check === 'Pass' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {ats_check?.format_check || 'Checking...'}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-[#DCEDFF]">
                <p className="text-[#505A5B] text-xs">Readability</p>
                <p className={`text-sm font-semibold ${
                  ats_check?.readability === 'Good' ? 'text-green-600' : 
                  ats_check?.readability === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {ats_check?.readability || 'Checking...'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border border-[#DCEDFF]">
                <p className="text-[#505A5B] text-xs">Sections</p>
                <p className={`text-sm font-semibold ${
                  ats_check?.section_headers === 'Complete' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {ats_check?.section_headers || 'Checking...'}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-[#DCEDFF]">
                <p className="text-[#505A5B] text-xs">Contact Info</p>
                <p className={`text-sm font-semibold ${
                  ats_check?.contact_info === 'Complete' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {ats_check?.contact_info || 'Checking...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Column */}
        <div className="bg-gradient-to-br from-[#DCEDFF] to-white rounded-xl p-6 border border-[#DCEDFF] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">🎯</div>
            <h3 className="font-bold text-[#343F3E] text-lg">Score Breakdown</h3>
          </div>
          <div className="space-y-4">
            <div className="text-center p-4 bg-white rounded-lg border border-[#DCEDFF]">
              <p className="text-[#505A5B] text-sm">Overall Score</p>
              <p className="text-3xl font-bold text-[#343F3E] mt-1">
                {score?.overall || '87'}%
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm text-[#505A5B] mb-1">
                  <span>Content Quality</span>
                  <span>{score?.content_quality || 85}%</span>
                </div>
                <div className="w-full bg-[#DCEDFF] rounded-full h-2">
                  <div 
                    className="bg-[#94B0DA] h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${score?.content_quality || 85}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-[#505A5B] mb-1">
                  <span>ATS Optimization</span>
                  <span>{score?.ats_optimization || 92}%</span>
                </div>
                <div className="w-full bg-[#DCEDFF] rounded-full h-2">
                  <div 
                    className="bg-[#94B0DA] h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${score?.ats_optimization || 92}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-center p-3 bg-white rounded-lg border border-[#DCEDFF]">
              <p className="text-[#505A5B] text-xs">Experience Years</p>
              <p className="text-lg font-semibold text-[#343F3E]">5.2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Detection */}
      {analysisData.parsed_info?.language && (
        <div className="mt-6 p-4 bg-[#DCEDFF] rounded-lg border border-[#94B0DA]">
          <div className="flex items-center gap-2 text-sm text-[#505A5B]">
            <span>🌐</span>
            <span>
              <strong>Language Detected:</strong> {analysisData.parsed_info.language === 'id' ? 'Bahasa Indonesia' : 
                analysisData.parsed_info.language === 'en' ? 'English' : 
                analysisData.parsed_info.language === 'mixed' ? 'Bilingual (ID/EN)' : 'Unknown'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisResults;