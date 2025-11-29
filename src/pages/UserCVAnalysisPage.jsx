import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CVUploadSection from '../features/user/CVUploadSection';
import MyCVsSection from '../features/user/MyCVsSection';
import AnalysisResults from '../features/user/AnalysisResults';
import ImprovementSuggestions from '../features/user/ImprovementSuggestions';
import FillData from '../pages/js/FillData'; // Import FillData component
import PreviewCV from '../pages/js/PreviewCV'; // Import PreviewCV component

function UserCVAnalysisPage() {
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' or 'generate'
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // State untuk CV Generator
  const [cvStep, setCvStep] = useState('template'); // 'template', 'fill-data', 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState(null);

  const navigate = useNavigate();

  const templates = [
    { id: "modern", name: "Modern", img: "/static/images/modern.png" },
    { id: "classic", name: "Classic", img: "/static/images/classic.png" },
    { id: "minimalist", name: "Minimalist", img: "/static/images/minimalist.png" },
  ];

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
  };

  const handleNewUpload = () => {
    setAnalysisData(null);
    setUploadedFile(null);
  };

  // CV Generator Handlers
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleTemplateNext = () => {
    if (!selectedTemplate) {
      alert("Pilih template terlebih dahulu!");
      return;
    }
    setCvStep('fill-data');
  };

  const handleFillDataComplete = (data) => {
    setFormData(data);
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
    setFormData(null);
  };

  // Render CV Generator Steps
  const renderCVGenerator = () => {
    switch (cvStep) {
      case 'template':
        return (
          <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
              Pilih Template CV
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedTemplate === tpl.id ? "border-blue-500" : "border-gray-300"
                  }`}
                  onClick={() => handleTemplateSelect(tpl.id)}
                >
                  <img
                    src={tpl.img}
                    alt={tpl.name}
                    className="w-full h-48 object-cover rounded-md mb-3"
                  />
                  <p className="text-center font-medium text-gray-600">{tpl.name}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleTemplateNext}
              disabled={!selectedTemplate}
              className={`w-full py-3 rounded-md text-white text-lg font-semibold ${
                selectedTemplate
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Lanjut Isi Data
            </button>
          </div>
        );

      case 'fill-data':
        return (
          <FillData 
            template={selectedTemplate}
            onComplete={handleFillDataComplete}
            onBack={handleBackToTemplate}
          />
        );

      case 'preview':
        return (
          <PreviewCV 
            formData={formData}
            template={selectedTemplate}
            onBack={handleBackToFillData}
            onRestart={handleRestartCV}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#DCEDFF] py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#343F3E] mb-4">
              Smart CV Analyzer
            </h1>
            <p className="text-lg text-[#505A5B]">
              Upload your CV to get instant analysis and improvement suggestions
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#94B0DA] mb-8">
            <button
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'analyze'
                  ? 'text-[#94B0DA] border-b-2 border-[#94B0DA]'
                  : 'text-[#8F91A2] hover:text-[#505A5B]'
              }`}
              onClick={() => setActiveTab('analyze')}
            >
              CV Analysis
            </button>
            <button
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'generate'
                  ? 'text-[#94B0DA] border-b-2 border-[#94B0DA]'
                  : 'text-[#8F91A2] hover:text-[#505A5B]'
              }`}
              onClick={() => setActiveTab('generate')}
            >
              CV Generator
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'analyze' ? (
            <>
              {/* Upload Section */}
              <div className="mb-8">
                <CVUploadSection
                  onAnalysisComplete={handleAnalysisComplete}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  onNewUpload={handleNewUpload}
                  uploadedFile={uploadedFile}
                  setUploadedFile={setUploadedFile}
                />
              </div>

              {/* My CVs Section */}
              <div className="mb-8">
                <MyCVsSection />
              </div>

              {/* Analysis Results */}
              {analysisData && (
                <div className="space-y-8">
                  <AnalysisResults analysisData={analysisData} />
                  <ImprovementSuggestions suggestions={analysisData.suggestions} />
                </div>
              )}
            </>
          ) : (
            /* CV Generator Section */
            <div className="flex justify-center">
              {renderCVGenerator()}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UserCVAnalysisPage;