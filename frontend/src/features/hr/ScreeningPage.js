import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './ScreeningPage.css'; // Pastikan file CSS ini ada di folder yang sama

//================================================================
// KOMPONEN UNTUK AREA UPLOAD (DRAG & DROP)
//================================================================
function CvDropzone({ onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'], 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] 
    }
  });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      <div className="dropzone-content">
        <span className="upload-icon">☁️</span>
        <p>Drop your CV files here</p>
        <p className="or-text">or click to browse from your computer</p>
        <button type="button" className="browse-btn">Browse Files</button>
        <p className="supported-formats">Supported formats: PDF, DOCX (Max 10MB each)</p>
      </div>
    </div>
  );
}

//================================================================
// KOMPONEN UTAMA HALAMAN SCREENING
//================================================================
function ScreeningPage() {
  // --- STATE MANAGEMENT ---
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [files, setFiles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL;

  // --- API CALLS & LOGIC ---

  // 1. Ambil daftar pekerjaan saat komponen pertama kali dimuat
  useEffect(() => {
    axios.get(`${API_URL}/api/hr/jobs`)
      .then(response => {
        setJobs(response.data);
      })
      .catch(error => {
        console.error("Error fetching jobs:", error);
        setError("Gagal mengambil daftar pekerjaan. Pastikan backend berjalan.");
      });
  }, [API_URL]);

  // 2. Fungsi yang dipanggil saat file di-drop atau dipilih
  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      id: Math.random(),
      status: 'waiting',
    }));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  // 3. Fungsi untuk menghapus file dari daftar
  const handleRemoveFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };
  
  // 4. Fungsi untuk menangani perubahan dropdown pekerjaan
  const handleJobChange = (e) => {
      const jobId = e.target.value;
      const job = jobs.find(j => j.id === parseInt(jobId));
      setSelectedJob(job);
  };

  // 5. Fungsi utama untuk memproses semua CV
  const handleProcessCVs = async () => {
    if (!selectedJob) {
      alert("Please select a job posting first.");
      return;
    }
    if (files.length === 0) {
      alert("Please add CV files to process.");
      return;
    }

    setIsProcessing(true);
    setSummary(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('cv_files', file);
    });

    try {
      const response = await axios.post(`${API_URL}/api/hr/jobs/${selectedJob.id}/upload`, formData);
      setSummary(response.data);
      setFiles([]); // Kosongkan daftar file setelah berhasil
    } catch (err) {
      console.error("Error processing CVs:", err);
      alert("An error occurred while processing CVs. Check the console.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- RENDER TAMPILAN ---
  return (
    <div className="screening-page">
      <div className="header-section">
        <h1>Candidate Screening & Ranking</h1>
        <p>Upload and analyze multiple CVs for efficient candidate screening</p>
      </div>
      
      {error && <p className="error-message">{error}</p>}

      <div className="card job-selection-card">
        <div className="job-select-wrapper">
          <span className="job-icon">💼</span>
          <div>
            <label>Select Job Posting</label>
            <select onChange={handleJobChange} defaultValue="">
              <option value="" disabled>Choose a job posting...</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.job_title}</option>
              ))}
            </select>
          </div>
        </div>
        {selectedJob && (
          <div className="job-requirements">
            <strong>Required</strong>
            <p>Min GPA: {selectedJob.min_gpa || 'N/A'}</p>
            <p>Education: {selectedJob.degree_requirements || 'N/A'}</p>
          </div>
        )}
      </div>

      <div className="card upload-card">
        <CvDropzone onDrop={onDrop} />
        {files.length > 0 && (
          <div className="file-list">
            {files.map(file => (
              <div key={file.id} className="file-item">
                <span className="file-icon">{file.name.endsWith('.pdf') ? '📄' : '📝'}</span>
                <span className="file-name">{file.name} - {(file.size / 1024 / 1024).toFixed(1)} MB</span>
                <span className={`status-badge ${file.status}`}>✓ Waiting</span>
                <button className="remove-file-btn" onClick={() => handleRemoveFile(file.id)}>&times;</button>
              </div>
            ))}
          </div>
        )}
        {files.length > 0 && 
          <div className="process-btn-container">
            <button className="process-btn" onClick={handleProcessCVs} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Process All ${files.length} CVs`}
            </button>
          </div>
        }
      </div>

      {summary && (
        <>
          <div className="summary-grid">
            <div className="summary-card total">Total Processed <span>{summary.passed_count + summary.rejected_count}</span></div>
            <div className="summary-card passed">Passed Filters <span>{summary.passed_count}</span></div>
            <div className="summary-card processing">Processing <span>0</span></div>
            <div className="summary-card rejected">Rejected <span>{summary.rejected_count}</span></div>
          </div>
          {summary.rejected_count > 0 && (
            <div className="card rejection-card">
              <h3>Rejection Reasons</h3>
              {Object.entries(summary.rejection_details).map(([reason, count]) => (
                <div key={reason} className="reason-item">
                  <span>{reason.includes('GPA') ? '🔺' : '🎓'} {reason}</span>
                  <span className="reason-count">{count} {count > 1 ? 'candidates' : 'candidate'}</span>
                </div>
              ))}
            </div>
          )}
          <div className="action-buttons">
            <button className="secondary-btn">Export Report</button>
            <button className="primary-btn">View Qualified Candidates</button>
          </div>
        </>
      )}
    </div>
  );
}

export default ScreeningPage;