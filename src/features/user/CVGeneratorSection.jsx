import React, { useState } from 'react';
// Pastikan path import ini sesuai struktur folder Anda
import FillData from '../../pages/js/FillData'; 
import PreviewCV from '../../pages/js/PreviewCV';

function CVGeneratorSection() {
  // --- STATE LOGIKA GENERATOR (Dipindah dari UserCVAnalysisPage) ---
  const [step, setStep] = useState('template'); // 'template' | 'fill-data' | 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [cvData, setCvData] = useState(null);

  const templates = [
    { id: "modern", name: "Modern", img: "/static/images/modern.png" },
    { id: "classic", name: "Classic", img: "/static/images/classic.png" },
    { id: "minimalist", name: "Minimalist", img: "/static/images/minimalist.png" },
  ];

  // --- HANDLERS ---
  
  // 1. Pilih Template
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setStep('fill-data'); 
  };

  // 2. Selesai Isi Data (Solusi Error onComplete)
  // Fungsi ini akan dikirim ke Child (FillData)
  const handleFillDataComplete = (data) => {
    console.log("✅ Data diterima:", data);
    setCvData(data);
    setStep('preview'); 
  };

  // 3. Navigasi Balik
  const handleBackToTemplate = () => {
    setStep('template');
    setSelectedTemplate(null);
  };

  const handleBackToFillData = () => {
    setStep('fill-data');
  };

  const handleRestartCV = () => {
    setStep('template');
    setSelectedTemplate(null);
    setCvData(null);
  };

  // --- RENDER STEPS ---
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 min-h-[600px]">
      
      {/* STEP 1: PILIH TEMPLATE */}
      {step === 'template' && (
        <div className="animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#343F3E] mb-2">Pilih Template CV</h2>
            <p className="text-[#8F91A2]">Pilih desain profesional untuk memulai.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {templates.map((tpl) => (
              <div 
                key={tpl.id}
                className={`group border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                  selectedTemplate === tpl.id 
                    ? "border-[#94B0DA] bg-blue-50/30 shadow-md" 
                    : "border-gray-100 hover:border-[#94B0DA] hover:shadow-sm"
                }`}
                onClick={() => handleTemplateSelect(tpl.id)}
              >
                <div className="aspect-[3/4] bg-gray-100 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center">
                   {/* Placeholder jika gambar tidak ada */}
                   {tpl.img ? (
                      <img src={tpl.img} alt={tpl.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                   ) : (
                      <span className="text-4xl">📄</span>
                   )}
                   
                   {/* Tombol Select Hover */}
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                      <button className="bg-white text-[#343F3E] px-4 py-2 rounded-full font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">
                        Pilih
                      </button>
                   </div>
                </div>
                <h3 className="font-bold text-[#343F3E] text-lg text-center">{tpl.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: ISI DATA */}
      {step === 'fill-data' && (
        <div className="animate-slide-up">
          {/* Kita kirim fungsi handleFillDataComplete sbg props 'onComplete' */}
          <FillData 
            template={selectedTemplate}
            onComplete={handleFillDataComplete} 
            onBack={handleBackToTemplate}
          />
        </div>
      )}

      {/* STEP 3: PREVIEW */}
      {step === 'preview' && (
        <div className="animate-fade-in">
          <PreviewCV 
            formData={cvData}
            template={selectedTemplate}
            onBack={handleBackToFillData}
            onRestart={handleRestartCV}
          />
        </div>
      )}

    </div>
  );
}

export default CVGeneratorSection;