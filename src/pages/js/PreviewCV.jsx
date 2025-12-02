import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function PreviewCV({ formData, template, onBack, onRestart }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  
  // State Validasi (Disimpan agar tidak error linter, bisa dikembangkan nanti)
  // eslint-disable-next-line no-unused-vars
  const [validationErrors, setValidationErrors] = useState({});

  // --- 1. FUNGSI GENERATE (Gunakan useCallback agar stabil) ---
  const generatePDF = useCallback(async (dataToGenerate = null, useAI = true) => {
    try {
      setLoading(true);
      setError(null);

      // Gunakan data edit jika ada, jika tidak gunakan data awal form
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

      // PENTING: responseType 'blob' wajib ada karena backend kirim file PDF langsung
      const response = await axios.post(
        "http://localhost:5000/api/cv/generate_custom",
        requestData,
        { 
          responseType: 'blob', 
          timeout: 60000 
        }
      );

      // Cek header untuk memastikan respons bukan JSON Error
      const contentType = response.headers['content-type'];
      
      if (contentType && contentType.includes('application/json')) {
        // Kasus: Backend mengirim error dalam format JSON meskipun kita minta blob
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.error || "Gagal membuat CV (Server Error)");
          } catch (e) {
            setError("Gagal parsing error dari server.");
          }
          setLoading(false);
        };
        reader.readAsText(response.data);
      } else {
        // Kasus Sukses: Respons adalah file PDF
        console.log("✅ PDF Diterima (Blob)");
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        
        setPdfUrl(url); // Update state URL
        setLoading(false);
        
        // Catatan: Karena backend tidak mengirim data JSON balik, 
        // kita tidak bisa update 'processedData' (AI text).
      }
      
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
      setError("Gagal menghubungi server. Pastikan backend Flask berjalan.");
      setLoading(false);
    }
  }, [formData, template]); // Dependency: Hanya dibuat ulang jika data awal berubah

  // --- 2. EFFECT UTAMA (FIX INFINITE LOOP) ---
  useEffect(() => {
    if (formData && template) {
      generatePDF();
    }
    // PENTING: Jangan masukkan 'pdfUrl' di sini! 
    // Ini yang menyebabkan loop (Generate -> SetUrl -> Effect Jalan -> Generate ...)
  }, [generatePDF, formData, template]); 

  // --- 3. EFFECT CLEANUP MEMORY ---
  useEffect(() => {
    return () => {
      // Membersihkan URL lama dari memori browser saat komponen unmount atau URL ganti
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // --- LOGIKA EDIT FORM ---
  const handleEdit = () => {
    setIsEditing(true);
    // Kita gunakan data formData (manual) karena backend tidak mengembalikan teks hasil AI
    setEditedData(formData); 
  };

  const handleSaveEdit = async () => {
      if (editedData) {
        // Generate ulang PDF dengan data hasil edit manual
        // useAI diset false agar tidak berubah-ubah lagi oleh AI saat preview
        await generatePDF(editedData, false); 
        setIsEditing(false);
      }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  // Helper perubahan input
  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
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
  };

  // --- TAMPILAN (RENDER) ---
  return (
    <div className="w-full">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            
            {/* A. LOADING INDICATOR */}
            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Sedang menyusun CV Anda...</p>
                </div>
            )}

            {/* B. ERROR MESSAGE */}
            {error && !loading && (
                 <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600 font-bold text-lg mb-2">Terjadi Kesalahan</p>
                    <p className="text-red-500 mb-6">{error}</p>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => generatePDF()} 
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Coba Lagi
                        </button>
                        <button 
                            onClick={onBack}
                            className="text-gray-600 hover:text-gray-800 font-medium underline"
                        >
                            Kembali ke Form
                        </button>
                    </div>
                 </div>
            )}

            {/* C. FORM EDIT MODE */}
            {!loading && !error && isEditing && editedData && (
                 <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="text-xl font-bold text-gray-800">Edit Data CV</h3>
                        <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                            Mode Edit Manual
                        </span>
                    </div>
                    
                    {/* 1. Data Diri */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-gray-700 font-bold mb-2">Nama Lengkap</label>
                        <input 
                            value={editedData.name || ''} 
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                        />
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

                    {/* 3. Pengalaman Kerja */}
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <h4 className="font-bold text-gray-700 mb-4">Pengalaman Kerja</h4>
                        {editedData.experience?.map((exp, idx) => (
                            <div key={idx} className="mb-6 border-b border-orange-200 pb-4 last:border-0 last:pb-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <input 
                                        value={exp.job_title} 
                                        onChange={(e) => handleExperienceChange(idx, 'job_title', e.target.value)}
                                        placeholder="Posisi"
                                        className="border border-gray-300 p-2 rounded-lg"
                                    />
                                    <input 
                                        value={exp.company_name} 
                                        onChange={(e) => handleExperienceChange(idx, 'company_name', e.target.value)}
                                        placeholder="Perusahaan"
                                        className="border border-gray-300 p-2 rounded-lg"
                                    />
                                </div>
                                <textarea 
                                    value={exp.description} 
                                    onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                                    placeholder="Deskripsi Pekerjaan"
                                    className="w-full border border-gray-300 p-2 rounded-lg h-24"
                                />
                            </div>
                        ))}
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

            {/* D. PREVIEW PDF MODE */}
            {!loading && !error && !isEditing && pdfUrl && (
                <div className="flex flex-col items-center animate-fade-in">
                    {/* Iframe PDF Viewer */}
                    <div className="w-full mb-8 border border-gray-200 rounded-xl shadow-lg overflow-hidden bg-gray-50" style={{ height: '75vh' }}>
                        <iframe 
                            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title="CV Preview"
                        />
                    </div>
                    
                    {/* Tombol Kontrol Utama */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                        <a 
                            href={pdfUrl} 
                            download={`CV_${formData?.name?.replace(/\s+/g, '_') || 'MyCV'}.pdf`} 
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md transition transform hover:scale-105"
                        >
                            <span>📥</span> Download PDF
                        </a>
                        
                        <button 
                            onClick={handleEdit} 
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-md transition transform hover:scale-105"
                        >
                            <span>✏️</span> Edit Data
                        </button>
                        
                        <button 
                            onClick={onBack} 
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 flex items-center justify-center gap-2 shadow-md transition"
                        >
                            <span>↩️</span> Kembali
                        </button>
                        
                        <button 
                            onClick={onRestart} 
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2 shadow-md transition"
                        >
                            <span>🔄</span> Buat Baru
                        </button>
                    </div>
                    
                    <p className="mt-6 text-xs text-gray-400 text-center max-w-lg">
                        *Catatan: Fitur edit menggunakan data input manual. Pastikan data sudah benar sebelum diunduh.
                    </p>
                </div>
            )}
        </div>
    </div>
  );
}

export default PreviewCV;