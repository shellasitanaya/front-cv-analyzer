import React, { useState, useEffect } from 'react';

import Layout from '../components/Layout';
import CVUploadSection from '../features/user/CVUploadSection';
import CVGeneratorSection from '../features/user/CVGeneratorSection';
import MyCVsSection from '../features/user/MyCVsSection';
import AnalysisResults from '../features/user/AnalysisResults';
import ImprovementSuggestions from '../features/user/ImprovementSuggestions';

function UserCVAnalysisPage() {
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' or 'generate'
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    console.log('🔍 uploadedFile state changed:', uploadedFile);
  }, [uploadedFile]);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
  };

  const handleNewUpload = () => {
    console.log('🔄 New upload - clearing previous data');
    setAnalysisData(null);
    // setUploadedFile(null);
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
            <CVGeneratorSection />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UserCVAnalysisPage;