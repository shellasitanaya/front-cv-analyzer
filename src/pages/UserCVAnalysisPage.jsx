import React, { useState, useEffect } from 'react';
// === PERBAIKAN: Jalur impor diubah menjadi '../' ===
import { jobSeekerApi } from '../api/jobSeekerApi'; 
import Layout from '../components/Layout'; 
import CVUploadSection from '../features/user/CVUploadSection'; 
import MyCVsSection from '../features/user/MyCVsSection'; 
import AnalysisResults from '../features/user/AnalysisResults'; 
import ImprovementSuggestions from '../features/user/ImprovementSuggestions';
import CVGeneratorSection from '../features/user/CVGeneratorSection';
// =======================================================

function UserCVAnalysisPage() {
  // === State untuk Tab ===
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' or 'generate'
  
  // === State untuk Daftar CV (diangkat ke sini) ===
  const [cvs, setCvs] = useState([]);
  const [cvListLoading, setCvListLoading] = useState(true);
  const [cvListError, setCvListError] = useState('');

  // === State untuk Upload & Analisis ===
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // === Fungsi untuk memuat "My CVs" ===
  const loadMyCVs = async () => {
    try {
      setCvListLoading(true);
      setCvListError('');
      const response = await jobSeekerApi.getMyCVs();
      if (response.status === 'success') {
        setCvs(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to parse CV list');
      }
    } catch (error) {
      console.error('Error loading CVs:', error);
      setCvListError(error.error || 'Failed to load your CVs');
    } finally {
      setCvListLoading(false);
    }
  };

  // === Fungsi untuk menangani "Analysis Complete" ===
  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result); // Tampilkan hasil analisis
    setAnalysisLoading(false); // Hentikan loading spinner
    loadMyCVs(); // Muat ulang daftar CV! (FIX UNTUK LIVE UPDATE)
  };

  // === Fungsi untuk menangani upload baru ===
  const handleNewUpload = () => {
    setAnalysisResult(null); // Bersihkan hasil analisis lama
  };

  // === Fungsi untuk Hapus CV (diteruskan ke MyCVsSection) ===
  const handleDeleteCV = async (cvId, cvTitle) => {
    if (window.confirm(`Are you sure you want to delete "${cvTitle}"?`)) {
      try {
        await jobSeekerApi.deleteCV(cvId);
        await loadMyCVs(); // Muat ulang daftar setelah hapus
      } catch (error) {
        console.error('Error deleting CV:', error);
        alert('Failed to delete CV');
      }
    }
  };
  
  // === Muat daftar CV saat halaman pertama kali dibuka ===
  useEffect(() => {
    loadMyCVs();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-[#F8FAFF] py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#343F3E] mb-4">
              Smart CV Analyzer
            </h1>
            <p className="text-lg text-[#505A5B]">
              Analyze your CV, find your weaknesses, and build a better one.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#94B0DA] mb-8">
            <button
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'analyze'
                  ? 'text-[#343F3E] border-b-2 border-[#94B0DA]'
                  : 'text-[#8F91A2] hover:text-[#505A5B]'
              }`}
              onClick={() => setActiveTab('analyze')}
            >
              CV Analysis
            </button>
            <button
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'generate'
                  ? 'text-[#343F3E] border-b-2 border-[#94B0DA]'
                  : 'text-[#8F91A2] hover:text-[#505A5B]'
              }`}
              onClick={() => setActiveTab('generate')}
            >
              CV Generator
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'analyze' ? (
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Kolom Kiri: Upload & Hasil */}
              <div className="lg:w-1/2 space-y-8">
                {/* 1. Komponen Upload */}
                <CVUploadSection
                  onAnalysisComplete={handleAnalysisComplete}
                  isLoading={analysisLoading}
                  setIsLoading={setAnalysisLoading}
                  onNewUpload={handleNewUpload}
                  uploadedFile={uploadedFile}
                  setUploadedFile={setUploadedFile}
                />

                {/* 2. Komponen Hasil Analisis (muncul setelah analisis) */}
                {analysisResult && (
                  <>
                    <AnalysisResults analysisData={analysisResult} />
                    <ImprovementSuggestions analysisData={analysisResult} />
                  </>
                )}
              </div>

              {/* Kolom Kanan: Daftar "My CVs" */}
              <div className="lg:w-1/2">
                {/* 3. Komponen Daftar CV (Menerima props) */}
                <MyCVsSection
                  cvs={cvs}
                  isLoading={cvListLoading}
                  error={cvListError}
                  loadMyCVs={loadMyCVs} 
                  handleDeleteCV={handleDeleteCV}
                />
              </div>

            </div>
          ) : (
            <CVGeneratorSection />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UserCVAnalysisPage;