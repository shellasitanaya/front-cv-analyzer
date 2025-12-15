import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout'; 

// Import fitur Analisis
import CVUploadSection from '../features/user/CVUploadSection'; 
import AnalysisSummary from '../features/user/AnalysisSummary'; 
import ImprovementSuggestions from '../features/user/ImprovementSuggestions';

// Import fitur Generator
import FillData from './js/FillData';  
import PreviewCV from './js/PreviewCV'; 

function UserCVAnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' | 'generate'
  
  // --- STATE ANALISIS ---
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- STATE GENERATOR ---
  const [cvStep, setCvStep] = useState('template'); // 'template' -> 'fill-data' -> 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [cvFormData, setCvFormData] = useState(null); 
  
  const templates = [
    { id: "modern", name: "Modern", img: "/static/images/modern.png" },
    { id: "classic", name: "Classic", img: "/static/images/classic.png" },
    { id: "minimalist", name: "Minimalist", img: "/static/images/minimalist.png" },
  ];

  // --- LOGIKA AUTO SCROLL ---
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location]);

  // --- HANDLERS ANALISIS ---
  const handleAnalysisComplete = (result) => {
    if (result && result.match_score !== undefined) {
      setAnalysisResult(result);
      setAnalysisLoading(false);
      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => {
        document.getElementById('analysis-result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      setAnalysisLoading(false);
      alert("Gagal mendapatkan hasil analisis.");
    }
  };

  const handleNewUpload = () => {
    setAnalysisResult(null); 
  };

  // --- HANDLERS GENERATOR ---
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setCvStep('fill-data');
  };

  const handleFillDataComplete = (data) => {
    console.log("Data diterima dari form:", data);
    setCvFormData(data);
    setCvStep('preview');
  };

  const handleBackToTemplate = () => {
    setCvStep('template');
    setSelectedTemplate(null);
  };

  const handleBackToFillData = () => {
    setCvStep('fill-data');
  };

  const handleRestartCV = () => {
    setCvStep('template');
    setSelectedTemplate(null);
    setCvFormData(null);
  };

  // --- HANDLER EDIT (Dari Preview kembali ke Form) ---
  const handleEditCV = () => {
    setCvStep('fill-data');
  };

  // --- HANDLER SAVE (Simpan logic dummy atau simpan ke localstorage tanpa list UI) ---
  const handleSaveGeneratedCV = (cvData) => {
    // Kita tetap simpan ke localStorage agar tidak error, tapi tidak menampilkan listnya
    const newCV = {
      id: Date.now(),
      name: cvData.name || 'Untitled CV',
      template: cvData.template || selectedTemplate,
      date: new Date().toLocaleDateString(),
      data: cvData
    };

    const savedCVs = JSON.parse(localStorage.getItem('generatedCVs') || '[]');
    savedCVs.unshift(newCV);
    localStorage.setItem('generatedCVs', JSON.stringify(savedCVs));
    
    alert("CV Saved Successfully!");
  };

  return (
    <Layout activeFeature={activeTab}>
      <div className="flex flex-col h-full w-full overflow-hidden">
        
        {/* FIXED NAVBAR TABS */}
        <div className="border-b border-gray-200 bg-white pt-4 pb-0 z-30 flex-shrink-0 px-8 h-[60px]">
          <div className="flex gap-8 h-full items-end">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`pb-3 text-sm font-bold transition-all relative px-2 ${
                activeTab === 'analyze' ? 'text-[#94B0DA]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              CV Analysis
              {activeTab === 'analyze' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#94B0DA] rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`pb-3 text-sm font-bold transition-all relative px-2 ${
                activeTab === 'generate' ? 'text-[#94B0DA]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              CV Generator
              {activeTab === 'generate' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#94B0DA] rounded-t-full"></div>}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-hidden bg-gray-50 relative w-full">
          
          {/* === MODE ANALISIS === */}
          {activeTab === 'analyze' && (
            <div className="h-full overflow-y-auto custom-scrollbar p-6">
              <div className="max-w-7xl mx-auto space-y-8">
                <div id="upload-section" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <CVUploadSection
                    onAnalysisComplete={handleAnalysisComplete}
                    isLoading={analysisLoading}
                    setIsLoading={setAnalysisLoading}
                    onNewUpload={handleNewUpload}
                    uploadedFile={uploadedFile}
                    setUploadedFile={setUploadedFile}
                  />
                </div>

                {analysisLoading && (
                  <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm animate-pulse">
                    <div className="w-16 h-16 border-4 border-[#94B0DA] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-[#343F3E]">AI is analyzing your CV...</h3>
                  </div>
                )}

                {analysisResult && !analysisLoading && (
                  <div id="analysis-result-section" className="space-y-6 animate-slide-up">
                    <AnalysisSummary analysisData={analysisResult} />
                    {!analysisResult.gemini_result && (
                      <ImprovementSuggestions analysisData={analysisResult} />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === MODE GENERATOR === */}
          {activeTab === 'generate' && (
            <div className={`h-full flex flex-col ${cvStep === 'template' ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
              
              <div className={`flex-1 ${cvStep === 'template' ? '' : 'overflow-hidden px-6 pb-6'} max-w-7xl mx-auto w-full`}>
                
                {/* Step 1: Template Selection */}
                {cvStep === 'template' && (
                  <div className="px-6 pb-6 pt-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                      <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Choose Your CV Template</h2>
                        <p className="text-gray-500">Select a professional design to get started</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {templates.map((tpl) => (
                          <div 
                            key={tpl.id}
                            className={`group border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                              selectedTemplate === tpl.id 
                                ? "border-[#94B0DA] bg-blue-50 shadow-lg" 
                                : "border-gray-200 hover:border-blue-300 hover:shadow-lg"
                            }`}
                            onClick={() => handleTemplateSelect(tpl.id)}
                          >
                            <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-6 overflow-hidden relative">
                              {tpl.img ? (
                                <img src={tpl.img} alt={tpl.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-5xl text-gray-400">📄</div>
                              )}
                            </div>
                            <div className="text-center">
                              <h3 className="font-bold text-xl text-gray-800 mb-1">{tpl.name}</h3>
                              <p className="text-gray-500 text-sm">Professional design</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Fill Data */}
                {cvStep === 'fill-data' && (
                  <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <FillData 
                      template={selectedTemplate}
                      initialData={cvFormData}
                      onComplete={handleFillDataComplete} 
                      onBack={handleBackToTemplate}
                      hideHeader={true}
                      hideFooter={true}
                    />
                  </div>
                )}

                {/* Step 3: Preview */}
                {cvStep === 'preview' && (
                  <div className="preview-cv-section h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    {/* Header Preview dengan Tombol Edit */}
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleEditCV} 
                                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-bold hover:bg-yellow-200 flex items-center gap-2 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                Edit Content
                            </button>
                            <span className="text-gray-400 text-sm">|</span>
                            <span className="text-gray-500 text-sm font-medium">Preview Mode</span>
                        </div>
                        <button onClick={handleRestartCV} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                        <PreviewCV 
                          formData={cvFormData}
                          template={selectedTemplate}
                          onBack={handleEditCV}
                          onRestart={handleRestartCV}
                          onSave={handleSaveGeneratedCV}
                          hideHeader={true}
                          hideFooter={true}
                        />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        html, body, #root {
          overflow-x: hidden !important;
          max-width: 100% !important;
          width: 100% !important;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }
        .custom-scrollbar { 
          scrollbar-width: thin; 
          scrollbar-color: #cbd5e0 #f1f5f9; 
        }
        .custom-scrollbar::-webkit-scrollbar { 
          width: 8px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: #f1f5f9; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #cbd5e0; 
          border-radius: 4px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: #94a3b8; 
        }
        iframe {
          max-width: 100% !important;
          width: 100% !important;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in;
        }
      `}</style>
    </Layout>
  );
}

export default UserCVAnalysisPage;