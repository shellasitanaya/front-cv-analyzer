// UserCVAnalysisPage.jsx - DENGAN MY RESUMES SECTION
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout'; 

// Import fitur Analisis
import CVUploadSection from '../features/user/CVUploadSection'; 
import MyCVsSection from '../features/user/MyCVsSection'; 
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
  
  // --- STATE UNTUK GENERATED CVs ---
  const [generatedCVs, setGeneratedCVs] = useState([]);
  const [cvRefreshTrigger, setCvRefreshTrigger] = useState(0);
  const [showAllCVs, setShowAllCVs] = useState(false);
  
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

  // --- LOAD GENERATED CVs DARI LOCALSTORAGE ---
  useEffect(() => {
    const savedCVs = localStorage.getItem('generatedCVs');
    if (savedCVs) {
      try {
        setGeneratedCVs(JSON.parse(savedCVs));
      } catch (error) {
        console.error('Error parsing saved CVs:', error);
      }
    }
  }, [cvRefreshTrigger]);

  // --- HANDLERS ---
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

  // --- HANDLER UNTUK SAVE GENERATED CV ---
  const handleSaveGeneratedCV = (cvData) => {
    const newCV = {
      id: Date.now(),
      name: cvData.name || 'Untitled CV',
      template: cvData.template || selectedTemplate,
      date: new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      data: cvData
    };

    const updatedCVs = [newCV, ...generatedCVs];
    setGeneratedCVs(updatedCVs);
    localStorage.setItem('generatedCVs', JSON.stringify(updatedCVs));
    setCvRefreshTrigger(prev => prev + 1);
    
    setTimeout(() => {
      document.getElementById('recent-cv-projects')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 500);
  };

  const handleDeleteCV = (id) => {
    const updatedCVs = generatedCVs.filter(cv => cv.id !== id);
    setGeneratedCVs(updatedCVs);
    localStorage.setItem('generatedCVs', JSON.stringify(updatedCVs));
    setCvRefreshTrigger(prev => prev + 1);
  };

  const handleDownloadCV = (cv) => {
    alert(`Downloading CV: ${cv.name}`);
  };

  const handleNavbarMyResumesClick = () => {
    setActiveTab('generate');
    setTimeout(() => {
      document.getElementById('recent-cv-projects')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  // --- HANDLER UNTUK LOAD CV DARI MY RESUMES ---
  const handleLoadCVFromMyResumes = (cvData) => {
    setSelectedTemplate(cvData.template || 'modern');
    setCvFormData(cvData.data);
    setCvStep('preview');
    
    // Scroll ke preview section
    setTimeout(() => {
      const previewSection = document.querySelector('.preview-cv-section');
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  return (
    <Layout 
      activeFeature={activeTab}
      onMyResumesClick={handleNavbarMyResumesClick}
    >
      <div className="flex flex-col h-screen overflow-hidden">
        
        {/* FIXED NAVBAR TABS - Konsisten di semua mode */}
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
        <div className="flex-1 overflow-hidden bg-gray-50 relative">
          
          {/* === MODE ANALISIS === */}
          {activeTab === 'analyze' && (
            <div className="h-full overflow-y-auto custom-scrollbar p-6">
              <div className="max-w-7xl mx-auto space-y-8">
                <div>
                </div>

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

                <div id="history-section">
                  <MyCVsSection key={refreshTrigger} />
                </div>
              </div>
            </div>
          )}

          {/* === MODE GENERATOR === */}
          {activeTab === 'generate' && (
            <div className={`h-full flex flex-col ${cvStep === 'template' ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
              
              {/* HEADER AREA - FIXED HEIGHT & CONSISTENT WIDTH */}
              <div
                className="
                  flex-shrink-0 
                  px-6 pt-6 pb-4 
                  max-w-[1920px] mx-auto w-full
                  sticky top-0 
                  z-40 
                  bg-white
                  border-b border-gray-200
                "
              >

                {/* Progress Indicator untuk Fill Data & Preview */}
              </div>

              {/* GENERATOR CONTENT AREA */}
              <div className={`flex-1 ${cvStep === 'template' ? '' : 'overflow-hidden px-6 pb-6'} max-w-7xl mx-auto w-full`}>
                
                {/* Step 1: Template Selection */}
                {cvStep === 'template' && (
                  <div className="px-6 pb-6">
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

                    {/* RECENT CV PROJECTS */}
                    <div id="recent-cv-projects" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">My Resumes</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">{generatedCVs.length} CVs</span>
                          {generatedCVs.length > 3 && (
                            <button 
                              onClick={() => setShowAllCVs(!showAllCVs)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {showAllCVs ? 'Show Less' : 'View All'}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {generatedCVs.length > 0 ? (
                        <div className="space-y-4">
                          {(showAllCVs ? generatedCVs : generatedCVs.slice(0, 3)).map((cv) => (
                            <div 
                              key={cv.id} 
                              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold">
                                    {cv.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{cv.name}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                      <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Template: <span className="font-medium capitalize">{cv.template}</span>
                                      </span>
                                      <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <span className="text-gray-400">📅</span>
                                        {cv.date}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleLoadCVFromMyResumes(cv)}
                                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-2 transition-opacity"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                  </svg>
                                  Load
                                </button>
                                <button 
                                  onClick={() => handleDeleteCV(cv.id)} 
                                  className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-5xl mb-4">📄</div>
                          <p className="text-lg mb-2">No CVs generated yet</p>
                          <p className="text-sm">Create your first CV using one of the templates above</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Fill Data */}
                {cvStep === 'fill-data' && (
                  <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <FillData 
                      template={selectedTemplate}
                      onComplete={handleFillDataComplete} 
                      onBack={handleBackToTemplate}
                      hideHeader={true}
                      hideFooter={true}
                    />
                  </div>
                )}

                {/* Step 3: Preview */}
                {cvStep === 'preview' && (
                  <div className="preview-cv-section h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <PreviewCV 
                      formData={cvFormData}
                      template={selectedTemplate}
                      onBack={handleBackToFillData}
                      onRestart={handleRestartCV}
                      onSave={handleSaveGeneratedCV}
                      hideHeader={true}
                      hideFooter={true}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FIXED STYLE UNTUK MENGATASI MASALAH LAYOUT */}
      <style jsx global>{`
        /* Prevent horizontal scrolling */
        html, body, #root {
          overflow-x: hidden !important;
          max-width: 100% !important;
          width: 100% !important;
        }
        
        /* Reset box-sizing */
        *, *::before, *::after {
          box-sizing: border-box;
        }
        
        /* Scrollbar styling */
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
        
        /* Fix for iframe in preview */
        iframe {
          max-width: 100% !important;
          width: 100% !important;
        }
        
        /* Animation classes */
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