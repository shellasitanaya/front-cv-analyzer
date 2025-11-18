import React, { useState } from 'react';
import { jobSeekerApi } from '../../api/jobSeekerApi'; // Sesuaikan path jika perlu
import AnalysisResults from './AnalysisResults'; // Impor AnalysisResults untuk modal

// Terima props dari parent page (UserCVAnalysisPage)
function MyCVsSection({ cvs, isLoading, error, loadMyCVs, handleDeleteCV }) {
  
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fungsi view detail tetap di sini karena mengelola state modal
  const handleViewAnalysis = async (analysisId) => {
    try {
      setModalLoading(true);
      setSelectedAnalysis(null); // Bersihkan modal sebelumnya
      const response = await jobSeekerApi.getAnalysisDetail(analysisId);
      
      let analysisData;
      if (response.status === 'success') {
        analysisData = response.data;
      } else {
        throw new Error(response.message || "Failed to get details");
      }
      
      setSelectedAnalysis(analysisData);
    } catch (error) {
      console.error('Error loading analysis:', error);
      alert(error.message || 'Failed to load analysis details');
    } finally {
      setModalLoading(false);
    }
  };

  const closeAnalysisModal = () => {
    setSelectedAnalysis(null);
  };

  // Gunakan prop isLoading dari parent
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
        <h2 className="text-2xl font-bold text-[#343F3E] mb-6">My CVs</h2>
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-2 border-[#94B0DA] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#343F3E]">My CVs</h2>
        <button
          onClick={loadMyCVs} // Gunakan fungsi refresh dari parent
          className="px-4 py-2 bg-[#DCEDFF] text-[#343F3E] rounded-lg hover:bg-[#94B0DA] hover:text-white transition-colors"
          disabled={isLoading} // disable saat loading
        >
          {isLoading ? '...' : 'Refresh'}
        </button>
      </div>

      {/* Tampilkan error dari parent */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Gunakan data 'cvs' dari parent */}
      {cvs.length === 0 ? (
        <div className="text-center py-8 text-[#505A5B]">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg">You haven't uploaded any CVs yet.</p>
          <p className="text-sm">Upload your first CV to get started!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {cvs.map((cv) => (
            <div
              key={cv.cv_id} // Gunakan cv_id yang konsisten
              className="border border-[#DCEDFF] rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#343F3E] text-lg truncate" title={cv.cv_title}>
                    {cv.cv_title || 'Untitled CV'}
                  </h3>
                  <p className="text-sm text-[#505A5B] mt-1 truncate">
                    Original file: {cv.original_filename}
                  </p>
                  <p className="text-xs text-[#8F91A2] mt-1">
                    Uploaded: {new Date(cv.uploaded_at).toLocaleString()}
                  </p>
                  
                  {cv.latest_analysis ? (
                    <div className="mt-3 p-3 bg-[#F8FAFF] rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-[#343F3E]">
                            Latest Analysis: 
                          </span>
                          <span className={`ml-2 font-bold ${
                            (cv.latest_analysis.match_score || 0) >= 80 ? 'text-green-600' :
                            (cv.latest_analysis.match_score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {cv.latest_analysis.match_score || 0}%
                          </span>
                        </div>
                        <button
                          onClick={() => handleViewAnalysis(cv.latest_analysis.analysis_id)}
                          className="px-3 py-1 bg-[#94B0DA] text-white text-sm rounded hover:bg-[#7A9BC8] transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                      <p className="text-xs text-[#505A5B] mt-1 truncate" title={cv.latest_analysis.job_description_preview}>
                        {cv.latest_analysis.job_description_preview || 'No description available'}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                       <p className="text-sm text-gray-500">No analysis found for this CV.</p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleDeleteCV(cv.cv_id, cv.cv_title)} // Gunakan fungsi delete dari parent
                  className="ml-4 px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors h-fit"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Detail Modal (Pop-up) */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#343F3E]">Analysis Details</h3>
              <button
                onClick={closeAnalysisModal}
                className="text-[#8F91A2] hover:text-[#505A5B] text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Tampilkan komponen AnalysisResults di dalam modal */}
            {modalLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-2 border-[#94B0DA] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <AnalysisResults analysisData={selectedAnalysis} />
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCVsSection;