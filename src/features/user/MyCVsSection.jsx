import React, { useState, useEffect } from 'react';
import { jobSeekerApi } from '../../api/jobSeekerApi';
import AnalysisDetailed from './AnalysisDetailed';

function MyCVsSection() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const loadMyCVs = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerApi.getMyCVs();
      if (response.status === 'success') {
        setCvs(response.data || []);
      }
    } catch (error) {
      console.error('Error loading CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCV = async (cvId) => {
    if (window.confirm("Are you sure you want to delete this history?")) {
      try {
        await jobSeekerApi.deleteCV(cvId);
        loadMyCVs();
      } catch (error) {
        alert("Failed to delete CV");
      }
    }
  };

  const handleViewAnalysis = async (analysisId) => {
    try {
      const response = await jobSeekerApi.getAnalysisDetail(analysisId);
      if (response.status === 'success') {
        setSelectedAnalysis(response.data);
      }
    } catch (error) {
      alert('Failed to load details');
    }
  };

  // --- LOGIKA BARU: PREVIEW FILE ---
  const handlePreviewCV = async (cvId) => {
    try {
      // Ambil token dari localStorage (sesuaikan key-nya jika beda, misal 'accessToken')
      const token = localStorage.getItem('token'); 
      
      // GANTI URL INI sesuai backend Anda jika sudah di-hosting
      const response = await fetch(`http://localhost:5000/api/jobseeker/cv/preview/${cvId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch file');

      // Buat Blob URL dari response
      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      
      // Buka di tab baru
      window.open(fileUrl, '_blank');
      
    } catch (error) {
      console.error("Preview error:", error);
      alert("Gagal membuka file. File mungkin sudah dihapus atau format tidak didukung browser.");
    }
  };
  // ---------------------------------

  useEffect(() => { loadMyCVs(); }, []);

  const getScoreStyles = (score) => {
    if (score >= 80) return { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700 border-green-200' };
    if (score >= 50) return { bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-200' };
  };

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cvs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cvs.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      
      {/* 1. Header & Filter */}
      <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Analysis History</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track your CV optimizations</p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Show:</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-transparent text-slate-700 text-sm font-bold outline-none cursor-pointer"
          >
            <option value={5}>5 rows</option>
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
          </select>
        </div>
      </div>

      {/* 2. Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-gray-100">
              <th className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-8">File Name</th>
              <th className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date Analyzed</th>
              <th className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Target</th>
              <th className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center" style={{ width: '200px' }}>Score</th>
              <th className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="5" className="p-12 text-center text-slate-400 italic">Loading history data...</td></tr>
            ) : cvs.length === 0 ? (
              <tr><td colSpan="5" className="p-12 text-center text-slate-400">No analysis history found.</td></tr>
            ) : (
              currentItems.map((cv) => {
                const score = cv.latest_analysis ? cv.latest_analysis.match_score : 0;
                const styles = getScoreStyles(score);

                return (
                  <tr key={cv.cv_id} className="hover:bg-[#F8FAFF] transition-colors group">
                    
                    {/* Filename */}
                    <td className="p-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-700 text-sm truncate max-w-[200px]" title={cv.original_filename}>
                            {cv.original_filename}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">PDF Document</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-6 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-600">
                        {new Date(cv.uploaded_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(cv.uploaded_at).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Job Description */}
                    <td className="p-6">
                      <span className="text-xs font-semibold text-slate-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 inline-block max-w-[180px] truncate">
                        {cv.latest_analysis?.job_description || "Unknown Job"}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="p-6 text-center">
                      {cv.latest_analysis ? (
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${styles.bar}`} style={{ width: `${score}%` }}></div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-md border ${styles.badge}`}>
                            {score.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs font-medium italic">- Pending -</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-6 pr-8 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        {/* Tombol VIEW FILE (Baru) */}
                        <button
                          onClick={() => handlePreviewCV(cv.cv_id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 bg-white border border-gray-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all shadow-sm"
                          title="Preview File"
                        >
                          📄
                        </button>

                        {/* Tombol VIEW ANALYSIS */}
                        <button
                          onClick={() => handleViewAnalysis(cv.latest_analysis?.analysis_id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94B0DA] bg-[#F0F7FF] hover:bg-[#94B0DA] hover:text-white transition-all shadow-sm border border-transparent hover:border-[#94B0DA]"
                          title="View Analysis"
                        >
                          👁️
                        </button>

                        {/* Tombol DELETE */}
                        <button
                          onClick={() => handleDeleteCV(cv.cv_id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {cvs.length > 0 && (
        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-[#FDFDFD]">
          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> - <span className="font-bold text-slate-800">{Math.min(indexOfLastItem, cvs.length)}</span> of <span className="font-bold text-slate-800">{cvs.length}</span> entries
          </span>
          <div className="flex gap-2">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors border ${currentPage === 1 ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50 hover:text-[#94B0DA] hover:border-[#94B0DA]'}`}>Previous</button>
            <div className="hidden sm:flex gap-1">
               {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-colors ${currentPage === i + 1 ? 'bg-[#94B0DA] text-white shadow-sm' : 'text-slate-500 hover:bg-gray-50'}`}>{i + 1}</button>
               ))}
            </div>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors border ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50 hover:text-[#94B0DA] hover:border-[#94B0DA]'}`}>Next</button>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-[#343F3E]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-6 border-b border-gray-100 flex justify-between items-center z-10">
              <h3 className="font-extrabold text-xl text-[#343F3E]">Analysis Breakdown</h3>
              <button onClick={() => setSelectedAnalysis(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl font-bold">✕</button>
            </div>
            <div className="p-8 bg-[#F8FAFF]">
              <AnalysisDetailed analysisData={selectedAnalysis} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCVsSection;