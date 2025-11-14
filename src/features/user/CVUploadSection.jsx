import React, { useState } from 'react';

function CVUploadSection({ onAnalysisComplete, isLoading, setIsLoading, onNewUpload, uploadedFile, setUploadedFile }) {
  const [selectedJob, setSelectedJob] = useState('');
  const [cvTitle, setCvTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const jobOptions = [
    {
      id: 'erp_business_analyst',
      name: 'ERP Business Analyst Project - GSI',
      description: 'Menilai dan menganalisa ERP existing pada lingkup Rumah Sakit, memberikan rekomendasi perbaikan, menyusun blueprint, dan membantu implementasi ERP'
    },
    {
      id: 'it_data_engineer', 
      name: 'IT Data Engineer - TAF',
      description: 'Merancang dan mengimplementasikan sistem manajemen data yang andal untuk mendukung operasional perusahaan yang optimal'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setCvTitle(file.name.replace(/\.[^/.]+$/, ""));
      onNewUpload();
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
      setUploadedFile(file);
      setCvTitle(file.name.replace(/\.[^/.]+$/, ""));
      onNewUpload();
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      alert('Please select a CV file first');
      return;
    }

    if (!selectedJob) {
      alert('Please select a job position first');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call for now
      setTimeout(() => {
        const mockResult = {
          analysis_id: 'mock-123',
          cv_id: 'mock-cv-123',
          match_score: 78.5,
          job_type: selectedJob,
          job_info: jobOptions.find(job => job.id === selectedJob),
          ats_friendliness: {
            common_sections: {
              experience: true,
              education: true,
              skills: true
            },
            contact_info: {
              email_found: true,
              phone_found: true
            },
            compatibility_score: 44,
            format_check: "Needs Improvement",
            readability: "Fair",
            sections_status: "Incomplete"
          },
          keyword_analysis: {
            matched_keywords: ['python', 'javascript', 'react', 'business analysis'],
            missing_keywords: ['docker', 'aws', 'kubernetes', 'ERP'],
            total_words: 847,
            skills_found: 23
          },
          parsed_info: {
            experience_years: 5.2
          },
          message: "Analisis berhasil dan disimpan ke database."
        };
        onAnalysisComplete(mockResult);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Analysis error:', error);
      alert(error.error || 'Failed to analyze CV');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#DCEDFF]">
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
          <p className="text-sm text-[#8F91A2]">
            Supports Bahasa Indonesia & English CVs
          </p>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isLoading || !uploadedFile || !selectedJob}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
          isLoading || !uploadedFile || !selectedJob
            ? 'bg-[#8F91A2] cursor-not-allowed'
            : 'bg-[#94B0DA] hover:bg-[#7A9BC8]'
        }`}
      >
        {isLoading ? (
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