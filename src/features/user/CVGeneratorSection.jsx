import React from 'react';
import { useNavigate } from 'react-router-dom';

function CVGeneratorSection() {
  const navigate = useNavigate();

  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Clean and contemporary design",
      image: "/static/images/modern.png"
    },
    {
      id: "classic", 
      name: "Classic",
      description: "Traditional professional format",
      image: "/static/images/classic.png"
    },
    {
      id: "minimalist",
      name: "Minimalist", 
      description: "Simple and elegant layout",
      image: "/static/images/minimalist.png"
    }
  ];

  const handleGenerateCV = (templateId) => {
    navigate('/fill-data', { state: { template: templateId } });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-[#343F3E] mb-6">
        CV Generator
      </h2>
      <p className="text-[#505A5B] mb-8">
        Create a professional CV using our templates
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => (
          <div 
            key={template.id}
            className="border-2 border-[#DCEDFF] rounded-xl p-6 hover:border-[#94B0DA] hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleGenerateCV(template.id)}
          >
            <div className="bg-[#DCEDFF] rounded-lg h-32 mb-4 flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
            <h3 className="font-bold text-[#343F3E] text-lg mb-2">
              {template.name}
            </h3>
            <p className="text-[#505A5B] text-sm">
              {template.description}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button 
          onClick={() => handleGenerateCV('modern')}
          className="px-8 py-3 bg-[#94B0DA] text-white font-semibold rounded-lg hover:bg-[#8F91A2] transition-colors"
        >
          Generate CV
        </button>
      </div>
    </div>
  );
}

export default CVGeneratorSection;