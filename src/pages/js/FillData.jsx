import React, { useState } from "react";
// Layout dihapus agar tidak double layout

function FillData({ template, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
    experience: [
      {
        job_title: "",
        company_name: "",
        start_date: "",
        end_date: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
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
    
    // Clear specific array error
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
        {
          job_title: "",
          company_name: "",
          start_date: "",
          end_date: "",
          description: ""
        }
      ]
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          degree: "",
          university: "",
          graduation_year: "",
          major: "",
          gpa: ""
        }
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
      
      // Clean up errors for removed item (optional simplification)
      setErrors({}); 
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // 1. Validasi Nama (Hanya Huruf)
    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = "Nama harus berupa huruf (tidak boleh angka/simbol)";
      isValid = false;
    }

    // 2. Validasi Email (Format Email)
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
      isValid = false;
    }

    // 3. Validasi No. Telepon (Hanya Angka)
    if (formData.phone && !/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Nomor telepon harus berupa angka";
      isValid = false;
    }

    // 4. Validasi Pengalaman Kerja (Cek kekosongan dasar saja, konten "bebas")
    const hasEmptyCompany = formData.experience.some(exp => 
      !exp.company_name || exp.company_name.trim() === ""
    );
    if (hasEmptyCompany) {
      alert("Harap isi nama perusahaan untuk semua pengalaman kerja!");
      isValid = false;
    }

    // 5. Validasi Pendidikan
    formData.education.forEach((edu, index) => {
      // Cek Universitas kosong
      if (!edu.university || edu.university.trim() === "") {
        alert(`Harap isi nama universitas untuk pendidikan ke-${index + 1}!`);
        isValid = false;
      }

      // Tahun Lulus (Hanya Angka)
      if (edu.graduation_year && !/^\d+$/.test(edu.graduation_year)) {
        newErrors[`edu_${index}_graduation_year`] = "Tahun harus berupa angka";
        isValid = false;
      }

      // Jurusan (Hanya Huruf)
      if (edu.major && !/^[a-zA-Z\s]+$/.test(edu.major)) {
        newErrors[`edu_${index}_major`] = "Jurusan harus berupa huruf";
        isValid = false;
      }

      // IPK (Format 4.00 atau 3.99)
      if (edu.gpa) {
        // Regex: Angka 0-3 diikuti . dua digit ATAU angka 4 diikuti .00
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
      const validatedExperience = formData.experience.map(exp => ({
        job_title: exp.job_title?.trim() || "",
        company_name: exp.company_name?.trim() || "",
        start_date: exp.start_date?.trim() || "",
        end_date: exp.end_date?.trim() || "",
        description: exp.description?.trim() || ""
      }));

      const validatedEducation = formData.education.map(edu => ({
        degree: edu.degree?.trim() || "",
        university: edu.university?.trim() || "",
        graduation_year: edu.graduation_year?.trim() || "",
        major: edu.major?.trim() || "",
        gpa: edu.gpa?.trim() || ""
      }));

      const validatedData = {
        ...formData,
        experience: validatedExperience,
        education: validatedEducation
      };

      onComplete(validatedData);
    } else {
      // Optional: Scroll to top or alert user generally
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

          {/* Work Experience Section */}
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
            
            {formData.experience.map((exp, index) => (
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tanggal Mulai</label>
                    <input
                      type="text"
                      value={exp.start_date}
                      onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                      className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-200 focus:border-orange-500"
                      placeholder="Jan 2020"
                    />
                    <p className="text-xs text-gray-500 mt-1">Contoh: Jan 2020</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tanggal Selesai</label>
                    <input
                      type="text"
                      value={exp.end_date}
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
            ))}
          </div>

          {/* Education Section */}
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
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tahun Lulus</label>
                    <input
                      type="text"
                      value={edu.graduation_year}
                      onChange={(e) => handleEducationChange(index, 'graduation_year', e.target.value)}
                      className={`w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500 ${errors[`edu_${index}_graduation_year`] ? 'border-red-500' : ''}`}
                      placeholder="2020"
                    />
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

          {/* Debug Info telah dihapus sesuai permintaan */}
        </form>
      </div>
    </div>
  );
}

export default FillData;