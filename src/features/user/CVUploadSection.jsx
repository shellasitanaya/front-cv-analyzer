import React, { useState, useEffect } from 'react';
import { jobSeekerApi } from '../../api/jobSeekerApi'; 

function CVUploadSection({ onAnalysisComplete, isLoading, setIsLoading, onNewUpload, uploadedFile, setUploadedFile }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (uploadedFile) setError('');
  }, [uploadedFile]);

  const validateAndSetFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
       setError('File too large (Max 10MB).');
       setUploadedFile(null);
       return;
    }
    onNewUpload();
    setUploadedFile(file);
    setError('');
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
    e.target.value = null; 
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !jobTitle.trim() || !jobDescription.trim()) return;
    
    setError('');
    setIsLoading(true);

    try {
      const result = await jobSeekerApi.analyzeCV(
        uploadedFile, 
        jobDescription, 
        uploadedFile.name, 
        jobTitle
      );
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.error || error.message || 'Failed to analyze CV.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 mb-8">
      {/* Header Section */}
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Upload & Analyze</h2>
        <p className="text-slate-500 mt-1 text-sm">Fill in the job details and upload your CV to get started.</p>
      </div>

      {/* Inputs Section - Stacked Vertically */}
      <div className="space-y-6 mb-8">
        
        {/* 1. Job Title */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Job Position / Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Data Engineer"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#94B0DA] focus:bg-white transition-all text-slate-700 font-medium placeholder-slate-400"
          />
        </div>

        {/* 2. Job Description - Textarea Large */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job requirements and responsibilities here..."
            rows="6"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#94B0DA] focus:bg-white transition-all text-slate-700 placeholder-slate-400 resize-y min-h-[120px]"
          />
          <p className="text-xs text-slate-400 mt-2 text-right">
            AI will analyze your CV based on this description.
          </p>
        </div>

      </div>
      
      {/* Upload Area (The Dotted Box) */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Upload CV (PDF/DOCX) <span className="text-red-500">*</span>
        </label>
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ease-in-out ${
            dragActive 
              ? 'border-[#94B0DA] bg-blue-50' 
              : 'border-gray-300 hover:border-[#94B0DA] hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          <div className="flex flex-col items-center justify-center pointer-events-none">
            <div className="w-14 h-14 bg-blue-100 text-[#94B0DA] rounded-full flex items-center justify-center mb-3 text-2xl shadow-sm">
              ☁️
            </div>
            <h3 className="text-md font-bold text-slate-700">Drag & drop your CV here</h3>
            <p className="text-slate-400 mt-1 mb-4 text-sm">Max size: 10MB</p>
            
            <button className="px-5 py-2 bg-white border border-gray-200 text-slate-600 font-semibold rounded-lg shadow-sm">
              {uploadedFile ? 'Change File' : 'Browse Files'}
            </button>

            {uploadedFile && (
              <div className="mt-4 flex items-center gap-3 text-slate-700 bg-white px-4 py-3 rounded-xl shadow-sm border border-green-100 ring-1 ring-green-100">
                <span className="text-green-500 text-xl">📄</span>
                <div className="text-left">
                  <p className="font-bold text-sm text-slate-800 truncate max-w-[200px]">{uploadedFile.name}</p>
                  <p className="text-xs text-slate-400">Ready to analyze</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
          <span className="text-lg">⚠️</span> {error}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !uploadedFile || !jobTitle.trim() || !jobDescription.trim()}
          className={`px-10 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${
            isLoading || !uploadedFile || !jobTitle.trim() || !jobDescription.trim()
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-[#94B0DA] hover:bg-[#7FA1D1] hover:shadow-blue-200'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Start Analysis</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CVUploadSection;