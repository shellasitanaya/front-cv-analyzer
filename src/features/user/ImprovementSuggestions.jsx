import React from 'react';

function ImprovementSuggestions({ suggestions }) {
  const defaultSuggestions = [
    {
      id: 1,
      title: "Add More Technical Keywords",
      description: "Include specific technologies mentioned in job descriptions",
      priority: "medium"
    },
    {
      id: 2,
      title: "Quantify Achievements", 
      description: "Add specific numbers and metrics to your accomplishments",
      priority: "high"
    },
    {
      id: 3,
      title: "Improve Section Headers",
      description: "Use standard section headers for better ATS parsing",
      priority: "low"
    }
  ];

  const displaySuggestions = suggestions && suggestions.length > 0 ? suggestions : defaultSuggestions;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
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
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-[#343F3E] mb-6">
        Top Improvement Suggestions
      </h2>
      
      <div className="space-y-4">
        {displaySuggestions.map((suggestion) => (
          <div 
            key={suggestion.id}
            className="flex items-start gap-4 p-4 bg-[#DCEDFF] rounded-xl border-l-4 border-[#94B0DA]"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-[#343F3E] text-lg">
                  {suggestion.title}
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                  {getPriorityText(suggestion.priority)}
                </span>
              </div>
              <p className="text-[#505A5B]">
                {suggestion.description}
              </p>
            </div>
            <button className="text-[#94B0DA] hover:text-[#343F3E] transition-colors p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[#DCEDFF] rounded-lg">
        <p className="text-sm text-[#505A5B] text-center">
          💡 <strong>Tip:</strong> Implement these suggestions to improve your CV score and increase your chances of getting hired.
        </p>
      </div>
    </div>
  );
}

export default ImprovementSuggestions;