import React from 'react';

function AnalysisResults({ analysisData }) {
  if (!analysisData) return null;

  console.log('🔍 Analysis Data Received:', analysisData); // DEBUG

  const { 
    match_score, 
    ats_friendliness, 
    keyword_analysis, 
    job_info, 
    parsed_info,
    astra_scoring_detail,
    requirements_check
  } = analysisData;

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

  const getStatusIcon = (passed) => {
    return passed ? '✅' : '❌';
  };

  // Calculate actual experience years from parsed info
  const experienceYears = parsed_info?.experience || parsed_info?.experience_years || 0;

  return (
    <div className="space-y-6">
      {/* Debug Info - Hanya untuk development */}
      {process.env.NODE_ENV === 'development' && astra_scoring_detail && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">Debug Info (Development Only)</h3>
          <div className="text-xs text-yellow-700 overflow-auto max-h-40">
            <strong>Astra Scoring:</strong> {JSON.stringify(astra_scoring_detail, null, 2)}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
        <h2 className="text-2xl font-bold text-[#343F3E] mb-2">CV Analysis Results</h2>
        <p className="text-[#505A5B] mb-6">
          Comprehensive analysis of your CV performance for {job_info?.name}
        </p>
        
        {/* Overall Score */}
        <div className="text-center mb-6">
          <div className="text-sm text-[#505A5B] mb-2">Overall Match Score</div>
          <div className={`text-5xl font-bold ${getScoreColor(match_score)} mb-2`}>
            {match_score}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
            <div
              className={`h-3 rounded-full ${getScoreBgColor(match_score)} ${getScoreColor(match_score).replace('text-', 'bg-')}`}
              style={{ width: `${Math.min(match_score, 100)}%` }}
            ></div>
          </div>
          {requirements_check && (
            <div className={`mt-2 text-sm font-medium ${requirements_check.passed ? 'text-green-600' : 'text-red-600'}`}>
              {requirements_check.passed ? '✅ Meets Basic Requirements' : '❌ Does Not Meet Basic Requirements'}
            </div>
          )}
        </div>

        {/* Job Description */}
        {job_info && (
          <div className="bg-[#F8FAFF] rounded-lg p-4">
            <h3 className="font-semibold text-[#343F3E] mb-2">{job_info.name}</h3>
            <p className="text-sm text-[#505A5B] mb-3">{job_info.description}</p>
            {job_info.requirements && (
              <div className="text-xs text-[#505A5B]">
                <strong>Requirements:</strong> {job_info.requirements}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Requirements Check */}
      {requirements_check && !requirements_check.passed && (
        <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-red-800 mb-4">Requirements Not Met</h3>
          <ul className="space-y-2">
            {requirements_check.reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-red-700">
                <span>❌</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Keyword Match */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#DCEDFF] text-center">
          <div className={`text-2xl font-bold ${getScoreColor(match_score)} mb-2`}>{match_score}%</div>
          <div className="text-sm text-[#505A5B] mb-1">Job Match</div>
          <div className="text-xs text-[#8F91A2]">Based on requirements</div>
        </div>

        {/* Skills Found */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#DCEDFF] text-center">
          <div className="text-2xl font-bold text-[#343F3E] mb-2">
            {keyword_analysis?.skills_found || parsed_info?.skills?.length || 0}
          </div>
          <div className="text-sm text-[#505A5B] mb-1">Skills Found</div>
          <div className="text-xs text-[#8F91A2]">Relevant skills</div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#DCEDFF] text-center">
          <div className="text-2xl font-bold text-[#343F3E] mb-2">{experienceYears}</div>
          <div className="text-sm text-[#505A5B] mb-1">Experience Years</div>
          <div className="text-xs text-[#8F91A2]">Total experience</div>
        </div>

        {/* Education Level */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#DCEDFF] text-center">
          <div className="text-2xl font-bold text-[#343F3E] mb-2">
            {parsed_info?.education ? parsed_info.education : 'N/A'}
          </div>
          <div className="text-sm text-[#505A5B] mb-1">Education</div>
          <div className="text-xs text-[#8F91A2]">Highest degree</div>
        </div>
      </div>

      {/* ATS Check */}
      {ats_friendliness && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
          <h3 className="text-xl font-bold text-[#343F3E] mb-6">ATS Compatibility Check</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ATS Compatibility */}
            <div className="text-center">
              <div className="text-3xl font-bold text-[#343F3E] mb-2">
                {ats_friendliness.compatibility_score || 0}%
              </div>
              <div className="text-sm text-[#505A5B] mb-1">ATS Compatibility</div>
              <div className={`text-sm font-medium ${
                (ats_friendliness.compatibility_score || 0) >= 60 ? 'text-green-600' : 
                (ats_friendliness.compatibility_score || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getATSStatus(ats_friendliness.compatibility_score || 0)}
              </div>
            </div>

            {/* ATS Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#505A5B]">Format</span>
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
                <span className={`font-medium ${
                  ats_friendliness.contact_info?.email_found && ats_friendliness.contact_info?.phone_found ? 'text-green-600' : 'text-red-600'
                }`}>
                  {ats_friendliness.contact_info?.email_found && ats_friendliness.contact_info?.phone_found ? "Complete" : "Incomplete"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyword Analysis */}
      {keyword_analysis && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
          <h3 className="text-xl font-bold text-[#343F3E] mb-6">Keyword Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <div>
              <h4 className="font-semibold text-green-600 mb-3">✅ Matched Keywords ({keyword_analysis.matched_keywords?.length || 0})</h4>
              <div className="flex flex-wrap gap-2">
                {keyword_analysis.matched_keywords?.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {keyword}
                  </span>
                )) || <span className="text-gray-500">No matches found</span>}
              </div>
            </div>

            {/* Missing Keywords */}
            <div>
              <h4 className="font-semibold text-red-600 mb-3">❌ Missing Keywords ({keyword_analysis.missing_keywords?.length || 0})</h4>
              <div className="flex flex-wrap gap-2">
                {keyword_analysis.missing_keywords?.slice(0, 10).map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    {keyword}
                  </span>
                )) || <span className="text-gray-500">All important keywords found</span>}
              </div>
              {keyword_analysis.missing_keywords?.length > 10 && (
                <p className="text-xs text-gray-500 mt-2">
                  ... and {keyword_analysis.missing_keywords.length - 10} more
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
        <h3 className="text-xl font-bold text-[#343F3E] mb-6">Detailed Breakdown</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(match_score)}`}>{match_score}%</div>
            <div className="text-sm text-[#505A5B]">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#343F3E]">
              {keyword_analysis?.match_percentage ? Math.round(keyword_analysis.match_percentage) : Math.round(match_score * 0.7)}%
            </div>
            <div className="text-sm text-[#505A5B]">Keyword Match</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#343F3E]">
              {ats_friendliness?.compatibility_score || 0}%
            </div>
            <div className="text-sm text-[#505A5B]">ATS Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#343F3E]">
              {experienceYears}y
            </div>
            <div className="text-sm text-[#505A5B]">Experience</div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {(parsed_info?.name || parsed_info?.email) && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
          <h3 className="text-xl font-bold text-[#343F3E] mb-4">Extracted Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {parsed_info.name && (
              <div>
                <span className="font-medium text-[#505A5B]">Name:</span> {parsed_info.name}
              </div>
            )}
            {parsed_info.email && (
              <div>
                <span className="font-medium text-[#505A5B]">Email:</span> {parsed_info.email}
              </div>
            )}
            {parsed_info.phone && (
              <div>
                <span className="font-medium text-[#505A5B]">Phone:</span> {parsed_info.phone}
              </div>
            )}
            {parsed_info.education && (
              <div>
                <span className="font-medium text-[#505A5B]">Education:</span> {parsed_info.education}
              </div>
            )}
            {parsed_info.gpa > 0 && (
              <div>
                <span className="font-medium text-[#505A5B]">GPA:</span> {parsed_info.gpa}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisResults;