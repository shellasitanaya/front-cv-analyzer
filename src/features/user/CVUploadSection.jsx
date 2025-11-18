import React, { useState, useEffect } from 'react';
import { AstraAPI, transformAstraAnalysis   } from "../../services/Api.js"; // Sesuaikan path ke file api.js

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

  useEffect(() => {
    console.log('📦 [CVUploadSection] uploadedFile:', uploadedFile);
    console.log('📦 [CVUploadSection] cvTitle:', cvTitle);
  }, [uploadedFile, cvTitle]);

  useEffect(() => {
    console.log('🔍 [Button State Debug]');
    console.log('  isLoading:', isLoading);
    console.log('  uploadedFile:', uploadedFile);
    console.log('  selectedJob:', selectedJob);
    console.log('  Button enabled?', !isLoading && !!uploadedFile && !!selectedJob);
  }, [isLoading, uploadedFile, selectedJob]);

  const handleFileChange = (e) => {
    console.log('🔍 handleFileChange triggered!', e.target.files);
    const file = e.target.files[0];
    console.log('📄 File selected:', file);
    
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Validasi file
      if (file.size > 10 * 1024 * 1024) {
        alert('File size terlalu besar. Maksimal 10MB');
        return;
      }
      
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        console.log('❌ Invalid file type:', file.type);
        alert('Format file tidak didukung. Gunakan PDF, DOC, atau DOCX');
        return;
      }
      
      console.log('✅ File valid, setting uploadedFile...');
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      
      // Set semua state sekaligus
      setUploadedFile(file);
      setCvTitle(fileName);
      
      if (onNewUpload) {
        onNewUpload();
      }
      
      console.log('✅ File uploaded successfully!');
      console.log('📝 Set cvTitle to:', fileName);
    } else {
      console.log('❌ No file selected');
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
    console.log('🔍 handleDrop triggered!', e.dataTransfer.files);
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      console.log('📄 Dropped file:', file);
      
      // ... rest of validation
    } else {
      console.log('❌ No files in drop event');
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
      // Buat FormData untuk upload file
      const formData = new FormData();
      formData.append('cv_file', uploadedFile);
      formData.append('cv_title', cvTitle);
      formData.append('job_type', selectedJob);

      console.log('📤 Uploading CV to backend...', {
        file: uploadedFile.name,
        jobType: selectedJob,
        size: uploadedFile.size,
        type: uploadedFile.type
      });

      // ✅ DEBUG: Check FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} =`, value);
      }

      // Panggil API yang sebenarnya
      const result = await AstraAPI.analyzeCV(selectedJob, formData);
      
      const transformedData = transformAstraAnalysis(result);
      onAnalysisComplete(transformedData);
      console.log('✅ Analysis complete:', result);
      onAnalysisComplete(result);
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
      
      // ✅ TAMPILKAN ERROR DETAIL
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
        alert('Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000');
      } else {
        alert(error.message || 'Failed to analyze CV');
      }
    } finally {
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
            style={{ display: 'none', position: 'absolute', zIndex: -1 }}
          />
          <label htmlFor="cv-upload" className="cursor-pointer block">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg font-medium text-[#343F3E] mb-2">
              {/* ✅ TAMPILKAN FILE NAME */}
              {uploadedFile ? (
                <span className="text-green-600">✓ {uploadedFile.name}</span>
              ) : (
                'Drag & drop your CV here'
              )}
            </p>
            <p className="text-[#505A5B] mb-4">
              or click to browse files
            </p>
            <div className="px-6 py-2 bg-[#94B0DA] text-white rounded-lg inline-block hover:bg-[#7A9BC8] transition-colors">
              {uploadedFile ? 'Change File' : 'Choose File'}
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
          `Analyze CV ${uploadedFile ? `(${uploadedFile.name})` : ''}`
        )}
      </button>
    </div>
  );
}

export default CVUploadSection;