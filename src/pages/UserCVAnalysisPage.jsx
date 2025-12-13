import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout'; 

// Import fitur Analisis
import CVUploadSection from '../features/user/CVUploadSection'; 
import MyCVsSection from '../features/user/MyCVsSection'; 
import AnalysisSummary from '../features/user/AnalysisSummary'; 
import ImprovementSuggestions from '../features/user/ImprovementSuggestions';

// Import fitur Generator (Langsung import komponennya, tidak lewat Section perantara)
import FillData from './js/FillData';   // Sesuaikan path import Anda
import PreviewCV from './js/PreviewCV'; // Sesuaikan path import Anda

function UserCVAnalysisPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' | 'generate'
  
  // --- STATE ANALISIS ---
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- STATE GENERATOR (Logika Lama yang Stabil) ---
  const [cvStep, setCvStep] = useState('template'); // 'template' -> 'fill-data' -> 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [cvFormData, setCvFormData] = useState(null); // Data form manual
  
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

  // --- HANDLER ANALISIS ---
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

  // --- HANDLER GENERATOR CV (Inti Perbaikan) ---
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setCvStep('fill-data'); // Pindah ke isi data
  };

  const handleFillDataComplete = (data) => {
    console.log("Data diterima dari form:", data);
    setCvFormData(data);
    setCvStep('preview'); // Pindah ke preview & generate
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

  // --- RENDER COMPONENT ---
  return (
    <Layout activeFeature={activeTab}>
      <div className="space-y-8 min-h-screen">
        
        {/* TAB NAVIGATION */}
        <div className="border-b border-gray-200 sticky top-20 bg-[#F8FAFF] z-10 pt-2">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'analyze' ? 'text-[#94B0DA]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              CV Analysis
              {activeTab === 'analyze' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#94B0DA] rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'generate' ? 'text-[#94B0DA]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              CV Generator
              {activeTab === 'generate' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#94B0DA] rounded-t-full"></div>}
            </button>
          </div>
        </div>

        <div className="pt-2">
          {/* === MODE ANALISIS === */}
          {activeTab === 'analyze' && (
            <div className="space-y-12 animate-fade-in">
              <div id="upload-section" className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
                <div id="analysis-result-section" className="space-y-8 animate-slide-up scroll-mt-24">
                  <AnalysisSummary analysisData={analysisResult} />
                  {!analysisResult.gemini_result && (
                     <ImprovementSuggestions analysisData={analysisResult} />
                  )}
                </div>
              )}

              <div id="history-section" className="scroll-mt-24">
                {/* <h3 className="text-lg font-bold text-[#343F3E] mb-4 ml-1">Recent Analysis History</h3> */}
                <MyCVsSection key={refreshTrigger} />
              </div>
            </div>
          )}

          {/* === MODE GENERATOR (Logika Lama + Tampilan Baru) === */}
          {activeTab === 'generate' && (
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 min-h-[600px] animate-fade-in">
              
              {/* Step 1: Pilih Template */}
              {cvStep === 'template' && (
                <div className="animate-fade-in text-center">
                  <h2 className="text-2xl font-bold text-[#343F3E] mb-2">Pilih Template CV</h2>
                  <p className="text-[#8F91A2] mb-10">Pilih desain profesional untuk memulai.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <div className="aspect-[3/4] bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                           {tpl.img ? <img src={tpl.img} alt={tpl.name} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-4xl">📄</span>}
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                              <button className="bg-white text-[#343F3E] px-4 py-2 rounded-full font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">Pilih</button>
                           </div>
                        </div>
                        <h3 className="font-bold text-[#343F3E] text-lg">{tpl.name}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Isi Data */}
              {cvStep === 'fill-data' && (
                <div className="animate-slide-up">
                  <FillData 
                    template={selectedTemplate}
                    onComplete={handleFillDataComplete} 
                    onBack={handleBackToTemplate}
                  />
                </div>
              )}

              {/* Step 3: Preview & Generate */}
              {cvStep === 'preview' && (
                <div className="animate-fade-in">
                  <PreviewCV 
                    formData={cvFormData}
                    template={selectedTemplate}
                    onBack={handleBackToFillData}
                    onRestart={handleRestartCV}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UserCVAnalysisPage;