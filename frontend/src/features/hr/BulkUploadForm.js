import React, { useState } from 'react';
import axios from 'axios';

// Komponen ini menerima satu prop: onUploadSuccess
// onUploadSuccess adalah fungsi yang akan dipanggil setelah upload berhasil
function BulkUploadForm({ onUploadSuccess }) {
  const [jobDescription, setJobDescription] = useState('');
  const [cvFiles, setCvFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cvFiles.length === 0) {
      setError("Silakan pilih file CV untuk diunggah.");
      return;
    }
    
    setIsUploading(true);
    setError(''); // Bersihkan error sebelumnya

    const formData = new FormData();
    formData.append('job_description', jobDescription);
    for (const file of cvFiles) {
      formData.append('cv_files', file);
    }

    try {
      // Kita asumsikan job_id=501 untuk sementara
      const response = await axios.post(`${API_URL}/api/hr/jobs/501/upload`, formData);
      alert('Upload berhasil! ' + response.data.message);
      
      // Panggil fungsi onUploadSuccess yang diberikan oleh parent
      onUploadSuccess(); 

    } catch (err) {
      setError('Upload gagal. Pastikan backend berjalan dan coba lagi.');
      console.error("Error uploading files:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Unggah CV Kandidat Baru</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Deskripsi Pekerjaan</label>
          <textarea
            placeholder="Tempel deskripsi pekerjaan di sini..."
            rows="8"
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label>Pilih File CV (Bisa lebih dari satu)</label>
          <input
            type="file"
            multiple
            accept=".pdf,.docx"
            onChange={e => setCvFiles(e.target.files)}
            required
          />
        </div>
        {error && <p className="error-message-form">{error}</p>}
        <button type="submit" className="upload-btn" disabled={isUploading}>
          {isUploading ? 'Memproses...' : 'Unggah & Peringkatkan Kandidat'}
        </button>
      </form>
    </div>
  );
}

export default BulkUploadForm;