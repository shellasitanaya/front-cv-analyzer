// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css'; 
import axios from 'axios';
import SearchBar from "./components/SearchBar";

function App() {
  // Semua state Anda tetap sama
  const [backendMessage, setBackendMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");

  // Semua fungsi Anda juga tetap sama
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/hr/test')
      .then(response => response.json())
      .then(data => setBackendMessage(data.message))
      .catch(error => console.error("Error fetching test data:", error));
  }, []);

  const handleSearch = async (query) => {
    if (!query) return;
    setIsSearchLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/hr/candidates/search', { params: { q: query } });
      const candidates = response.data.data || response.data || [];
      const sorted = candidates.sort((a, b) => b.match_score - a.match_score);
      setSearchResults(sorted);
      setSortOrder("desc");
    } catch (error) {
      console.error("Error saat mencari kandidat:", error);
      setSearchResults([]);
    } finally {
      setIsSearchLoading(false);
    }
  };
  
  const handleSortToggle = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    const sorted = [...searchResults].sort((a, b) => newOrder === 'asc' ? a.match_score - b.match_score : b.match_score - a.match_score);
    setSearchResults(sorted);
    setSortOrder(newOrder);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Silakan pilih file CV terlebih dahulu!");
      return;
    }
    setIsUploadLoading(true);
    // ... sisa logika upload Anda
    setIsUploadLoading(false);
  };

  return (
    // ===== PERUBAHAN 1: Latar Belakang Gradien & Layout Utama =====
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 to-blue-700 font-sans text-gray-800">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-300">🚀 Smart CV Analyzer & Optimizer</h1>
          <p className="text-sm text-gray-300 mt-2">
            Status Koneksi: <span className="font-semibold text-green-300">{backendMessage}</span>
          </p>
        </header>

        {/* --- Bagian Pencarian (Tidak Berubah) --- */}
        <SearchBar />
        
        {/* ===== PERUBAHAN 2: FORM UPLOAD DENGAN STYLING TAILWIND BARU ===== */}
        <div className="w-full max-w-2xl mx-auto border-t-2 border-gray-200 mt-12 pt-8">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Analisis CV Anda</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="job-desc" className="block text-sm font-medium text-gray-600 mb-2">
                  Deskripsi Pekerjaan Target
                </label>
                <textarea
                  id="job-desc"
                  placeholder="Tempel deskripsi pekerjaan di sini..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows="8"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label htmlFor="cv-file" className="block text-sm font-medium text-gray-600 mb-2">
                  Unggah CV Anda (PDF/DOCX)
                </label>
                <input
                  id="cv-file"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <button 
                type="submit" 
                disabled={isUploadLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
              >
                {isUploadLoading ? 'Menganalisis...' : 'Analisis Sekarang'}
              </button>
            </form>
          </div>

          {analysisResult && (
            <div className="bg-white p-6 rounded-xl shadow-lg mt-6 text-left">
              <h3 className="text-xl font-bold mb-3">Hasil Analisis</h3>
              <p className="text-sm"><strong>Nama File:</strong> {selectedFile.name}</p>
              <p className="text-3xl font-bold text-blue-600 my-3">{analysisResult.score}%</p>
              <div>
                <strong className="text-sm">Rekomendasi:</strong>
                <p className="text-gray-600 mt-1">{analysisResult.recommendations}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;