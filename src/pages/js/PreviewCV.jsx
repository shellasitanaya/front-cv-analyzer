// PreviewCV.jsx - VERSI DIPERBAIKI (SINGLE SCROLL, PROPER BULLET FORMATTING)
import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

function PreviewCV({ formData, template, onBack, onRestart, onSave }) {
  // --- CONFIGURATION ---
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 51 }, (_, i) => currentYear + 5 - i);

  const STEPS = [
    { id: 1, label: "Personal Info" },
    { id: 2, label: "Summary" },
    { id: 3, label: "Experience" },
    { id: 4, label: "Education" },
    { id: 5, label: "Skills" }
  ];

  // --- STATE ---
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editedData, setEditedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const iframeRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // --- HELPER FUNCTIONS ---
  const parseDate = (dateString) => {
    if (!dateString || dateString === "Present" || dateString === "Sekarang") return { month: "", year: "" };
    const parts = dateString.split(" ");
    if (parts.length >= 2) return { month: parts[0], year: parts[1] };
    if (parts.length === 1) return /^\d+$/.test(parts[0]) ? { month: "", year: parts[0] } : { month: parts[0], year: "" };
    return { month: "", year: "" };
  };

  const base64ToBlob = (base64, type = "application/pdf") => {
    try {
      const binStr = atob(base64);
      const len = binStr.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
      }
      return new Blob([arr], { type: type });
    } catch (err) {
      console.error("Error converting base64 to blob:", err);
      return new Blob([], { type: type });
    }
  };

  // --- ENHANCED FORMAT TEXT FUNCTION ---
  const formatTextForDisplay = (text, type = 'summary') => {
    if (!text) return '';
    
    // Clean text dari placeholder
    let cleanText = text.replace(/adasasds|ddassd|\.\.\./gi, '').trim();
    if (!cleanText) return '';
    
    console.log("Original text for formatting:", cleanText);
    
    // Split menjadi baris-baris terlebih dahulu
    const lines = cleanText.split('\n').filter(line => line.trim() !== '');
    let resultLines = [];
    
    for (let line of lines) {
      const trimmedLine = line.trim();
      
      // Normalisasi bullet point ke '• '
      let normalizedLine = trimmedLine;
      
      // Ganti semua jenis bullet ke '•'
      if (trimmedLine.match(/^[\s]*[-*+•][\s]+/)) {
        normalizedLine = trimmedLine.replace(/^[\s]*[-*+][\s]+/, '• ');
      }
      
      // Jika sudah ada bullet '•' tapi tanpa spasi
      if (trimmedLine.startsWith('•') && !trimmedLine.startsWith('• ')) {
        normalizedLine = '• ' + trimmedLine.substring(1).trim();
      }
      
      // Jika tidak ada bullet di awal, tambahkan
      if (!normalizedLine.startsWith('•')) {
        normalizedLine = '• ' + normalizedLine;
      }
      
      // Split berdasarkan titik, tanda seru, atau tanda tanya untuk kalimat terpisah
      const content = normalizedLine.substring(2); // Hapus '• '
      
      // Split menjadi kalimat-kalimat
      const sentences = content.split(/(?<=[.!?])\s+/);
      
      if (sentences.length > 1) {
        // Jika ada multiple sentences, buat masing-masing jadi bullet point
        sentences.forEach(sentence => {
          const trimmedSentence = sentence.trim();
          if (trimmedSentence && !trimmedSentence.match(/^[.!?]$/)) {
            resultLines.push(`• ${trimmedSentence}`);
          }
        });
      } else {
        // Jika hanya satu kalimat panjang
        resultLines.push(normalizedLine);
      }
    }
    
    // Gabungkan dengan newline
    const finalText = resultLines.join('\n');
    
    console.log("Formatted result:", finalText);
    return finalText;
  };

  // --- GENERATE PDF ---
  const generatePDF = useCallback(async (dataToGenerate = null, useAI = false) => {
    const data = dataToGenerate || formData;

    if (!data || !data.name || data.name.trim() === "") {
      setError("Name is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setPdfUrl(null);
    setPdfLoadError(false);

    try {
      // Format data dengan bullet points yang benar
      const cleanData = {
        ...data,
        name: (data.name || '').trim(),
        email: (data.email || '').trim(),
        phone: (data.phone || '').trim(),
        summary: formatTextForDisplay(data.summary || '', 'summary'),
        experience: data.experience?.map(exp => ({
          ...exp,
          job_title: (exp.job_title || '').trim(),
          company_name: (exp.company_name || '').trim(),
          description: formatTextForDisplay(exp.description || '', 'experience')
        })) || [],
        education: data.education || [],
        skills: data.skills || []
      };

      console.log("=== FINAL FORMATTED DATA ===");
      console.log("Summary:", cleanData.summary);
      console.log("Experience descriptions:");
      cleanData.experience.forEach((exp, idx) => {
        console.log(`Exp ${idx}:`, exp.description);
      });

      const requestData = {
        extracted_name: cleanData.name,
        email: cleanData.email,
        phone: cleanData.phone,
        linkedin_url: cleanData.linkedin || "",
        portfolio_url: cleanData.portfolio || "",
        summary: cleanData.summary,
        work_experience: cleanData.experience,
        education: cleanData.education,
        skills: cleanData.skills,
        template: template,
        use_ai_phrasing: useAI,
      };

      console.log("🚀 Sending to backend:", JSON.stringify(requestData, null, 2));

      const response = await axios.post(
        "http://localhost:5000/api/cv/generate_custom",
        requestData,
        {
          timeout: 45000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        console.log("✅ PDF Generated Successfully");

        if (response.data.pdf_base64) {
          const blob = base64ToBlob(response.data.pdf_base64);
          const url = window.URL.createObjectURL(blob);
          setPdfUrl(url);
          setProcessedData(response.data.processed_data || {});
          setLoading(false);
        } else {
          throw new Error("No PDF data received from server");
        }
      } else {
        throw new Error(response.data?.error || "Server returned unsuccessful response");
      }
    } catch (err) {
      console.error("❌ Error generating PDF:", err);

      let errorMessage = "Failed to generate CV";
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (err.message?.includes('Network Error')) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setError(errorMessage);
      setLoading(false);
    }
  }, [formData, template]);

  // Load PDF saat pertama kali
  useEffect(() => {
    if (formData && template && !pdfUrl && !loading && !isEditing) {
      console.log("🔄 Initial PDF Generation Triggered");
      generatePDF(formData, false);
    }
  }, [formData, template, generatePDF, pdfUrl, loading, isEditing]);

  // Cleanup URL saat komponen unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Handle PDF load error
  const handlePdfLoadError = () => {
    console.error("Failed to load PDF preview");
    setPdfLoadError(true);
  };

  // --- EDIT LOGIC ---
  const handleEdit = () => {
    setIsEditing(true);
    setCurrentStep(1);
    setValidationErrors({});

    const source = processedData || formData;

    const name = source.name || source.extracted_name || source.personal_info?.full_name || formData.name || "";
    const email = source.email || source.extracted_email || source.personal_info?.email || formData.email || "";
    const phone = source.phone || source.extracted_phone || source.personal_info?.phone_number || formData.phone || "";
    const linkedin = source.linkedin || source.linkedin_url || source.personal_info?.linkedin_url || formData.linkedin || "";
    const portfolio = source.portfolio || source.portfolio_url || source.personal_info?.portfolio_url || formData.portfolio || "";

    let skillsArray = [];
    const rawSkills = source.skills || source.skills_list || formData.skills || [];
    if (Array.isArray(rawSkills)) {
      skillsArray = rawSkills.map(s => ({
        name: s.name || "",
        year: s.year || "",
        elaboration: s.elaboration || s.description || ""
      }));
    } else {
      skillsArray = [{ name: "", year: "", elaboration: "" }];
    }
    if (skillsArray.length === 0) skillsArray = [{ name: "", year: "", elaboration: "" }];

    const eduArray = (source.education || source.education_text || formData.education || []).map(edu => {
      let gpa = edu.gpa_raw || edu.gpa || "";
      let gpa_max = edu.gpa_max_raw || edu.gpa_max || "4.00";
      if (String(gpa).includes("/")) {
        const parts = gpa.split("/");
        gpa = parts[0].trim();
        gpa_max = parts[1]?.trim() || "4.00";
      }
      return { ...edu, gpa, gpa_max };
    });

    setEditedData({
      name, email, phone, linkedin, portfolio,
      summary: source.summary || formData.summary || "",
      experience: source.experience || source.work_experience || formData.experience || [],
      education: eduArray,
      skills: skillsArray
    });
  };

  const handleSaveEdit = async () => {
    if (editedData && validateStep(currentStep)) {
      setPdfUrl(null);
      setError(null);
      setPdfLoadError(false);
      await generatePDF(editedData, false);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  // --- HANDLER UNTUK SAVE CV ---
  const handleSaveCV = () => {
    if (onSave && formData && pdfUrl) {
      const cvData = {
        id: Date.now(),
        name: formData.name || 'Untitled CV',
        template: template,
        data: formData,
        pdfUrl: pdfUrl,
        date: new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      onSave(cvData);

      alert("✅ CV saved successfully! You can find it in My Resumes.");
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) setValidationErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleDateChange = (index, field, part, value) => {
    const newExp = [...editedData.experience];
    const { month, year } = parseDate(newExp[index][field]);
    let newDateString = part === "month" ? (value ? (year ? `${value} ${year}` : value) : year) : (value ? (month ? `${month} ${value}` : value) : month);
    newExp[index][field] = newDateString;
    setEditedData(prev => ({ ...prev, experience: newExp }));
    if (validationErrors[`exp_${index}_${field}_${part}`]) {
      const newErr = { ...validationErrors };
      delete newErr[`exp_${index}_${field}_${part}`];
      setValidationErrors(newErr);
    }
  };

  const handleCurrentlyWorking = (index, isChecked) => {
    const newExp = [...editedData.experience];
    newExp[index].end_date = isChecked ? "Present" : "";
    setEditedData(prev => ({ ...prev, experience: newExp }));
    if (isChecked) {
      const newErr = { ...validationErrors };
      delete newErr[`exp_${index}_end_date_month`];
      delete newErr[`exp_${index}_end_date_year`];
      setValidationErrors(newErr);
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const newExp = [...editedData.experience];
    newExp[index][field] = value;
    setEditedData(prev => ({ ...prev, experience: newExp }));
    if (validationErrors[`exp_${index}_${field}`]) setValidationErrors(prev => ({ ...prev, [`exp_${index}_${field}`]: null }));
  };

  const addNewExperience = () => setEditedData(prev => ({
    ...prev,
    experience: [...prev.experience, {
      job_title: "",
      company_name: "",
      start_date: "",
      end_date: "",
      description: ""
    }]
  }));

  const removeExperience = (index) => setEditedData(prev => ({
    ...prev,
    experience: prev.experience.filter((_, i) => i !== index)
  }));

  const handleEducationChange = (index, field, value) => {
    const newEdu = [...editedData.education];
    newEdu[index][field] = value;
    setEditedData(prev => ({ ...prev, education: newEdu }));
    if (field.includes('gpa') && validationErrors[`edu_${index}_gpa`]) setValidationErrors(prev => ({ ...prev, [`edu_${index}_gpa`]: null }));
  };

  const addNewEducation = () => setEditedData(prev => ({
    ...prev,
    education: [...prev.education, {
      degree: "",
      university: "",
      graduation_year: "",
      major: "",
      gpa: "",
      gpa_max: "4.00"
    }]
  }));

  const removeEducation = (index) => setEditedData(prev => ({
    ...prev,
    education: prev.education.filter((_, i) => i !== index)
  }));

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...editedData.skills];
    updatedSkills[index][field] = value;
    setEditedData(prev => ({ ...prev, skills: updatedSkills }));
    if (validationErrors[`skill_${index}_${field}`]) setValidationErrors(prev => ({ ...prev, [`skill_${index}_${field}`]: null }));
  };

  const addSkill = () => setEditedData(prev => ({
    ...prev,
    skills: [...prev.skills, {
      name: "",
      year: "",
      elaboration: ""
    }]
  }));

  const removeSkill = (index) => setEditedData(prev => ({
    ...prev,
    skills: prev.skills.filter((_, i) => i !== index)
  }));

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!editedData.name?.trim()) { newErrors.name = "Required"; isValid = false; }
      if (!editedData.email?.trim()) { newErrors.email = "Required"; isValid = false; }
    }

    if (step === 2 && (!editedData.summary || editedData.summary.trim().length === 0)) {
      newErrors.summary = "Required"; isValid = false;
    }

    if (step === 3) {
      editedData.experience.forEach((exp, index) => {
        if (!exp.job_title?.trim()) { newErrors[`exp_${index}_job_title`] = "Required"; isValid = false; }
        if (!exp.company_name?.trim()) { newErrors[`exp_${index}_company_name`] = "Required"; isValid = false; }
        if (!exp.description?.trim()) { newErrors[`exp_${index}_description`] = "Required"; isValid = false; }
        const start = parseDate(exp.start_date);
        if (!start.month) { newErrors[`exp_${index}_start_date_month`] = "Req"; isValid = false; }
        if (!start.year) { newErrors[`exp_${index}_start_date_year`] = "Req"; isValid = false; }
        if (exp.end_date !== "Present") {
          const end = parseDate(exp.end_date);
          if (!end.month) { newErrors[`exp_${index}_end_date_month`] = "Req"; isValid = false; }
          if (!end.year) { newErrors[`exp_${index}_end_date_year`] = "Req"; isValid = false; }
        }
      });
    }

    if (step === 4) {
      editedData.education.forEach((edu, index) => {
        if (!edu.degree?.trim()) { newErrors[`edu_${index}_degree`] = "Required"; isValid = false; }
        if (!edu.university?.trim()) { newErrors[`edu_${index}_university`] = "Required"; isValid = false; }
        if (!edu.major?.trim()) { newErrors[`edu_${index}_major`] = "Required"; isValid = false; }
        if (!edu.graduation_year) { newErrors[`edu_${index}_graduation_year`] = "Required"; isValid = false; }
        if (!edu.gpa || edu.gpa.trim() === "") { newErrors[`edu_${index}_gpa`] = "Required"; isValid = false; }
        else {
          const val = parseFloat(edu.gpa);
          const max = parseFloat(edu.gpa_max || "4.00");
          if (isNaN(val) || isNaN(max)) { newErrors[`edu_${index}_gpa`] = "Invalid"; isValid = false; }
          else if (val > max) { newErrors[`edu_${index}_gpa`] = `Max ${max}`; isValid = false; }
        }
      });
    }

    if (step === 5) {
      editedData.skills.forEach((skill, index) => {
        if (!skill.name?.trim()) { newErrors[`skill_${index}_name`] = "Required"; isValid = false; }
        if (!skill.elaboration?.trim()) { newErrors[`skill_${index}_elaboration`] = "Required"; isValid = false; }
        if (!skill.year) { newErrors[`skill_${index}_year`] = "Required"; isValid = false; }
      });
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => setCurrentStep(prev => prev - 1);

  // --- RENDER ---
  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">

        {/* LOADING */}
        {loading && (
          <div className="flex-1 flex flex-col justify-center items-center p-12">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-blue-100"></div>
              <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Creating Your Professional CV</h3>
            <p className="text-gray-500 max-w-md text-center">
              Formatting your content with proper bullet points...
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="flex-1 flex flex-col justify-center items-center p-12">
            <div className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200 rounded-2xl p-10 text-center max-w-lg shadow-lg">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-3">Generation Failed</h3>
              <p className="text-red-500 mb-8">{error}</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => generatePDF()} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-md">
                  Try Again
                </button>
                <button onClick={onBack} className="border-2 border-gray-300 text-gray-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
                  Back to Form
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODE */}
        {!loading && !error && isEditing && editedData && (
          <>
            {/* Header - Sticky */}
            <div className="pt-8 px-8 pb-6 bg-white border-b border-gray-100 z-10 flex-shrink-0 sticky top-0">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Edit CV Data</h3>
                <p className="text-gray-500">Make changes to your CV information</p>
              </div>
              <div className="flex justify-between items-center relative px-4">
                <div className="absolute left-0 top-1/2 w-full h-1.5 bg-gray-100 -z-10 rounded-full"></div>
                <div className="absolute left-0 top-1/2 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 -z-0 rounded-full transition-all duration-500" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}></div>
                {STEPS.map((step) => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center bg-white px-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border-2 ${step.id === currentStep ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300 text-white scale-110" : step.id < currentStep ? "bg-gradient-to-br from-green-500 to-green-600 border-green-300 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                      {step.id < currentStep ? "✓" : step.id}
                    </div>
                    <span className="mt-3 text-xs font-semibold text-gray-600">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 min-h-0">
              <form onSubmit={(e) => e.preventDefault()} className="max-w-3xl mx-auto">
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        value={editedData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className={`w-full border-2 px-4 py-3 rounded-xl ${validationErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
                      />
                      {validationErrors.name && <p className="text-red-500 text-sm mt-2">{validationErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        value={editedData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className={`w-full border-2 px-4 py-3 rounded-xl ${validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
                      />
                      {validationErrors.email && <p className="text-red-500 text-sm mt-2">{validationErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                      <input
                        value={editedData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="w-full border-2 px-4 py-3 rounded-xl border-gray-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                      <input
                        value={editedData.linkedin}
                        onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                        className="w-full border-2 px-4 py-3 rounded-xl border-gray-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio URL</label>
                      <input
                        value={editedData.portfolio}
                        onChange={(e) => handleFieldChange('portfolio', e.target.value)}
                        className="w-full border-2 px-4 py-3 rounded-xl border-gray-200 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Summary *</label>
                    <textarea
                      value={editedData.summary}
                      rows={8}
                      onChange={(e) => handleFieldChange('summary', e.target.value)}
                      className={`w-full border-2 px-4 py-3 rounded-xl ${validationErrors.summary ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-green-500'}`}
                      placeholder="Contoh: 
• Memiliki pengalaman 3 tahun di bidang pengembangan web
• Berpengalaman dengan React.js dan Node.js
• Pernah memimpin tim pengembang sebanyak 5 orang"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Tips: Pastikan setiap kalimat diawali dengan bullet (•) dan berada di baris baru.
                    </p>
                    {validationErrors.summary && <p className="text-red-500 text-sm mt-2">{validationErrors.summary}</p>}
                  </div>
                )}

                {/* STEP 3 - EXPERIENCE */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-bold text-gray-800">Work Experience</h4>
                      <button onClick={addNewExperience} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                        <span>+</span> Add Position
                      </button>
                    </div>
                    {editedData.experience?.map((exp, idx) => {
                      const startDate = parseDate(exp.start_date);
                      const endDate = parseDate(exp.end_date);
                      const isWorking = exp.end_date === "Present";
                      return (
                        <div key={idx} className="border-2 border-gray-100 p-6 rounded-2xl bg-blue-50/20 mb-6">
                          <div className="flex justify-end mb-4">
                            <button onClick={() => removeExperience(idx)} className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                              <input
                                value={exp.job_title}
                                onChange={(e) => handleExperienceChange(idx, 'job_title', e.target.value)}
                                className={`w-full border-2 px-4 py-2 rounded-lg ${validationErrors[`exp_${idx}_job_title`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Company *</label>
                              <input
                                value={exp.company_name}
                                onChange={(e) => handleExperienceChange(idx, 'company_name', e.target.value)}
                                className={`w-full border-2 px-4 py-2 rounded-lg ${validationErrors[`exp_${idx}_company_name`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                              <div className="flex gap-2">
                                <select
                                  value={startDate.month}
                                  onChange={(e) => handleDateChange(idx, 'start_date', 'month', e.target.value)}
                                  className={`w-full border px-3 py-2 rounded-lg ${validationErrors[`exp_${idx}_start_date_month`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                >
                                  <option value="">Month</option>
                                  {months.map(m => <option key={m}>{m}</option>)}
                                </select>
                                <select
                                  value={startDate.year}
                                  onChange={(e) => handleDateChange(idx, 'start_date', 'year', e.target.value)}
                                  className={`w-full border px-3 py-2 rounded-lg ${validationErrors[`exp_${idx}_start_date_year`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                >
                                  <option value="">Year</option>
                                  {years.map(y => <option key={y}>{y}</option>)}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                              <div className="flex gap-2 mb-2">
                                <select
                                  disabled={isWorking}
                                  value={isWorking ? "" : endDate.month}
                                  onChange={(e) => handleDateChange(idx, 'end_date', 'month', e.target.value)}
                                  className={`w-full border px-3 py-2 rounded-lg disabled:bg-gray-100 ${!isWorking && validationErrors[`exp_${idx}_end_date_month`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                >
                                  <option value="">Month</option>
                                  {months.map(m => <option key={m}>{m}</option>)}
                                </select>
                                <select
                                  disabled={isWorking}
                                  value={isWorking ? "" : endDate.year}
                                  onChange={(e) => handleDateChange(idx, 'end_date', 'year', e.target.value)}
                                  className={`w-full border px-3 py-2 rounded-lg disabled:bg-gray-100 ${!isWorking && validationErrors[`exp_${idx}_end_date_year`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                >
                                  <option value="">Year</option>
                                  {years.map(y => <option key={y}>{y}</option>)}
                                </select>
                              </div>
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isWorking}
                                  onChange={(e) => handleCurrentlyWorking(idx, e.target.checked)}
                                  className="w-4 h-4"
                                />
                                Currently working here
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                              className={`w-full border-2 px-4 py-2 rounded-lg h-32 ${validationErrors[`exp_${idx}_description`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                              placeholder="Contoh: 
• Mengembangkan aplikasi web menggunakan React.js dan Node.js
• Memimpin tim pengembang sebanyak 5 orang
• Meningkatkan performa aplikasi sebesar 40%"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Tips: Pastikan setiap kalimat diawali dengan bullet (•) dan berada di baris baru.
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* STEP 4 - EDUCATION */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-bold text-gray-800">Education</h4>
                      <button onClick={addNewEducation} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2">
                        <span>+</span> Add Education
                      </button>
                    </div>
                    {editedData.education?.map((edu, idx) => (
                      <div key={idx} className="border-2 border-gray-100 p-6 rounded-2xl bg-purple-50/20 mb-6">
                        <div className="flex justify-end mb-4">
                          <button onClick={() => removeEducation(idx)} className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Degree *</label>
                            <input
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                              className={`w-full border-2 px-4 py-2 rounded-lg ${validationErrors[`edu_${idx}_degree`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">University *</label>
                            <input
                              value={edu.university}
                              onChange={(e) => handleEducationChange(idx, 'university', e.target.value)}
                              className={`w-full border-2 px-4 py-2 rounded-lg ${validationErrors[`edu_${idx}_university`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Grad Year *</label>
                            <select
                              value={edu.graduation_year}
                              onChange={(e) => handleEducationChange(idx, 'graduation_year', e.target.value)}
                              className={`w-full border-2 px-4 py-2 rounded-lg ${validationErrors[`edu_${idx}_graduation_year`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            >
                              <option value="">Year</option>
                              {years.map(y => <option key={y}>{y}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Major *</label>
                            <input
                              value={edu.major}
                              onChange={(e) => handleEducationChange(idx, 'major', e.target.value)}
                              className={`w-full border-2 px-4 py-2 rounded-lg ${validationErrors[`edu_${idx}_major`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            />
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">GPA / Scale *</label>
                          <div className="flex gap-3 items-center max-w-xs mx-auto">
                            <input
                              value={edu.gpa}
                              onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)}
                              className={`w-24 border-2 px-4 py-2 rounded-lg text-center font-semibold ${validationErrors[`edu_${idx}_gpa`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                              placeholder="3.50"
                            />
                            <span className="text-gray-400 font-bold text-xl">/</span>
                            <input
                              value={edu.gpa_max}
                              onChange={(e) => handleEducationChange(idx, 'gpa_max', e.target.value)}
                              className="w-24 border-2 px-4 py-2 rounded-lg text-center font-semibold bg-gray-50 border-gray-200"
                              placeholder="4.00"
                            />
                          </div>
                          {validationErrors[`edu_${idx}_gpa`] && <p className="text-red-500 text-sm mt-3 text-center">{validationErrors[`edu_${idx}_gpa`]}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 5 - SKILLS */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-bold text-gray-800">Skills</h4>
                      <button onClick={addSkill} className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center gap-2">
                        <span>+</span> Add Skill
                      </button>
                    </div>
                    {editedData.skills?.map((skill, idx) => (
                      <div key={idx} className="border-2 border-gray-100 p-6 rounded-2xl bg-yellow-50/20 mb-6">
                        <div className="flex justify-end mb-4">
                          <button onClick={() => removeSkill(idx)} className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Skill Name *</label>
                            <input
                              value={skill.name}
                              onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                              className={`w-full border-2 px-4 py-2 rounded-lg ${validationErrors[`skill_${idx}_name`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                            <select
                              value={skill.year}
                              onChange={(e) => handleSkillChange(idx, 'year', e.target.value)}
                              className={`w-full border-2 px-4 py-2 rounded-lg ${validationErrors[`skill_${idx}_year`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            >
                              <option value="">Year</option>
                              {years.map(y => <option key={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Elaboration *</label>
                          <textarea
                            value={skill.elaboration}
                            onChange={(e) => handleSkillChange(idx, 'elaboration', e.target.value)}
                            className={`w-full border-2 px-4 py-2 rounded-lg h-24 ${validationErrors[`skill_${idx}_elaboration`] ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            placeholder="Contoh: 
• Berpengalaman membuat REST API dengan Node.js
• Menggunakan React.js untuk membangun UI yang responsif
• Terbiasa dengan state management menggunakan Redux"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Tips: Pastikan setiap kalimat diawali dengan bullet (•) dan berada di baris baru.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-gray-100 bg-white/90 backdrop-blur-sm flex justify-between flex-shrink-0 sticky bottom-0">
              {currentStep > 1 ?
                <button onClick={handlePrev} className="px-8 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition">Back</button>
                :
                <button onClick={handleCancelEdit} className="px-8 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition">Cancel</button>
              }
              {currentStep < STEPS.length ?
                <button onClick={handleNext} className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 font-semibold transition">Next</button>
                :
                <button onClick={handleSaveEdit} className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 font-bold transition">Save Changes</button>
              }
            </div>
          </>
        )}

        {/* PREVIEW MODE - SINGLE SCROLL CONTAINER */}
        {!loading && !error && !isEditing && pdfUrl && (
          <div className="h-full flex flex-col">
            {/* Simple Header */}
            <div className="p-4 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">CV Preview</h3>
                  <p className="text-sm text-gray-500">Scroll to see all content</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Template:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-semibold capitalize">{template}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Preview Container - FULL PAGE SCROLL */}
            {pdfLoadError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">PDF Preview Unavailable</h3>
                  <p className="text-gray-600 mb-4">Please download the PDF to view your CV</p>
                  <a
                    href={pdfUrl}
                    download={`CV_${formData?.name?.replace(/\s+/g, '_') || 'MyCV'}.pdf`}
                    className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Download PDF
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-hidden">
                {/* FULL PAGE SCROLL CONTAINER - Mengisi seluruh tinggi */}
                <div 
                  ref={scrollContainerRef}
                  className="h-full w-full overflow-y-auto"
                  style={{ 
                    height: 'calc(100vh - 180px)', // Adjust berdasarkan header + footer
                  }}
                >
                  {/* PDF Container dengan tinggi otomatis */}
                  <div className="min-h-full w-full flex items-start justify-center p-4">
                    {/* Gunakan object tag untuk kontrol lebih baik */}
                    <object
                      data={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                      type="application/pdf"
                      className="w-full max-w-4xl min-h-[800px] shadow-2xl rounded-lg border-0"
                      title="CV Preview"
                      onError={handlePdfLoadError}
                      style={{
                        display: 'block',
                        margin: '0 auto',
                        height: 'auto',
                        minHeight: '800px',
                        width: '100%'
                      }}
                    >
                      <div className="text-center p-8">
                        <p className="text-gray-600 mb-4">Your browser doesn't support PDF preview.</p>
                        <a
                          href={pdfUrl}
                          download={`CV_${formData?.name?.replace(/\s+/g, '_') || 'MyCV'}.pdf`}
                          className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                        >
                          Download PDF
                        </a>
                      </div>
                    </object>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Simple */}
            <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a
                  href={pdfUrl}
                  download={`CV_${formData?.name?.replace(/\s+/g, '_') || 'MyCV'}.pdf`}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download PDF
                </a>

                <button
                  onClick={handleSaveCV}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Save CV
                </button>

                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-amber-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit Data
                </button>

                <button
                  onClick={onRestart}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  New CV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NO DATA STATE */}
        {!loading && !error && !isEditing && !pdfUrl && formData && template && (
          <div className="flex-1 flex flex-col justify-center items-center p-12">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Ready to Generate CV</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Your CV will be formatted with proper bullet points for better readability.
              </p>
              <button
                onClick={() => generatePDF()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition"
              >
                Generate CV Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewCV;