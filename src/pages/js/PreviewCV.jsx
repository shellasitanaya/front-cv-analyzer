import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function PreviewCV({ formData, template, onBack, onRestart }) {
  // --- DATA DROPDOWN ---
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 56 }, (_, i) => currentYear + 5 - i);

  // --- STATE UTAMA ---
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk menyimpan data HASIL AI (agar bisa diedit)
  const [processedData, setProcessedData] = useState(null); 

  // State Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // --- HELPER FUNGSI TANGGAL ---
  const parseDate = (dateString) => {
    if (!dateString || dateString === "Sekarang") return { month: "", year: "" };
    const parts = dateString.split(" ");
    if (parts.length >= 2) {
        return { month: parts[0], year: parts[1] };
    }
    return { month: "", year: "" };
  };

  const base64ToBlob = (base64, type = "application/pdf") => {
    const binStr = atob(base64);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type: type });
  };

  // --- 1. FUNGSI GENERATE ---
  const generatePDF = useCallback(async (dataToGenerate = null, useAI = true) => {
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

      console.log("🚀 Mengirim Data ke Backend...", requestData);

      const response = await axios.post(
        "http://localhost:5000/api/cv/generate_custom",
        requestData,
        { timeout: 60000 }
      );

      const resData = response.data;

      if (resData.success) {
        console.log("✅ PDF Diterima");
        
        const pdfBlob = base64ToBlob(resData.pdf_base64);
        const url = window.URL.createObjectURL(pdfBlob);
        setPdfUrl(url);

        // SIMPAN DATA HASIL AI
        if (resData.processed_data) {
            setProcessedData(resData.processed_data);
        }

        setLoading(false);
      } else {
        throw new Error(resData.error || "Gagal membuat CV");
      }
      
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
      if (err.response && err.response.data && err.response.data.error) {
         setError(err.response.data.error);
      } else {
         setError("Gagal menghubungi server. Pastikan backend Flask berjalan.");
      }
      setLoading(false);
    }
  }, [formData, template]);

  // --- 2. EFFECT UTAMA ---
  useEffect(() => {
    if (formData && template) {
      generatePDF();
    }
  }, [generatePDF, formData, template]); 

  // --- 3. EFFECT CLEANUP ---
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // --- LOGIKA EDIT FORM ---
  const handleEdit = () => {
    setIsEditing(true);
    setValidationErrors({});

    // Gunakan data hasil AI jika ada, fallback ke input awal
    if (processedData) {
        setEditedData({
            name: processedData.extracted_name || formData.name,
            email: processedData.email || formData.email,
            phone: processedData.phone || formData.phone,
            summary: processedData.summary || formData.summary,
            experience: processedData.work_experience || formData.experience,
            education: processedData.education || formData.education,
            skills: processedData.skills || formData.skills
        });
    } else {
        setEditedData(formData); 
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!editedData.name || !editedData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
      isValid = false;
    }

    if (!editedData.email || !editedData.email.trim()) {
        newErrors.email = "Email wajib diisi";
        isValid = false;
    }

    editedData.education.forEach((edu, index) => {
        if (edu.gpa) {
            const gpaRegex = /^([0-3]\.\d{2}|4\.00)$/;
            if (!gpaRegex.test(edu.gpa)) {
                newErrors[`edu_${index}_gpa`] = "Format IPK: X.XX (misal 3.50)";
                isValid = false;
            }
        }
    });

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleSaveEdit = async () => {
      if (editedData) {
        if (validateForm()) {
            await generatePDF(editedData, false); 
            setIsEditing(false);
        } else {
            alert("Mohon perbaiki error input.");
        }
      }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(null);
    setValidationErrors({});
  };

  // --- HANDLERS PERUBAHAN DATA ---
  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) setValidationErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleDateChange = (index, field, part, value) => {
    const newExp = [...editedData.experience];
    const currentExp = newExp[index];
    const { month, year } = parseDate(currentExp[field]);
    
    let newDateString = "";
    if (part === "month") newDateString = value ? `${value} ${year}`.trim() : year; 
    else if (part === "year") newDateString = value ? `${month} ${value}`.trim() : month;

    newExp[index][field] = newDateString;
    setEditedData(prev => ({ ...prev, experience: newExp }));
  };

  const handleCurrentlyWorking = (index, isChecked) => {
    const newExp = [...editedData.experience];
    newExp[index].end_date = isChecked ? "Sekarang" : "";
    setEditedData(prev => ({ ...prev, experience: newExp }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExp = [...editedData.experience];
    newExp[index][field] = value;
    setEditedData(prev => ({ ...prev, experience: newExp }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEdu = [...editedData.education];
    newEdu[index][field] = value;
    setEditedData(prev => ({ ...prev, education: newEdu }));
    const errorKey = `edu_${index}_${field}`;
    if (validationErrors[errorKey]) setValidationErrors(prev => ({ ...prev, [errorKey]: null }));
  };

  const addNewExperience = () => {
    setEditedData(prev => ({
      ...prev,
      experience: [...prev.experience, { job_title: "", company_name: "", start_date: "", end_date: "", description: "" }]
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
      education: [...prev.education, { degree: "", university: "", graduation_year: "", major: "", gpa: "" }]
    }));
  };

  const removeEducation = (index) => {
    setEditedData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
    setValidationErrors({});
  };

  // --- TAMPILAN (RENDER) ---
  return (
    <div className="w-full">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            
            {/* LOADING */}
            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Sedang menyusun CV Anda...</p>
                </div>
            )}

            {/* ERROR */}
            {error && !loading && (
                 <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600 font-bold text-lg mb-2">Terjadi Kesalahan</p>
                    <p className="text-red-500 mb-6">{error}</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => generatePDF()} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Coba Lagi</button>
                        <button onClick={onBack} className="text-gray-600 hover:text-gray-800 font-medium underline">Kembali ke Form</button>
                    </div>
                 </div>
            )}

            {/* EDIT MODE */}
            {!loading && !error && isEditing && editedData && (
                 <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="text-xl font-bold text-gray-800">Edit Data CV</h3>
                    </div>
                    
                    {/* 1. Data Diri (UPDATED: Added Email & Phone) */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-gray-700 mb-3">Informasi Pribadi</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-sm">Nama Lengkap</label>
                                <input 
                                    value={editedData.name || ''} 
                                    onChange={(e) => handleFieldChange('name', e.target.value)}
                                    className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-200 outline-none ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1 text-sm">Email</label>
                                    <input 
                                        type="email"
                                        value={editedData.email || ''} 
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                        className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-200 outline-none ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1 text-sm">No. Telepon</label>
                                    <input 
                                        type="text"
                                        value={editedData.phone || ''} 
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-200 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* 2. Summary */}
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <label className="block text-gray-700 font-bold mb-2">Summary</label>
                        <textarea 
                            value={editedData.summary || ''} 
                            rows={4}
                            onChange={(e) => handleFieldChange('summary', e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none"
                        />
                    </div>

                    {/* 3. Pengalaman Kerja (Dropdown & Checkbox) */}
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-700">Pengalaman Kerja</h4>
                            <button onClick={addNewExperience} className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">+ Tambah</button>
                        </div>
                        
                        {editedData.experience?.map((exp, idx) => {
                            const startDate = parseDate(exp.start_date);
                            const endDate = parseDate(exp.end_date);
                            const isCurrentlyWorking = exp.end_date === "Sekarang";

                            return (
                                <div key={idx} className="mb-6 border-b border-orange-200 pb-4 last:border-0 last:pb-0 bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex justify-end mb-2">
                                        {editedData.experience.length > 1 && (
                                            <button onClick={() => removeExperience(idx)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition">Hapus</button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="text-xs text-gray-500 font-semibold block mb-1">Posisi</label>
                                            <input value={exp.job_title} onChange={(e) => handleExperienceChange(idx, 'job_title', e.target.value)} className="w-full border border-gray-300 p-2 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-semibold block mb-1">Perusahaan</label>
                                            <input value={exp.company_name} onChange={(e) => handleExperienceChange(idx, 'company_name', e.target.value)} className="w-full border border-gray-300 p-2 rounded-lg" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        {/* Dropdown Tanggal Mulai */}
                                        <div>
                                            <label className="text-xs text-gray-500 font-semibold block mb-1">Mulai</label>
                                            <div className="flex gap-2">
                                                <select className="w-1/2 border rounded p-2 text-sm" value={startDate.month} onChange={(e) => handleDateChange(idx, 'start_date', 'month', e.target.value)}>
                                                    <option value="">Bulan</option>
                                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select className="w-1/2 border rounded p-2 text-sm" value={startDate.year} onChange={(e) => handleDateChange(idx, 'start_date', 'year', e.target.value)}>
                                                    <option value="">Tahun</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Dropdown Tanggal Selesai */}
                                        <div>
                                            <label className="text-xs text-gray-500 font-semibold block mb-1">Selesai</label>
                                            <div className="flex gap-2 mb-2">
                                                <select className="w-1/2 border rounded p-2 text-sm disabled:bg-gray-100" value={isCurrentlyWorking ? "" : endDate.month} onChange={(e) => handleDateChange(idx, 'end_date', 'month', e.target.value)} disabled={isCurrentlyWorking}>
                                                    <option value="">Bulan</option>
                                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select className="w-1/2 border rounded p-2 text-sm disabled:bg-gray-100" value={isCurrentlyWorking ? "" : endDate.year} onChange={(e) => handleDateChange(idx, 'end_date', 'year', e.target.value)} disabled={isCurrentlyWorking}>
                                                    <option value="">Tahun</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                                                <input type="checkbox" checked={isCurrentlyWorking} onChange={(e) => handleCurrentlyWorking(idx, e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                                                Saat ini saya aktif di sini
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 font-semibold block mb-1">Deskripsi Pekerjaan</label>
                                        <textarea 
                                            value={exp.description} 
                                            onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)} 
                                            className="w-full border border-gray-300 p-2 rounded-lg h-24"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 4. Pendidikan (Dropdown Tahun) */}
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-700">Pendidikan</h4>
                            <button onClick={addNewEducation} className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">+ Tambah</button>
                        </div>
                        {editedData.education?.map((edu, idx) => (
                            <div key={idx} className="mb-6 border-b border-purple-200 pb-4 last:border-0 last:pb-0 bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex justify-end mb-2">
                                    {editedData.education.length > 1 && (
                                        <button onClick={() => removeEducation(idx)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition">Hapus</button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="text-xs text-gray-500 font-semibold mb-1 block">Gelar / Jenjang</label>
                                        <input value={edu.degree} onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)} placeholder="Gelar" className="w-full border border-gray-300 p-2 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-semibold mb-1 block">Universitas</label>
                                        <input value={edu.university} onChange={(e) => handleEducationChange(idx, 'university', e.target.value)} placeholder="Universitas" className="w-full border border-gray-300 p-2 rounded-lg" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 font-semibold block mb-1">Tahun Lulus</label>
                                        <select 
                                            value={edu.graduation_year} 
                                            onChange={(e) => handleEducationChange(idx, 'graduation_year', e.target.value)}
                                            className="w-full border border-gray-300 p-2 rounded-lg bg-white"
                                        >
                                            <option value="">Pilih Tahun</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 font-semibold block mb-1">Jurusan</label>
                                        <input value={edu.major} onChange={(e) => handleEducationChange(idx, 'major', e.target.value)} placeholder="Jurusan" className="w-full border border-gray-300 p-2 rounded-lg" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-500 font-semibold block mb-1">IPK</label>
                                        <input 
                                            value={edu.gpa || ''} 
                                            onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)} 
                                            placeholder="3.75" 
                                            className={`w-full border p-2 rounded-lg ${validationErrors[`edu_${idx}_gpa`] ? 'border-red-500' : 'border-gray-300'}`} 
                                        />
                                        {validationErrors[`edu_${idx}_gpa`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`edu_${idx}_gpa`]}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 5. Skills */}
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <label className="block text-gray-700 font-bold mb-2">Keahlian</label>
                        <input
                            type="text"
                            value={editedData?.skills || ''}
                            onChange={(e) => handleFieldChange('skills', e.target.value)}
                            placeholder="Contoh: Python, React, Leadership, Project Management, JavaScript"
                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-200 focus:border-yellow-500 outline-none"
                        />
                    </div>

                    {/* Tombol Aksi Edit */}
                    <div className="flex gap-4 justify-center pt-4">
                        <button onClick={handleSaveEdit} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1">
                            💾 Simpan & Regenerate
                        </button>
                        <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-gray-600 transition">
                            ❌ Batal
                        </button>
                    </div>
                 </div>
            )}

            {/* PREVIEW */}
            {!loading && !error && !isEditing && pdfUrl && (
                <div className="flex flex-col items-center animate-fade-in">
                    <div className="w-full mb-8 border border-gray-200 rounded-xl shadow-lg overflow-hidden bg-gray-50" style={{ height: '75vh' }}>
                        <iframe 
                            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title="CV Preview"
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                        <a href={pdfUrl} download={`CV_${formData?.name?.replace(/\s+/g, '_') || 'MyCV'}.pdf`} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md transition transform hover:scale-105">
                            <span>📥</span> Download PDF
                        </a>
                        <button onClick={handleEdit} className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-md transition transform hover:scale-105">
                            <span>✏️</span> Edit Data
                        </button>
                        <button onClick={onBack} className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 flex items-center justify-center gap-2 shadow-md transition">
                            <span>↩️</span> Kembali
                        </button>
                        <button onClick={onRestart} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2 shadow-md transition">
                            <span>🔄</span> Buat Baru
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

export default PreviewCV;