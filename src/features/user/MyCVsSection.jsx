import React, { useState, useEffect } from 'react';
import { jobSeekerApi } from '../../api/jobSeekerApi'; // ✅ PATH DIPERBAIKI

function MyCVsSection() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const loadMyCVs = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerApi.getMyCVs();
      if (response.status === 'success') {
        setCvs(response.data || []);
      }
    } catch (error) {
      console.error('Error loading CVs:', error);
      alert('Failed to load your CVs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCV = async (cvId, cvTitle) => {
    if (window.confirm(`Are you sure you want to delete "${cvTitle}"?`)) {
      try {
        await jobSeekerApi.deleteCV(cvId);
        await loadMyCVs(); // Reload the list
      } catch (error) {
        console.error('Error deleting CV:', error);
        alert('Failed to delete CV');
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
      console.error('Error loading analysis:', error);
      alert('Failed to load analysis details');
    }
  };

  const closeAnalysisModal = () => {
    setSelectedAnalysis(null);
  };

  useEffect(() => {
    loadMyCVs();
  }, []);

  if (loading) {
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
          onClick={loadMyCVs}
          className="px-4 py-2 bg-[#DCEDFF] text-[#343F3E] rounded-lg hover:bg-[#94B0DA] hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div>

      {cvs.length === 0 ? (
        <div className="text-center py-8 text-[#505A5B]">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg">You haven't uploaded any CVs yet.</p>
          <p className="text-sm">Upload your first CV to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cvs.map((cv) => (
            <div
              key={cv.cv_id}
              className="border border-[#DCEDFF] rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#343F3E] text-lg">
                    {cv.cv_title}
                  </h3>
                  <p className="text-sm text-[#505A5B] mt-1">
                    Original file: {cv.original_filename}
                  </p>
                  <p className="text-xs text-[#8F91A2] mt-1">
                    Uploaded: {new Date(cv.uploaded_at).toLocaleDateString()}
                  </p>
                  
                  {cv.latest_analysis && (
                    <div className="mt-3 p-3 bg-[#F8FAFF] rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-[#343F3E]">
                            Latest Analysis: 
                          </span>
                          <span className={`ml-2 font-bold ${
                            cv.latest_analysis.match_score >= 80 ? 'text-green-600' :
                            cv.latest_analysis.match_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {cv.latest_analysis.match_score}%
                          </span>
                        </div>
                        <button
                          onClick={() => handleViewAnalysis(cv.latest_analysis.analysis_id)}
                          className="px-3 py-1 bg-[#94B0DA] text-white text-sm rounded hover:bg-[#7A9BC8] transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                      <p className="text-xs text-[#505A5B] mt-1 truncate">
                        {cv.latest_analysis.job_description_preview}
                      </p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleDeleteCV(cv.cv_id, cv.cv_title)}
                  className="ml-4 px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#343F3E]">Analysis Details</h3>
              <button
                onClick={closeAnalysisModal}
                className="text-[#8F91A2] hover:text-[#505A5B] text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFF] p-4 rounded-lg">
                  <h4 className="font-semibold text-[#343F3E]">Match Score</h4>
                  <div className={`text-2xl font-bold mt-2 ${
                    selectedAnalysis.match_score >= 80 ? 'text-green-600' :
                    selectedAnalysis.match_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {selectedAnalysis.match_score}%
                  </div>
                </div>
                
                <div className="bg-[#F8FAFF] p-4 rounded-lg">
                  <h4 className="font-semibold text-[#343F3E]">Analyzed At</h4>
                  <p className="text-[#505A5B] mt-2">
                    {new Date(selectedAnalysis.analyzed_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-[#F8FAFF] p-4 rounded-lg">
                <h4 className="font-semibold text-[#343F3E] mb-2">Job Description</h4>
                <p className="text-[#505A5B] whitespace-pre-wrap">
                  {selectedAnalysis.job_description}
                </p>
              </div>

              {selectedAnalysis.keyword_analysis && (
                <div className="bg-[#F8FAFF] p-4 rounded-lg">
                  <h4 className="font-semibold text-[#343F3E] mb-2">Keyword Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-green-600 mb-1">Matched Keywords</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedAnalysis.keyword_analysis.matched_keywords?.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                            {keyword}
                          </span>
                        )) || <span className="text-[#505A5B]">None</span>}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-red-600 mb-1">Missing Keywords</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedAnalysis.keyword_analysis.missing_keywords?.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                            {keyword}
                          </span>
                        )) || <span className="text-[#505A5B]">None</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedAnalysis.ats_check_result && (
                <div className="bg-[#F8FAFF] p-4 rounded-lg">
                  <h4 className="font-semibold text-[#343F3E] mb-2">ATS Check Results</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Contact Info Found:</span>
                      <span className={selectedAnalysis.ats_check_result.contact_info?.email_found ? 'text-green-600' : 'text-red-600'}>
                        {selectedAnalysis.ats_check_result.contact_info?.email_found ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience Section:</span>
                      <span className={selectedAnalysis.ats_check_result.common_sections?.experience ? 'text-green-600' : 'text-red-600'}>
                        {selectedAnalysis.ats_check_result.common_sections?.experience ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Education Section:</span>
                      <span className={selectedAnalysis.ats_check_result.common_sections?.education ? 'text-green-600' : 'text-red-600'}>
                        {selectedAnalysis.ats_check_result.common_sections?.education ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skills Section:</span>
                      <span className={selectedAnalysis.ats_check_result.common_sections?.skills ? 'text-green-600' : 'text-red-600'}>
                        {selectedAnalysis.ats_check_result.common_sections?.skills ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCVsSection;