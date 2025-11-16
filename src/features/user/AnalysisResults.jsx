import React from 'react';

function AnalysisResults({ analysisData }) {
  if (!analysisData) return null;

  const { match_score, ats_friendliness, keyword_analysis, job_info, parsed_info } = analysisData;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getATSStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
        <h2 className="text-2xl font-bold text-[#343F3E] mb-2">CV Analysis Results</h2>
        <p className="text-[#505A5B] mb-6">
          Comprehensive analysis of your CV performance for {job_info?.name}
        </p>
        
        {/* Overall Score */}
        <div className="text-center mb-6">
          <div className="text-sm text-[#505A5B] mb-2">Overall Score</div>
          <div className={`text-5xl font-bold ${getScoreColor(match_score)} mb-2`}>
            {match_score}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
            <div
              className={`h-3 rounded-full ${getScoreBgColor(match_score)} ${getScoreColor(match_score).replace('text-', 'bg-')}`}
              style={{ width: `${match_score}%` }}
            ></div>
          </div>
        </div>

        {/* Job Description */}
        {job_info && (
          <div className="bg-[#F8FAFF] rounded-lg p-4">
            <h3 className="font-semibold text-[#343F3E] mb-2">{job_info.name}</h3>
            <p className="text-sm text-[#505A5B]">{job_info.description}</p>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Keyword Match */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#DCEDFF] text-center">
          <div className="text-2xl font-bold text-[#343F3E] mb-2">{match_score}%</div>
          <div className="text-sm text-[#505A5B] mb-1">Keyword Match</div>
          <div className="text-xs text-[#8F91A2]">
            {match_score}% match with target job requirements
          </div>
        </div>

        {/* Total Words */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#DCEDFF] text-center">
          <div className="text-2xl font-bold text-[#343F3E] mb-2">{keyword_analysis?.total_words || 0}</div>
          <div className="text-sm text-[#505A5B] mb-1">Total Words</div>
          <div className="text-xs text-[#8F91A2]">Document length</div>
        </div>

        {/* Skills Found */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#DCEDFF] text-center">
          <div className="text-2xl font-bold text-[#343F3E] mb-2">{keyword_analysis?.skills_found || 0}</div>
          <div className="text-sm text-[#505A5B] mb-1">Skills Found</div>
          <div className="text-xs text-[#8F91A2]">Relevant skills detected</div>
        </div>
      </div>

      {/* ATS Check */}
      {ats_friendliness && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
          <h3 className="text-xl font-bold text-[#343F3E] mb-6">ATS Check</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ATS Compatibility */}
            <div className="text-center">
              <div className="text-3xl font-bold text-[#343F3E] mb-2">
                {ats_friendliness.compatibility_score || 44}%
              </div>
              <div className="text-sm text-[#505A5B] mb-1">ATS Compatibility</div>
              <div className={`text-sm font-medium ${
                (ats_friendliness.compatibility_score || 44) >= 60 ? 'text-green-600' : 
                (ats_friendliness.compatibility_score || 44) >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getATSStatus(ats_friendliness.compatibility_score || 44)}
              </div>
            </div>

            {/* ATS Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#505A5B]">Format Check</span>
                <span className={`font-medium ${
                  ats_friendliness.format_check === "Good" ? 'text-green-600' : 'text-red-600'
                }`}>
                  {ats_friendliness.format_check || "Needs Improvement"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#505A5B]">Readability</span>
                <span className={`font-medium ${
                  ats_friendliness.readability === "Good" ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {ats_friendliness.readability || "Fair"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#505A5B]">Sections</span>
                <span className={`font-medium ${
                  ats_friendliness.sections_status === "Complete" ? 'text-green-600' : 'text-red-600'
                }`}>
                  {ats_friendliness.sections_status || "Incomplete"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#505A5B]">Contact Info</span>
                <span className="font-medium text-green-600">
                  {ats_friendliness.contact_info?.email_found && ats_friendliness.contact_info?.phone_found ? "Complete" : "Incomplete"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
        <h3 className="text-xl font-bold text-[#343F3E] mb-6">Score Breakdown</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#343F3E]">{match_score}%</div>
            <div className="text-sm text-[#505A5B]">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#343F3E]">
              {Math.round(match_score * 0.8)}%
            </div>
            <div className="text-sm text-[#505A5B]">Content Quality</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#343F3E]">
              {ats_friendliness?.compatibility_score || 44}%
            </div>
            <div className="text-sm text-[#505A5B]">ATS Optimization</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#343F3E]">
              {parsed_info?.experience_years || 0}
            </div>
            <div className="text-sm text-[#505A5B]">Experience Years</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisResults;