import React from 'react';

function MyCVsSection() {
  // Sample data - nanti bisa diambil dari API
  const myCVs = [
    {
      id: 1,
      filename: "sarah_johnson_cv.pdf",
      uploadDate: "Mar 15, 2024",
      status: "Analyzed",
      score: 85,
      jobType: "ERP Business Analyst",
      language: "English"
    },
    {
      id: 2,
      filename: "cv_budi_santoso.docx", 
      uploadDate: "Mar 12, 2024",
      status: "Pending",
      score: null,
      jobType: "IT Data Engineer",
      language: "Bahasa Indonesia"
    },
    {
      id: 3,
      filename: "marketing_specialist_cv.pdf",
      uploadDate: "Mar 08, 2024", 
      status: "Analyzed",
      score: 72,
      jobType: "ERP Business Analyst",
      language: "Bilingual"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Analyzed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getLanguageIcon = (language) => {
    switch (language) {
      case 'English': return '🇺🇸';
      case 'Bahasa Indonesia': return '🇮🇩';
      case 'Bilingual': return '🌐';
      default: return '📄';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#343F3E]">
            My CVs
          </h2>
          <p className="text-[#505A5B]">
            Manage and track your uploaded CVs
          </p>
        </div>
        <div className="text-sm text-[#8F91A2]">
          {myCVs.length} CVs uploaded
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#DCEDFF]">
              <th className="text-left py-4 px-4 font-semibold text-[#343F3E]">File</th>
              <th className="text-left py-4 px-4 font-semibold text-[#343F3E]">Upload Date</th>
              <th className="text-left py-4 px-4 font-semibold text-[#343F3E]">Job Type</th>
              <th className="text-left py-4 px-4 font-semibold text-[#343F3E]">Language</th>
              <th className="text-left py-4 px-4 font-semibold text-[#343F3E]">Status</th>
              <th className="text-left py-4 px-4 font-semibold text-[#343F3E]">Score</th>
              <th className="text-left py-4 px-4 font-semibold text-[#343F3E]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myCVs.map((cv) => (
              <tr key={cv.id} className="border-b border-[#DCEDFF] hover:bg-[#DCEDFF] transition-colors group">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getLanguageIcon(cv.language)}</span>
                    <div>
                      <div className="font-medium text-[#343F3E] group-hover:text-[#505A5B] transition-colors">
                        {cv.filename}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-[#505A5B]">{cv.uploadDate}</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#94B0DA] text-white">
                    {cv.jobType}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-[#505A5B]">{cv.language}</span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cv.status)}`}>
                    {cv.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {cv.score ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(cv.score)}`}>
                      {cv.score}%
                    </span>
                  ) : (
                    <span className="text-[#8F91A2]">-</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button 
                      className="p-2 text-[#94B0DA] hover:bg-[#94B0DA] hover:text-white rounded-lg transition-colors"
                      title="View Analysis"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      className="p-2 text-[#94B0DA] hover:bg-[#94B0DA] hover:text-white rounded-lg transition-colors"
                      title="Download"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button 
                      className="p-2 text-[#8F91A2] hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {myCVs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-[#8F91A2] text-lg">No CVs uploaded yet.</p>
          <p className="text-[#505A5B] text-sm mt-1">Upload your first CV to get started!</p>
        </div>
      )}

      {/* Upload Info */}
      <div className="mt-6 p-4 bg-[#DCEDFF] rounded-lg border border-[#94B0DA]">
        <div className="flex items-center gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <p className="text-sm text-[#505A5B]">
              <strong>Supported Formats:</strong> PDF, DOCX (Max 10MB)
            </p>
            <p className="text-sm text-[#505A5B]">
              <strong>Languages:</strong> Bahasa Indonesia & English
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyCVsSection;