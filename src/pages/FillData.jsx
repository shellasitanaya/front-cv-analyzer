import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";

function FillData() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const template = state?.template || "modern";

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
        major: ""
      }
    ],
    skills: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle perubahan untuk work experience
  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index][field] = value;
    setFormData({ ...formData, experience: updatedExperience });
  };

  // Handle perubahan untuk education
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    setFormData({ ...formData, education: updatedEducation });
  };

  // Tambah pengalaman kerja baru
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

  // Tambah pendidikan baru
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          degree: "",
          university: "",
          graduation_year: "",
          major: ""
        }
      ]
    });
  };

  // Hapus pengalaman kerja
  const removeExperience = (index) => {
    if (formData.experience.length > 1) {
      const updatedExperience = formData.experience.filter((_, i) => i !== index);
      setFormData({ ...formData, experience: updatedExperience });
    }
  };

  // Hapus pendidikan
  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const updatedEducation = formData.education.filter((_, i) => i !== index);
      setFormData({ ...formData, education: updatedEducation });
    }
  };

  const handleGenerate = () => {
    if (!formData.name || !formData.email) {
      alert("Isi minimal nama dan email!");
      return;
    }
    
    // Validasi work experience - pastikan company_name diisi
    const hasEmptyCompany = formData.experience.some(exp => 
      !exp.company_name || exp.company_name.trim() === ""
    );
    
    if (hasEmptyCompany) {
      alert("Harap isi nama perusahaan untuk semua pengalaman kerja!");
      return;
    }

    // Validasi education - pastikan university diisi
    const hasEmptyUniversity = formData.education.some(edu => 
      !edu.university || edu.university.trim() === ""
    );
    
    if (hasEmptyUniversity) {
      alert("Harap isi nama universitas untuk semua pendidikan!");
      return;
    }

    // Debug: lihat data sebelum dikirim
    console.log("📤 [FRONTEND DEBUG] Form data to send:", formData);
    console.log("📤 [FRONTEND DEBUG] Work experience data:", formData.experience);
    console.log("📤 [FRONTEND DEBUG] Education data:", formData.education);

    // Validasi dan bersihkan data sebelum dikirim
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
      major: edu.major?.trim() || ""
    }));

    const validatedData = {
      ...formData,
      experience: validatedExperience,
      education: validatedEducation
    };

    console.log("✅ [FRONTEND DEBUG] Validated data being sent:", validatedData);
    
    navigate("/preview", { state: { formData: validatedData, template } });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-4xl">
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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      required
                      placeholder="email@contoh.com"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">No. Telepon</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      placeholder="081234567890"
                    />
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
              <p className="text-sm text-gray-500 mt-1">Deskripsi singkat tentang profil profesional Anda</p>
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
                      Gunakan bullet points dengan menekan Enter untuk baris baru
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
                        className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Jurusan</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                        className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-purple-200 focus:border-purple-500"
                        placeholder="Teknik Informatika"
                      />
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

            {/* Debug Info (optional) */}
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <details>
                <summary className="cursor-pointer text-sm text-gray-600">Debug Info (Untuk Development)</summary>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </details>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default FillData;