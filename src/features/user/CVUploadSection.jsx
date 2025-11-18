import React, { useState } from 'react';
// Impor API yang sesungguhnya dari file terpisah
import { jobSeekerApi } from '../../api/jobSeekerApi'; // Sesuaikan path jika perlu

// Terima props dari parent page (UserCVAnalysisPage)
function CVUploadSection({ onAnalysisComplete, isLoading, setIsLoading, onNewUpload, uploadedFile, setUploadedFile }) {
  const [selectedJob, setSelectedJob] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const jobOptions = [
    {
      id: 'erp_business_analyst',
      name: 'ERP Business Analyst Project - GSI',
      description: 'Menganalisa ERP existing di Rumah Sakit, menyusun blueprint, dan membantu implementasi.'
    },
    {
      id: 'it_data_engineer',
      name: 'IT Data Engineer - TAF',
      description: 'Merancang dan mengimplementasikan sistem manajemen data yang andal.'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
         setError('File is too large. Maximum size is 10MB.');
         setUploadedFile(null);
         return;
      }
      setError('');
      setUploadedFile(file);
      onNewUpload(); // Panggil prop dari parent
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
         setError('File is too large. Maximum size is 10MB.');
         setUploadedFile(null);
         return;
      }
      setError('');
      setUploadedFile(file);
      onNewUpload(); // Panggil prop dari parent
    }
  };

  // FUNGSI INI SEKARANG MEMANGGIL API ASLI
  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError('Please select a CV file first');
      return;
    }

    if (!selectedJob) {
      setError('Please select a job position first');
      return;
    }
    
    setError('');
    setIsLoading(true); // Panggil prop dari parent
    try {
      const cvTitle = uploadedFile.name.replace(/\.[^/.]+$/, "");
      
      // Panggil API yang sesungguhnya (dari jobSeekerApi.js)
      const result = await jobSeekerApi.analyzeCV(uploadedFile, selectedJob, cvTitle);
      
      console.log('Analysis result:', result);
      onAnalysisComplete(result); // Panggil prop dari parent dengan hasil
      
    } catch (error) {
      console.error('Analysis error:', error);
      // Menampilkan pesan error dari backend
      const errorMsg = error.error || 'Failed to analyze CV. Please check console for details.';
      setError(errorMsg);
      setIsLoading(false); // Pastikan loading berhenti jika ada error
    }
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF] max-w-2xl mx-auto font-sans">
      <h2 className="text-2xl font-bold text-[#343F3E] mb-2">Upload Your CV</h2>
      <p className="text-[#505A5B] mb-6">Get instant analysis and improvement suggestions</p>
      
      {/* Job Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#505A5B] mb-2">
          Select Job Position
        </label>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="w-full px-4 py-3 border border-[#94B0DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94B0DA] bg-white"
        >
          <option value="">Choose a job position...</option>
          {jobOptions.map((job) => (
            <option key={job.id} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
        {selectedJob && (
          <p className="text-sm text-[#8F91A2] mt-2">
            {jobOptions.find(job => job.id === selectedJob)?.description}
          </p>
        )}
      </div>

      {/* File Upload - Drag & Drop */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#505A5B] mb-2">
          Upload CV
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-[#94B0DA] bg-[#DCEDFF]' 
              : 'border-[#94B0DA] bg-white'
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
            className="hidden"
            id="cv-upload"
          />
          <label htmlFor="cv-upload" className="cursor-pointer block">
            <div className="text-4xl mb-4">📄</div> 
            <p className="text-lg font-medium text-[#343F3E] mb-2">
              {uploadedFile ? uploadedFile.name : 'Drag & drop your CV here'}
            </p>
            <p className="text-[#505A5B] mb-4">
              or click to browse files
            </p>
            <div className="px-6 py-2 bg-[#94B0DA] text-white rounded-lg inline-block hover:bg-[#7A9BC8] transition-colors">
              Choose File
            </div>
          </label>
        </div>
        <div className="text-center mt-3">
          <p className="text-sm text-[#8F91A2]">
            Supported formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>
      </div>

      {/* Tampilkan Error jika ada */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isLoading || !uploadedFile || !selectedJob} // Gunakan state dari props
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
          isLoading || !uploadedFile || !selectedJob
            ? 'bg-[#b0b2c7] cursor-not-allowed'
            : 'bg-[#94B0DA] hover:bg-[#7A9BC8] active:scale-95'
        }`}
      >
        {isLoading ? ( // Gunakan state dari props
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Analyzing CV...
          </div>
        ) : (
          'Analyze CV'
        )}
      </button>
    </div>
  );
}

export default CVUploadSection;