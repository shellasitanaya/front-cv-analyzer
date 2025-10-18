import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function CvDropzone({ onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
  });

  return (
    <div {...getRootProps()} className={`p-8 text-center border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl">☁️</span>
        <p className="font-semibold text-gray-700">Drop your CV files here</p>
        <p className="text-sm text-gray-500">or click to browse from your computer</p>
        <button type="button" className="mt-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg text-sm shadow-sm hover:bg-blue-600">Browse Files</button>
        <p className="text-xs text-gray-400 mt-1">Supported formats: PDF, DOCX (Max 10MB each)</p>
      </div>
    </div>
  );
}

function ScreeningPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [files, setFiles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  // ambil list jobs dari backend
  useEffect(() => {
    axios.get('/api/hr/jobs')
      .then(response => {
        setJobs(response.data);
      })
      .catch(error => console.error("Error fetching jobs:", error));
  }, []);

  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, { id: Math.random(), status: 'waiting' }));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  const handleRemoveFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const handleJobChange = (e) => {
    const jobId = e.target.value;
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob(job);

    // Anda bisa mengaktifkan kembali baris ini jika ingin daftar file
    // dan summary di-reset setiap kali berganti pekerjaan
    setFiles([]);
    setSummary(null);
  };


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
    setError(null);

    console.log("Files state right before creating FormData:", files);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('cv_files', file);
    });


    try {
      const response = await axios.post(`/api/hr/jobs/${selectedJob.id}/upload`, formData);
      setSummary(response.data);
      setFiles([]);
    } catch (err) {
      console.error("Error processing CVs:", err);
      setError("Terjadi kesalahan saat memproses CV. Periksa terminal backend untuk detail.");
    } finally {
      setIsProcessing(false);
    }

    

  };

  const handleViewQualified = () => {
      if (selectedJob) {
        // arahkan ke halaman ranking
        navigate(`/hr-ranking/${selectedJob.id}`);
      }
    };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Candidate Screening & Ranking</h1>
          <p className="text-gray-600 mt-1">Upload and analyze multiple CVs for efficient candidate screening</p>
        </div>

        {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center">{error}</p>}

        <div className="bg-white p-6 rounded-xl shadow-md mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl p-3 bg-blue-100 text-blue-600 rounded-full">💼</span>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500">Select Job Posting</label>
              <select onChange={handleJobChange} defaultValue="" className="mt-1 p-2 border border-gray-300 rounded-lg min-w-[300px]">
                <option value="" disabled>Choose a job posting...</option>
                {jobs.map(job => (<option key={job.id} value={job.id}>{job.job_title}</option>))}
              </select>
            </div>
          </div>
          {selectedJob && (
            <div className="text-right text-sm text-gray-600">
              <strong className="text-gray-700">Required</strong>
              <p>Min GPA: {selectedJob.min_gpa || 'N/A'}</p>
              <p>Education: {selectedJob.degree_requirements || 'N/A'}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <CvDropzone onDrop={onDrop} />
          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              {files.map(file => (
                <div key={file.id} className="flex items-center p-3 border rounded-lg bg-gray-50">
                  <span className="text-2xl mr-4">{file.name.endsWith('.pdf') ? '📄' : '📝'}</span>
                  <span className="flex-grow text-gray-700 text-sm">{file.name} - {(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  {/* Status badge bisa dibuat dinamis nanti */}
                  <span className="text-xs font-bold py-1 px-3 rounded-full bg-yellow-100 text-yellow-800">Processing...</span>
                  <button className="ml-4 text-2xl text-gray-400 hover:text-red-500" onClick={() => handleRemoveFile(file.id)}>&times;</button>
                </div>
              ))}
            </div>
          )}
          {files.length > 0 &&
            <div className="text-center mt-6">
              <button className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed" onClick={handleProcessCVs} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Process All ${files.length} CVs`}
              </button>
            </div>
          }
        </div>

        {summary && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
              <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between"><span className="text-gray-600">Total Uploaded</span><span className="font-bold text-2xl text-blue-600">{summary.passed_count + summary.rejected_count}</span></div>
              <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between"><span className="text-gray-600">Passed Filters</span><span className="font-bold text-2xl text-green-600">{summary.passed_count}</span></div>
              <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between"><span className="text-gray-600">Processing</span><span className="font-bold text-2xl text-yellow-600">0</span></div>
              <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between"><span className="text-gray-600">Rejected</span><span className="font-bold text-2xl text-red-600">{summary.rejected_count}</span></div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Rejection Reasons</h3>
              <div className="space-y-3">
                {Object.entries(summary.rejection_details).map(([reason, count]) => (
                  <div key={reason} className="flex justify-between items-center p-4 bg-red-50 border-l-4 border-red-500 rounded">
                    <span className="font-medium text-red-800">🔺 {reason}</span>
                    <span className="font-bold text-sm text-red-700 bg-red-200 py-1 px-3 rounded-full">{count} {count > 1 ? 'candidates' : 'candidate'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Export Report</button>
              <button
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                onClick={handleViewQualified}
              >
                View Qualified Candidates
              </button>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default ScreeningPage;