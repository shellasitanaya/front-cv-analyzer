import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";

function PreviewCV() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const formData = state?.formData;
  const template = state?.template || "modern";
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [processedData, setProcessedData] = useState(null);

  const generatePDF = async (dataToGenerate = null, useAI = true) => {
    try {
      setLoading(true);
      setError(null);

      const data = dataToGenerate || formData;
      const requestData = {
        extracted_name: data.name,
        email: data.email,
        phone: data.phone,
        summary: data.summary,
        work_experience: data.experience,
        education: data.education,
        skills: data.skills,
        template: template,
        use_ai_phrasing: useAI,
      };

      console.log("📤 Generating PDF preview...");

      const response = await axios.post(
        "http://localhost:5000/api/cv/generate_custom",
        requestData,
        { 
          timeout: 45000
        }
      );

      if (response.data.success) {
        const pdfBlob = base64ToBlob(response.data.pdf_base64, 'application/pdf');
        const url = window.URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        
        if (response.data.processed_data) {
          const processed = response.data.processed_data;
          setProcessedData(processed);
        }
        
        console.log("✅ PDF preview generated successfully");
      } else {
        throw new Error(response.data.error || 'Unknown error');
      }
      
    } catch (error) {
      console.error("❌ Error generating PDF preview:", error);
      if (error.code === 'ECONNABORTED') {
        setError("Timeout: Generate CV terlalu lama. Coba lagi.");
      } else if (error.response?.status === 500) {
        setError("Server error: Silakan coba lagi beberapa saat.");
      } else {
        setError(`Gagal menghasilkan CV: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const base64ToBlob = (base64, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  useEffect(() => {
    if (!formData) {
      setError("No form data provided");
      setLoading(false);
      return;
    }

    generatePDF();
  }, [formData, template]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleEdit = () => {
    setIsEditing(true);
    if (processedData) {
      setEditedData({
        name: processedData.extracted_name || formData.name,
        email: processedData.email || formData.email,
        phone: processedData.phone || formData.phone,
        summary: processedData.summary || formData.summary,
        experience: processedData.work_experience || formData.experience,
        education: processedData.education || formData.education,
        skills: processedData.skills || formData.skills,
      });
    } else {
      setEditedData(formData);
    }
  };

  const handleSaveEdit = async () => {
    if (editedData) {
      await generatePDF(editedData, false);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  const handleBackToForm = () => {
    navigate('/cv-generator', { 
      state: { 
        prefillData: processedData ? {
          name: processedData.extracted_name || processedData.name,
          email: processedData.email,
          phone: processedData.phone,
          summary: processedData.summary,
          experience: processedData.work_experience || processedData.experience,
          education: processedData.education,
          skills: processedData.skills,
        } : formData,
        template: template
      } 
    });
  };

  // Field change handlers
  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setEditedData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setEditedData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addNewExperience = () => {
    setEditedData(prev => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        {
          job_title: "",
          company_name: "",
          start_date: "",
          end_date: "",
          description: ""
        }
      ]
    }));
  };

  const removeExperience = (index) => {
    setEditedData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addNewEducation = () => {
    setEditedData(prev => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          degree: "",
          university: "",
          graduation_year: "",
          major: "",
          gpa: ""
        }
      ]
    }));
  };

  const removeEducation = (index) => {
    setEditedData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const displayData = isEditing ? editedData : (processedData ? {
    name: processedData.extracted_name || processedData.name,
    email: processedData.email,
    phone: processedData.phone,
    summary: processedData.summary,
    experience: processedData.work_experience || processedData.experience,
    education: processedData.education,
    skills: processedData.skills
  } : formData);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              {isEditing ? "Edit CV Data" : "Preview & Download CV"}
            </h2>
            <p className="text-center text-gray-600 mb-6">
              {isEditing ? "Edit data CV Anda di bawah ini" : "Preview CV Anda sebelum mendownload"}
            </p>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Generating CV...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-600 font-semibold mb-4">{error}</div>
                <button 
                  onClick={() => generatePDF()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {!loading && !error && isEditing && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Informasi Pribadi</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium text-gray-600 mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        value={editedData?.name || ''}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        required
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-600 mb-1">Email *</label>
                        <input
                          type="email"
                          value={editedData?.email || ''}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                          required
                          placeholder="email@contoh.com"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-600 mb-1">No. Telepon</label>
                        <input
                          type="text"
                          value={editedData?.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                          placeholder="081234567890"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Professional Summary */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ringkasan Profesional</label>
                  <textarea 
                    value={editedData?.summary || ''}
                    onChange={(e) => handleFieldChange('summary', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deskripsikan profil profesional Anda..."
                  />
                </div>

              {/* Work Experience */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Pengalaman Kerja</h3>
                  <button
                    onClick={addNewExperience}
                    className="text-sm bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition duration-200 flex items-center gap-1"
                  >
                    <span>+</span> Tambah Pengalaman
                  </button>
                </div>
                
                {editedData?.experience?.map((exp, index) => (
                  <div key={index} className="border border-orange-200 rounded-md p-4 mb-4 bg-white relative">
                    {/* Tombol Hapus di kanan atas */}
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-700">Pengalaman Kerja {index + 1}</h4>
                      {editedData.experience.length > 1 && (
                        <button
                          onClick={() => removeExperience(index)}
                          className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Posisi *</label>
                        <input
                          value={exp.job_title || ''}
                          onChange={(e) => handleExperienceChange(index, 'job_title', e.target.value)}
                          className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200 focus:border-orange-500"
                          placeholder="Software Engineer"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Perusahaan *</label>
                        <input
                          value={exp.company_name || ''}
                          onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                          className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200 focus:border-orange-500"
                          placeholder="PT Contoh Indonesia"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tanggal Mulai</label>
                        <input
                          value={exp.start_date || ''}
                          onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                          className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200 focus:border-orange-500"
                          placeholder="Jan 2020"
                        />
                        <p className="text-xs text-gray-500 mt-1">Contoh: Jan 2020</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tanggal Selesai</label>
                        <input
                          value={exp.end_date || ''}
                          onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                          className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200 focus:border-orange-500"
                          placeholder="Des 2022 / Sekarang"
                        />
                        <p className="text-xs text-gray-500 mt-1">Isi 'Sekarang' jika masih bekerja</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Deskripsi Pekerjaan</label>
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                        className="w-full border rounded-md p-2 text-sm h-20 focus:ring-1 focus:ring-orange-200 focus:border-orange-500"
                        placeholder="Deskripsikan tanggung jawab, pencapaian, dan keterampilan yang digunakan..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Gunakan bullet points dengan menekan Enter untuk baris baru
                      </p>
                    </div>
                  </div>
                ))}
              </div>

                {/* Education */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Pendidikan</h3>
                    <button
                      onClick={addNewEducation}
                      className="text-sm bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition duration-200 flex items-center gap-1"
                    >
                      <span>+</span> Tambah Pendidikan
                    </button>
                  </div>
                  
                  {editedData?.education?.map((edu, index) => (
                    <div key={index} className="border border-purple-200 rounded-md p-4 mb-4 bg-white relative">
                      {/* Tombol Hapus di kanan atas */}
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-700">Pendidikan {index + 1}</h4>
                        {editedData.education.length > 1 && (
                          <button
                            onClick={() => removeEducation(index)}
                            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Gelar / Jenjang *</label>
                          <input
                            value={edu.degree || ''}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500"
                            placeholder="S1 Teknik Informatika"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Universitas *</label>
                          <input
                            value={edu.university || ''}
                            onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                            className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500"
                            placeholder="Universitas Contoh"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Tahun Lulus</label>
                          <input
                            value={edu.graduation_year || ''}
                            onChange={(e) => handleEducationChange(index, 'graduation_year', e.target.value)}
                            className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500"
                            placeholder="2020"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Jurusan</label>
                          <input
                            value={edu.major || ''}
                            onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                            className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500"
                            placeholder="Teknik Informatika"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-1">IPK</label>
                          <input
                            value={edu.gpa || ''}
                            onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                            className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500"
                            placeholder="3.75"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <textarea
                    value={editedData?.skills || ''}
                    onChange={(e) => handleFieldChange('skills', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Python, JavaScript, React, MySQL, ..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center pt-6">
                  <button 
                    onClick={handleSaveEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition duration-200"
                  >
                    💾 Simpan & Regenerate
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-semibold transition duration-200"
                  >
                    ❌ Batal
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && !isEditing && pdfUrl && (
              <>
                {/* PDF Preview */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Preview CV</h3>
                    <div className="text-sm text-gray-500">
                      CV {displayData?.name}
                    </div>
                  </div>
                  
                  <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white mx-auto" style={{ maxWidth: '210mm', height: '297mm' }}>
                    <iframe 
                      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      title="CV Preview" 
                      width="100%" 
                      height="100%"
                      className="border-0"
                      style={{ minHeight: '297mm', background: 'white' }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="text-center space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <a
                      href={pdfUrl}
                      download={`CV_${displayData?.name?.replace(/\s+/g, '_') || 'CV'}.pdf`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition duration-200 flex items-center gap-2"
                    >
                      📥 Download CV
                    </a>
                    
                    <button 
                      onClick={handleEdit}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold transition duration-200 flex items-center gap-2"
                    >
                      ✏️ Edit Data CV
                    </button>
                    
                    <button 
                      onClick={handleBackToForm}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-semibold transition duration-200 flex items-center gap-2"
                    >
                      ↩️ Kembali ke Form
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default PreviewCV;