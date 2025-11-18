import React from 'react';

function ImprovementSuggestions({ analysisData }) {
  if (!analysisData) return null;

  const suggestions = [
    {
      priority: 'high',
      title: 'Tambah Keyword Teknis yang Relevan',
      description: 'Sertakan teknologi dan tools spesifik yang disebutkan dalam deskripsi pekerjaan',
      keywords: analysisData.keyword_analysis?.missing_keywords?.slice(0, 5) || ['ERP', 'BPMN', 'SQL', 'Power BI']
    },
    {
      priority: 'medium', 
      title: 'Kuantifikasi Pencapaian',
      description: 'Tambahkan angka dan metrik spesifik untuk pencapaian Anda',
      examples: ['Meningkatkan efisiensi 30%', 'Mengurangi biaya 25%', 'Memimpin tim 5 orang']
    },
    {
      priority: 'medium',
      title: 'Optimasi Section ATS',
      description: 'Lengkapi bagian yang diperlukan untuk parsing ATS yang lebih baik',
      actions: ['Pastikan section Experience lengkap', 'Tambahkan section Skills terstruktur', 'Include education details']
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Priority';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
      <h2 className="text-2xl font-bold text-[#343F3E] mb-2">Top Improvement Suggestions</h2>
      <p className="text-[#505A5B] mb-6">Implement these suggestions to improve your CV score</p>
      
      <div className="space-y-6">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`border-l-4 rounded-r-lg p-6 ${getPriorityColor(suggestion.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#343F3E]">
                {suggestion.title}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {getPriorityText(suggestion.priority)}
              </span>
            </div>
            
            <p className="text-[#505A5B] mb-4">
              {suggestion.description}
            </p>
            
            {suggestion.keywords && (
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-sm font-medium text-[#343F3E] mb-2">Recommended Keywords:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#DCEDFF] text-[#343F3E] text-sm rounded-full font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {suggestion.examples && (
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-sm font-medium text-[#343F3E] mb-2">Example Metrics:</p>
                <ul className="text-sm text-[#505A5B] list-disc list-inside space-y-1">
                  {suggestion.examples.map((example, idx) => (
                    <li key={idx}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {suggestion.actions && (
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-sm font-medium text-[#343F3E] mb-2">Actions:</p>
                <ul className="text-sm text-[#505A5B] list-disc list-inside space-y-1">
                  {suggestion.actions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-[#F8FAFF] rounded-lg border border-[#DCEDFF]">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-[#343F3E] mb-1">Pro Tip</h4>
            <p className="text-sm text-[#505A5B]">
              Implement these suggestions to improve your CV score and increase your chances of getting hired.
              Focus on high-priority items first for maximum impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImprovementSuggestions;