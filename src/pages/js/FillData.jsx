import React, { useState } from "react";

function FillData({ template, onComplete, onBack }) {
  // --- KONFIGURASI DROPDOWN ---
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  
  // Generate tahun dari 2030 mundur ke 1980
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 51 }, (_, i) => currentYear + 5 - i);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
    experience: [
      {
        job_title: "",
        company_name: "",
        start_date: "", // Format: "Jan 2023"
        end_date: "",   // Format: "Des 2024" atau "Sekarang"
        description: ""
      }
    ],
    education: [
      {
        degree: "",
        university: "",
        graduation_year: "",
        major: "",
        gpa: ""
      }
    ],
    skills: "",
  });

  const [errors, setErrors] = useState({});

  // --- HELPER FUNGSI UNTUK MENGURUS TANGGAL ---
  
  // Memecah string "Jan 2023" menjadi { month: "Jan", year: "2023" }
  const parseDate = (dateString) => {
    if (!dateString || dateString === "Sekarang") return { month: "", year: "" };
    const parts = dateString.split(" ");
    return { month: parts[0] || "", year: parts[1] || "" };
  };

  // Handler khusus untuk mengubah Bulan/Tahun pada Pengalaman Kerja
  const handleDateChange = (index, field, part, value) => {
    const updatedExperience = [...formData.experience];
    const currentExp = updatedExperience[index];
    
    // Ambil nilai lama
    const { month, year } = parseDate(currentExp[field]);
    
    let newDateString = "";
    
    if (part === "month") {
      // Jika tahun belum dipilih, biarkan kosong dulu atau paksa user pilih tahun nanti
      newDateString = value ? `${value} ${year}`.trim() : year; 
    } else if (part === "year") {
      newDateString = value ? `${month} ${value}`.trim() : month;
    }

    updatedExperience[index][field] = newDateString;
    setFormData({ ...formData, experience: updatedExperience });
  };

  // Handler untuk Checkbox "Masih Bekerja"
  const handleCurrentlyWorking = (index, isChecked) => {
    const updatedExperience = [...formData.experience];
    if (isChecked) {
      updatedExperience[index].end_date = "Sekarang";
    } else {
      updatedExperience[index].end_date = ""; // Reset jadi kosong agar bisa dipilih lagi
    }
    setFormData({ ...formData, experience: updatedExperience });
  };

  // --- HANDLER STANDAR ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index][field] = value;
    setFormData({ ...formData, experience: updatedExperience });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    setFormData({ ...formData, education: updatedEducation });
    
    const errorKey = `edu_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: null });
    }
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { job_title: "", company_name: "", start_date: "", end_date: "", description: "" }
      ]
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { degree: "", university: "", graduation_year: "", major: "", gpa: "" }
      ]
    });
  };

  const removeExperience = (index) => {
    if (formData.experience.length > 1) {
      const updatedExperience = formData.experience.filter((_, i) => i !== index);
      setFormData({ ...formData, experience: updatedExperience });
    }
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const updatedEducation = formData.education.filter((_, i) => i !== index);
      setFormData({ ...formData, education: updatedEducation });
      setErrors({}); 
    }
  };

  // --- VALIDASI ---
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) { newErrors.name = "Nama wajib diisi"; isValid = false; }
    else if (!/^[a-zA-Z\s]+$/.test(formData.name)) { newErrors.name = "Nama harus berupa huruf"; isValid = false; }

    if (!formData.email.trim()) { newErrors.email = "Email wajib diisi"; isValid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = "Format email tidak valid"; isValid = false; }

    if (formData.phone && !/^\d+$/.test(formData.phone)) { newErrors.phone = "Nomor telepon harus berupa angka"; isValid = false; }

    const hasEmptyCompany = formData.experience.some(exp => !exp.company_name || exp.company_name.trim() === "");
    if (hasEmptyCompany) { alert("Harap isi nama perusahaan untuk semua pengalaman kerja!"); isValid = false; }

    formData.education.forEach((edu, index) => {
      if (!edu.university || edu.university.trim() === "") {
        alert(`Harap isi nama universitas untuk pendidikan ke-${index + 1}!`);
        isValid = false;
      }
      // Tahun Lulus sekarang dropdown, pasti angka, tapi cek jika kosong
      if (!edu.graduation_year) {
         // Optional: bisa tambah validasi required jika mau
      }

      if (edu.major && !/^[a-zA-Z\s]+$/.test(edu.major)) {
        newErrors[`edu_${index}_major`] = "Jurusan harus berupa huruf";
        isValid = false;
      }

      if (edu.gpa) {
        const gpaRegex = /^([0-3]\.\d{2}|4\.00)$/;
        if (!gpaRegex.test(edu.gpa)) {
          newErrors[`edu_${index}_gpa`] = "Format IPK harus X.XX (contoh: 3.50 atau 4.00)";
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleGenerate = () => {
    if (validateForm()) {
      onComplete(formData);
    } else {
      alert("Mohon perbaiki error yang tertera pada form.");
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white p-8 rounded-xl shadow-md w-full">
        {/* Tombol Back */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Kembali ke Pilih Template
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">
          Isi Data Diri
        </h2>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Personal Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Informasi Pribadi</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-600 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                  required
                  placeholder="Masukkan nama lengkap"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                    required
                    placeholder="email@contoh.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">No. Telepon</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="081234567890"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-green-50 p-4 rounded-lg">
            <label className="block font-medium text-gray-600 mb-1">Summary / Tentang Saya</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              className="w-full border rounded-md p-2 h-24 focus:ring-2 focus:ring-green-200 focus:border-green-500"
              placeholder="Ceritakan tentang diri Anda secara profesional, pengalaman, dan keahlian..."
            />
            <p className="text-sm text-gray-500 mt-1">Deskripsi singkat tentang profil profesional Anda (Bebas)</p>
          </div>

          {/* Work Experience Section (UPDATED) */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Pengalaman Kerja</h3>
              <button
                type="button"
                onClick={addExperience}
                className="text-sm bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition duration-200 flex items-center gap-1"
              >
                <span>+</span> Tambah Pengalaman
              </button>
            </div>
            
            {formData.experience.map((exp, index) => {
              // Parse current dates for dropdown values
              const startDate = parseDate(exp.start_date);
              const endDate = parseDate(exp.end_date);
              const isCurrentlyWorking = exp.end_date === "Sekarang";

              return (
                <div key={index} className="border border-orange-200 rounded-md p-4 mb-4 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Pengalaman Kerja {index + 1}</h4>
                    {formData.experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-200"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Posisi *</label>
                      <input
                        type="text"
                        value={exp.job_title}
                        onChange={(e) => handleExperienceChange(index, 'job_title', e.target.value)}
                        className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200 focus:border-orange-500"
                        placeholder="Software Engineer"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Perusahaan *</label>
                      <input
                        type="text"
                        value={exp.company_name}
                        onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                        className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200 focus:border-orange-500"
                        placeholder="PT Contoh Indonesia"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* DROPDOWN TANGGAL MULAI & SELESAI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {/* Tanggal Mulai */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tanggal Mulai</label>
                      <div className="flex gap-2">
                        <select 
                          className="w-1/2 border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200"
                          value={startDate.month}
                          onChange={(e) => handleDateChange(index, 'start_date', 'month', e.target.value)}
                        >
                          <option value="">Bulan</option>
                          {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          className="w-1/2 border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200"
                          value={startDate.year}
                          onChange={(e) => handleDateChange(index, 'start_date', 'year', e.target.value)}
                        >
                          <option value="">Tahun</option>
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Tanggal Selesai */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tanggal Selesai</label>
                      <div className="flex gap-2 mb-2">
                        <select 
                          className="w-1/2 border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200 disabled:bg-gray-100"
                          value={isCurrentlyWorking ? "" : endDate.month}
                          onChange={(e) => handleDateChange(index, 'end_date', 'month', e.target.value)}
                          disabled={isCurrentlyWorking}
                        >
                          <option value="">Bulan</option>
                          {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          className="w-1/2 border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200 disabled:bg-gray-100"
                          value={isCurrentlyWorking ? "" : endDate.year}
                          onChange={(e) => handleDateChange(index, 'end_date', 'year', e.target.value)}
                          disabled={isCurrentlyWorking}
                        >
                          <option value="">Tahun</option>
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      
                      {/* Checkbox Masih Aktif */}
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={isCurrentlyWorking}
                          onChange={(e) => handleCurrentlyWorking(index, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        Saat ini saya aktif di sini
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Deskripsi Pekerjaan</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      className="w-full border rounded-md p-2 text-sm h-20 focus:ring-1 focus:ring-orange-200 focus:border-orange-500"
                      placeholder="Deskripsikan tanggung jawab, pencapaian, dan keterampilan yang digunakan..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Gunakan bullet points dengan menekan Enter untuk baris baru (Bebas)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Education Section (UPDATED) */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Pendidikan</h3>
              <button
                type="button"
                onClick={addEducation}
                className="text-sm bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition duration-200 flex items-center gap-1"
              >
                <span>+</span> Tambah Pendidikan
              </button>
            </div>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="border border-purple-200 rounded-md p-4 mb-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Pendidikan {index + 1}</h4>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-200"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Gelar / Jenjang *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="S1 Teknik Informatika"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Universitas *</label>
                    <input
                      type="text"
                      value={edu.university}
                      onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                      className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="Universitas Contoh"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* TAHUN LULUS JADI DROPDOWN */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tahun Lulus</label>
                    <select
                      value={edu.graduation_year}
                      onChange={(e) => handleEducationChange(index, 'graduation_year', e.target.value)}
                      className={`w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500 ${errors[`edu_${index}_graduation_year`] ? 'border-red-500' : ''}`}
                    >
                      <option value="">Pilih Tahun</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {errors[`edu_${index}_graduation_year`] && <p className="text-red-500 text-xs mt-1">{errors[`edu_${index}_graduation_year`]}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Jurusan</label>
                    <input
                      type="text"
                      value={edu.major}
                      onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                      className={`w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500 ${errors[`edu_${index}_major`] ? 'border-red-500' : ''}`}
                      placeholder="Teknik Informatika"
                    />
                    {errors[`edu_${index}_major`] && <p className="text-red-500 text-xs mt-1">{errors[`edu_${index}_major`]}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">IPK</label>
                    <input
                      value={edu.gpa || ''}
                      onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`edu_${index}_gpa`] ? 'border-red-500 border' : 'border-gray-300'}`}
                      placeholder="3.75"
                    />
                    <p className="text-xs text-gray-500 mt-1">Format harus X.XX (Contoh: 3.50 atau 4.00)</p>
                    {errors[`edu_${index}_gpa`] && <p className="text-red-500 text-xs mt-1">{errors[`edu_${index}_gpa`]}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <label className="block font-medium text-gray-600 mb-1">Keahlian</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Contoh: Python, React, Leadership, Project Management, JavaScript"
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-200 focus:border-yellow-500"
            />
            <p className="text-sm text-gray-500 mt-1">Pisahkan setiap keahlian dengan koma</p>
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition duration-200 transform hover:scale-105"
            >
              🚀 Generate CV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FillData;