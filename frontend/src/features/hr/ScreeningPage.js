import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './ScreeningPage.css'; // Kita akan buat file CSS baru nanti

// Komponen untuk area upload drag-and-drop
function CvDropzone({ onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
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

// Komponen utama halaman
function ScreeningPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [files, setFiles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const API_URL = process.env.REACT_APP_API_URL;

  // 1. Ambil daftar pekerjaan saat komponen dimuat
  useEffect(() => {
    axios.get(`${API_URL}/api/hr/jobs`)
      .then(response => setJobs(response.data))
      .catch(error => console.error("Error fetching jobs:", error));
  }, [API_URL]);

  // 2. Fungsi yang dipanggil saat file di-drop/dipilih
  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      status: 'waiting', // status awal untuk UI
      id: Math.random() // key unik sementara
    }));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  // 3. Fungsi untuk memproses semua CV
  const handleProcessCVs = async () => {
    if (!selectedJob) {
      alert("Please select a job posting first.");
      return;
    }
    setIsProcessing(true);

    const formData = new FormData();
    // Kirim deskripsi pekerjaan juga jika backend memerlukannya
    formData.append('job_description', selectedJob.job_description);
    files.forEach(file => {
        formData.append('cv_files', file);
    });

    try {
        const response = await axios.post(`${API_URL}/api/hr/jobs/${selectedJob.id}/upload`, formData);
        setSummary(response.data); // Simpan hasil laporan dari backend
    } catch (error) {
        console.error("Error processing CVs:", error);
        alert("An error occurred while processing CVs.");
    } finally {
        setIsProcessing(false);
    }
  };
  
  const handleJobChange = (e) => {
      const jobId = e.target.value;
      const job = jobs.find(j => j.id === parseInt(jobId));
      setSelectedJob(job);
  };

  return (
    <div className="screening-page">
      <h1>Candidate Screening & Ranking</h1>
      <p>Upload and analyze multiple CVs for efficient candidate screening</p>
      
      <div className="card job-selection-card">
        <div className="job-select-wrapper">
          <label>Select Job Posting</label>
          <select onChange={handleJobChange} defaultValue="">
            <option value="" disabled>Choose a job posting...</option>
            {jobs.map(job => <option key={job.id} value={job.id}>{job.job_title}</option>)}
          </select>
        </div>
        {selectedJob && (
            <div className="job-requirements">
                <strong>Required:</strong>
                <p>Min GPA: {selectedJob.min_gpa || 'N/A'}</p>
                <p>Education: {selectedJob.degree_requirements || 'N/A'}</p>
            </div>
        )}
      </div>

      <div className="card upload-card">
        <h4>Upload Multiple CVs</h4>
        <CvDropzone onDrop={onDrop} />
        <div className="file-list">
          {files.map((file) => (
            <div key={file.id} className="file-item">
              <span className="file-name">{file.name} - {(file.size / 1024 / 1024).toFixed(1)} MB</span>
              <span className={`status-badge ${file.status}`}>✓ {file.status}</span>
            </div>
          ))}
        </div>
        {files.length > 0 && 
            <button className="process-btn" onClick={handleProcessCVs} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Process All ${files.length} CVs`}
            </button>
        }
      </div>

      {summary && (
        <>
          <div className="summary-grid">
            <div className="summary-card">Total Uploaded <span>{summary.success_count + summary.error_count}</span></div>
            <div className="summary-card passed">Passed Filters <span>{summary.passed_count}</span></div>
            <div className="summary-card processing">Processing <span>0</span></div>
            <div className="summary-card rejected">Rejected <span>{summary.rejected_count}</span></div>
          </div>
          <div className="card rejection-card">
            <h3>Rejection Reasons</h3>
            {summary.rejection_details && Object.entries(summary.rejection_details).map(([reason, count]) => (
                <div key={reason} className="reason-item">
                    <span>⚠️ {reason}</span>
                    <span className="reason-count">{count} {count > 1 ? 'candidates' : 'candidate'}</span>
                </div>
            ))}
          </div>
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