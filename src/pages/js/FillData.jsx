// FillData.jsx - VERSI ASLI DENGAN FIX LOAD DATA
import React, { useState, useCallback, useEffect } from "react"; // Tambah useEffect
import axios from "axios";
import LivePreview from "./LivePreview";

// 1. Tambah prop 'initialData'
function FillData({ template, onComplete, onBack, initialData }) {
  // --- CONFIGURATION ---
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 51 }, (_, i) => currentYear + 5 - i);

  const STEPS = [
    { id: 1, label: "Personal Info" },
    { id: 2, label: "Summary" },
    { id: 3, label: "Experience" },
    { id: 4, label: "Education" },
    { id: 5, label: "Skills" },
    { id: 6, label: "Actions" } // Step baru untuk download/save
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [aiLoading, setAiLoading] = useState({ summary: false, experience: {} });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    phone: "", 
    linkedin: "", 
    portfolio: "", 
    summary: "",
    experience: [{ 
      job_title: "", 
      company_name: "", 
      start_date: "", 
      end_date: "", 
      description: "" 
    }],
    education: [{ 
      degree: "", 
      university: "", 
      graduation_year: "", 
      major: "", 
      gpa: "", 
      gpa_max: "4.00" 
    }],
    skills: [{ 
      name: "", 
      year: "", 
      elaboration: "" 
    }],
  });

  // --- 2. TAMBAHAN: USE EFFECT UNTUK LOAD DATA ---
  // Ini logika agar data tidak kosong (hanya nama) saat diload
  useEffect(() => {
    if (initialData) {
    console.log("🔄 Injecting Data to Form:", initialData);
    
    // 1. Cek apakah data terbungkus dalam properti '.data' (Smart Unwrapping)
    // Ini menangani kasus jika struktur simpanan berbeda
    let source = initialData;
    if (initialData.data && typeof initialData.data === 'object' && !Array.isArray(initialData.data)) {
        source = initialData.data;
    }

    // 2. Siapkan data array (agar tidak error jika kosong)
    const rawExp = source.experience || source.work_experience || [];
    const rawEdu = source.education || [];
    const rawSkills = source.skills || [];

    // 3. Masukkan ke State Form
    setFormData(prev => ({
      ...prev,
      // Mapping String (dengan pengecekan variasi nama key)
      name: source.name || source.extracted_name || initialData.name || "",
      email: source.email || "",
      phone: source.phone || "",
      linkedin: source.linkedin || source.linkedin_url || "", 
      portfolio: source.portfolio || source.portfolio_url || "",
      summary: source.summary || "",

      // Mapping Array: Experience
      experience: Array.isArray(rawExp) && rawExp.length > 0 
        ? rawExp.map(exp => ({
            job_title: exp.job_title || "",
            company_name: exp.company_name || exp.company || "", 
            start_date: exp.start_date || "",
            end_date: exp.end_date || "",
            description: exp.description || ""
          }))
        : [{ job_title: "", company_name: "", start_date: "", end_date: "", description: "" }], // Default jika kosong

      // Mapping Array: Education
      education: Array.isArray(rawEdu) && rawEdu.length > 0
        ? rawEdu.map(edu => ({
            degree: edu.degree || "",
            university: edu.university || "",
            graduation_year: edu.graduation_year || "",
            major: edu.major || "",
            gpa: edu.gpa || "",
            gpa_max: edu.gpa_max || "4.00"
          }))
        : [{ degree: "", university: "", graduation_year: "", major: "", gpa: "", gpa_max: "4.00" }],

      // Mapping Array: Skills
      skills: Array.isArray(rawSkills) && rawSkills.length > 0
        ? rawSkills.map(skill => ({
            name: skill.name || "",
            year: skill.year || "",
            elaboration: skill.elaboration || ""
          }))
        : [{ name: "", year: "", elaboration: "" }]
    }));
  }
}, [initialData]);

  // --- HELPER DATE ---
  const parseDate = (dateString) => {
    if (!dateString || dateString === "Present" || dateString === "Sekarang") return { month: "", year: "" };
    
    const parts = dateString.split(" ");
    
    if (parts.length >= 2) {
        return { month: parts[0], year: parts[1] };
    }
    
    if (parts.length === 1) {
        const val = parts[0];
        if (/^\d+$/.test(val)) {
            return { month: "", year: val };
        } else {
            return { month: val, year: "" };
        }
    }
    
    return { month: "", year: "" };
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleDateChange = (index, field, part, value) => {
    const updatedExperience = [...formData.experience];
    const { month, year } = parseDate(updatedExperience[index][field]);
    
    let newDateString = "";
    if (part === "month") {
        newDateString = value ? (year ? `${value} ${year}` : value) : year; 
    } else if (part === "year") {
        newDateString = value ? (month ? `${month} ${value}` : value) : month;
    }
    
    updatedExperience[index][field] = newDateString;
    setFormData({ ...formData, experience: updatedExperience });
    
    const errorKey = `exp_${index}_${field}_${part}`; 
    if (errors[errorKey]) {
        const newErrors = { ...errors };
        delete newErrors[errorKey];
        setErrors(newErrors);
    }
  };

  const handleCurrentlyWorking = (index, isChecked) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index].end_date = isChecked ? "Present" : "";
    setFormData({ ...formData, experience: updatedExperience });
    
    if (isChecked) {
        const newErrors = { ...errors };
        delete newErrors[`exp_${index}_end_date_month`];
        delete newErrors[`exp_${index}_end_date_year`];
        setErrors(newErrors);
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index][field] = value;
    setFormData({ ...formData, experience: updatedExperience });
    
    const errorKey = `exp_${index}_${field}`;
    if (errors[errorKey]) setErrors({ ...errors, [errorKey]: null });
  };

  const addExperience = () => {
    setFormData({ 
      ...formData, 
      experience: [...formData.experience, { 
        job_title: "", 
        company_name: "", 
        start_date: "", 
        end_date: "", 
        description: "" 
      }] 
    });
  };

  const removeExperience = (index) => {
    if (formData.experience.length > 1) {
      setFormData({ 
        ...formData, 
        experience: formData.experience.filter((_, i) => i !== index) 
      });
    }
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    setFormData({ ...formData, education: updatedEducation });
    
    const errorKey = field.includes('gpa') ? `edu_${index}_gpa` : `edu_${index}_${field}`;
    if (errors[errorKey]) setErrors({ ...errors, [errorKey]: null });
  };

  const addEducation = () => {
    setFormData({ 
      ...formData, 
      education: [...formData.education, { 
        degree: "", 
        university: "", 
        graduation_year: "", 
        major: "", 
        gpa: "", 
        gpa_max: "4.00" 
      }] 
    });
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      setFormData({ 
        ...formData, 
        education: formData.education.filter((_, i) => i !== index) 
      });
    }
  };

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index][field] = value;
    setFormData({ ...formData, skills: updatedSkills });
    
    const errorKey = `skill_${index}_${field}`;
    if (errors[errorKey]) setErrors({ ...errors, [errorKey]: null });
  };

  const addSkill = () => {
    setFormData({ 
      ...formData, 
      skills: [...formData.skills, { 
        name: "", 
        year: "", 
        elaboration: "" 
      }] 
    });
  };

  const removeSkill = (index) => {
    if (formData.skills.length > 1) {
        setFormData({ 
          ...formData, 
          skills: formData.skills.filter((_, i) => i !== index) 
        });
    } else {
        setFormData({ 
          ...formData, 
          skills: [{ name: "", year: "", elaboration: "" }] 
        });
    }
  };

  // --- FORMAT BULLET POINTS FUNCTION ---
  const formatBulletPoints = (text) => {
    if (!text) return "";
    
    const lines = text.split('\n');
    
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Skip baris kosong
      if (trimmedLine === '') return '';
      
      // Jika sudah ada bullet point, bersihkan
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const content = trimmedLine.substring(1).trim();
        // Hapus placeholder text
        const cleanContent = content.replace(/adasasds|ddassd|\.\.\./gi, '').trim();
        return cleanContent ? `• ${cleanContent}` : '';
      }
      
      // Hapus placeholder text
      const cleanLine = trimmedLine.replace(/adasasds|ddassd|\.\.\./gi, '').trim();
      return cleanLine ? `• ${cleanLine}` : '';
    });
    
    // Filter dan gabungkan
    return formattedLines.filter(line => line !== '').join('\n');
  };

  // --- AI PHRASING HANDLERS ---
  const handleAISummary = useCallback(async () => {
    if (!formData.summary || formData.summary.trim().length < 20) {
      setErrors(prev => ({ 
        ...prev, 
        summary: "Please enter at least 20 characters for AI enhancement" 
      }));
      return;
    }
    
    setAiLoading(prev => ({ ...prev, summary: true }));
    
    try {
      console.log("🚀 Sending AI request for summary...");
      
      const userInput = formData.summary;
      
      // Tampilkan loading state
      setFormData(prev => ({ 
        ...prev, 
        summary: "AI is enhancing your summary...\n\nPlease wait a moment." 
      }));
      
      // Try direct endpoint first
      let improvedText = "";
      try {
        const response = await axios.post(
          "http://localhost:5000/api/ai/ai-phrase",
          {
            text: userInput,
            type: "summary",
            context: {
              name: formData.name || "Candidate"
            }
          },
          { 
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success && response.data.phrased_text) {
          improvedText = response.data.phrased_text;
        } else {
          throw new Error("AI service returned no text");
        }
      } catch (apiError) {
        console.log("AI endpoint failed, using fallback:", apiError);
        // Fallback: Simple enhancement
        const keywords = userInput.toLowerCase();
        let fallback = "";
        
        if (keywords.includes("software") || keywords.includes("engineer")) {
          fallback = `• Experienced software engineer with expertise in modern technologies and agile methodologies\n• ${userInput.substring(0, 100)}...\n• Proven ability to deliver scalable solutions and improve system performance`;
        } else if (keywords.includes("manager") || keywords.includes("lead")) {
          fallback = `• Accomplished leader with demonstrated success in team management and strategic planning\n• ${userInput.substring(0, 100)}...\n• Proven track record of driving business growth and operational excellence`;
        } else {
          fallback = `• Skilled professional with expertise in delivering measurable results\n• ${userInput.substring(0, 100)}...\n• Demonstrated success in achieving key objectives and driving continuous improvement`;
        }
        
        improvedText = fallback;
      }
      
      // Format dengan bullet points
      const formattedText = formatBulletPoints(improvedText);
      setFormData(prev => ({ ...prev, summary: formattedText }));
      
      // Hapus error
      setErrors(prev => ({ ...prev, summary: null }));
      
      console.log("✅ Summary enhanced successfully");
    } catch (error) {
      console.error("❌ AI Summary Error:", error);
      
      // Basic fallback tanpa AI
      const cleanSummary = formData.summary.replace(/adasasds|ddassd|\.\.\./gi, '').trim();
      const fallback = `• Professional with expertise in relevant field\n• ${cleanSummary.substring(0, 150)}...\n• Committed to excellence and continuous improvement`;
      
      setFormData(prev => ({ ...prev, summary: fallback }));
      
      setErrors(prev => ({ 
        ...prev, 
        summary: "Enhanced with basic formatting. AI service may be unavailable." 
      }));
    } finally {
      setAiLoading(prev => ({ ...prev, summary: false }));
    }
  }, [formData.summary, formData.name]);

  const handleAIExperience = useCallback(async (index) => {
    const exp = formData.experience[index];
    if (!exp.description || exp.description.trim().length < 20) {
      setErrors(prev => ({ 
        ...prev, 
        [`exp_${index}_description`]: "Enter at least 20 characters for AI enhancement" 
      }));
      return;
    }
    
    setAiLoading(prev => ({ 
      ...prev, 
      experience: { ...prev.experience, [index]: true } 
    }));
    
    try {
      console.log(`🚀 Sending AI request for experience #${index}...`);
      
      const userInput = exp.description;
      
      // Tampilkan loading state
      const experienceWithLoading = [...formData.experience];
      experienceWithLoading[index] = {
        ...experienceWithLoading[index],
        description: "AI is enhancing your job description...\n\nPlease wait a moment."
      };
      setFormData(prev => ({ ...prev, experience: experienceWithLoading }));
      
      let improvedText = "";
      try {
        const response = await axios.post(
          "http://localhost:5000/api/ai/ai-phrase",
          {
            text: userInput,
            type: "experience",
            context: {
              job_title: exp.job_title || "",
              company: exp.company_name || ""
            }
          },
          { 
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success && response.data.phrased_text) {
          improvedText = response.data.phrased_text;
        } else {
          throw new Error("AI service returned no text");
        }
      } catch (apiError) {
        console.log("AI endpoint failed, using fallback:", apiError);
        
        // Smart fallback berdasarkan job title
        const jobTitle = exp.job_title.toLowerCase();
        let fallback = "";
        
        if (jobTitle.includes("software") || jobTitle.includes("developer")) {
          fallback = `• Developed and maintained scalable applications using modern frameworks\n• Collaborated with cross-functional teams to deliver projects on schedule\n• Implemented best practices for code quality and system performance\n• Participated in code reviews and agile development processes`;
        } else if (jobTitle.includes("manager") || jobTitle.includes("lead")) {
          fallback = `• Led and mentored team members to achieve project objectives\n• Developed and implemented strategic plans for operational improvement\n• Managed budgets and resources to optimize efficiency\n• Fostered collaborative environment to drive team success`;
        } else if (jobTitle.includes("analyst")) {
          fallback = `• Analyzed data to provide actionable insights for business decisions\n• Developed reports and dashboards to track key performance indicators\n• Collaborated with stakeholders to define requirements and deliverables\n• Implemented process improvements based on data analysis`;
        } else {
          fallback = `• Successfully executed key responsibilities with focus on measurable outcomes\n• Collaborated effectively with team members to achieve objectives\n• Implemented improvements that enhanced operational efficiency\n• Demonstrated strong problem-solving and communication skills`;
        }
        
        // Gabungkan dengan input user
        const userContent = userInput.substring(0, 100);
        improvedText = `• ${userContent}...\n${fallback}`;
      }
      
      // Format dengan bullet points
      const formattedText = formatBulletPoints(improvedText);
      
      const experienceWithAI = [...formData.experience];
      experienceWithAI[index] = {
        ...experienceWithAI[index],
        description: formattedText
      };
      setFormData(prev => ({ ...prev, experience: experienceWithAI }));
      
      // Hapus error
      setErrors(prev => ({ ...prev, [`exp_${index}_description`]: null }));
      
      console.log(`✅ Experience #${index} enhanced successfully`);
    } catch (error) {
      console.error(`❌ AI Experience Error for #${index}:`, error);
      
      // Basic fallback
      const cleanDesc = exp.description.replace(/adasasds|ddassd|\.\.\./gi, '').trim();
      const fallback = `• Successfully performed duties as ${exp.job_title || 'professional'} at ${exp.company_name || 'organization'}\n• ${cleanDesc.substring(0, 200)}...\n• Contributed to team success through dedicated effort and collaboration\n• Applied skills effectively to achieve desired outcomes`;
      
      const experienceWithFallback = [...formData.experience];
      experienceWithFallback[index] = {
        ...experienceWithFallback[index],
        description: fallback
      };
      setFormData(prev => ({ ...prev, experience: experienceWithFallback }));
    } finally {
      setAiLoading(prev => ({ 
        ...prev, 
        experience: { ...prev.experience, [index]: false } 
      }));
    }
  }, [formData.experience]);
   
  // --- VALIDATION LOGIC (UPDATED STEP 1) ---
  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      // 1. Validasi Nama: Wajib diisi & Hanya Huruf
      if (!formData.name.trim()) { 
        newErrors.name = "Full Name is required"; 
        isValid = false; 
      } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
        newErrors.name = "Name must contain only letters";
        isValid = false;
      }

      // 2. Validasi Email: Wajib diisi & Format Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) { 
        newErrors.email = "Email is required"; 
        isValid = false; 
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
        isValid = false;
      }

      // 3. Validasi Phone: Wajib diisi & Hanya Angka
      if (!formData.phone.trim()) { 
        newErrors.phone = "Phone is required"; 
        isValid = false; 
      } else if (!/^[0-9]+$/.test(formData.phone)) {
        newErrors.phone = "Phone must contain only numbers";
        isValid = false;
      }
    }

    if (step === 2) {
        if (!formData.summary || formData.summary.trim().length === 0) {
            newErrors.summary = "Professional Summary is required"; 
            isValid = false;
        } else if (formData.summary.trim().length < 20) {
            newErrors.summary = "Summary should be at least 20 characters"; 
            isValid = false;
        }
    }

    if (step === 3) {
      let isExpValid = true;
      formData.experience.forEach((exp, index) => {
          if (!exp.job_title.trim()) { 
            newErrors[`exp_${index}_job_title`] = "Required"; 
            isExpValid = false; 
          }
          if (!exp.company_name.trim()) { 
            newErrors[`exp_${index}_company_name`] = "Required"; 
            isExpValid = false; 
          }
          if (!exp.description.trim()) { 
            newErrors[`exp_${index}_description`] = "Required"; 
            isExpValid = false; 
          }

          const start = parseDate(exp.start_date);
          if (!start.month) { 
            newErrors[`exp_${index}_start_date_month`] = "Required"; 
            isExpValid = false; 
          }
          if (!start.year) { 
            newErrors[`exp_${index}_start_date_year`] = "Required"; 
            isExpValid = false; 
          }

          if (exp.end_date !== "Present") {
              const end = parseDate(exp.end_date);
              if (!end.month) { 
                newErrors[`exp_${index}_end_date_month`] = "Required"; 
                isExpValid = false; 
              }
              if (!end.year) { 
                newErrors[`exp_${index}_end_date_year`] = "Required"; 
                isExpValid = false; 
              }
          }
      });
      if (!isExpValid) isValid = false;
    }

    if (step === 4) {
      let isEduValid = true;
      formData.education.forEach((edu, index) => {
        if (!edu.degree.trim()) { 
          newErrors[`edu_${index}_degree`] = "Required"; 
          isEduValid = false; 
        }
        if (!edu.university.trim()) { 
          newErrors[`edu_${index}_university`] = "Required"; 
          isEduValid = false; 
        }
        if (!edu.major.trim()) { 
          newErrors[`edu_${index}_major`] = "Required"; 
          isEduValid = false; 
        }
        if (!edu.graduation_year) { 
          newErrors[`edu_${index}_graduation_year`] = "Required"; 
          isEduValid = false; 
        }
        
        if (!edu.gpa || edu.gpa.trim() === "") {
            newErrors[`edu_${index}_gpa`] = "Required"; 
            isEduValid = false;
        } else {
            const gpaVal = parseFloat(edu.gpa);
            const maxVal = parseFloat(edu.gpa_max || "4.00");
            
            if (isNaN(gpaVal) || isNaN(maxVal)) {
                newErrors[`edu_${index}_gpa`] = "Invalid GPA format"; 
                isEduValid = false;
            } else if (gpaVal > maxVal) {
                newErrors[`edu_${index}_gpa`] = `Maximum GPA is ${maxVal}`; 
                isEduValid = false;
            } else if (gpaVal < 0.1) {
                newErrors[`edu_${index}_gpa`] = `Minimum GPA is 0.01`; 
                isEduValid = false;
            }
        }
      });
      if (!isEduValid) isValid = false;
    }

    if (step === 5) {
        let isSkillValid = true;
        formData.skills.forEach((skill, index) => {
            if (!skill.name.trim()) { 
              newErrors[`skill_${index}_name`] = "Required"; 
              isSkillValid = false; 
            }
            if (!skill.elaboration.trim()) { 
              newErrors[`skill_${index}_elaboration`] = "Required"; 
              isSkillValid = false; 
            }
            if (!skill.year) { 
              newErrors[`skill_${index}_year`] = "Required"; 
              isSkillValid = false; 
            }
        });
        if (!isSkillValid) isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) { // Jangan validasi step 6 (Actions)
      if (validateStep(currentStep)) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  // --- HANDLER UNTUK GENERATE PDF ---
  const handleGeneratePDF = async () => {
    if (!validateStep(5)) {
      setCurrentStep(5); // Kembali ke step skills jika belum valid
      return;
    }

    setIsGeneratingPDF(true);
    setPdfError(null);

    try {
      // Bersihkan data sebelum dikirim
      const cleanFormData = {
        ...formData,
        summary: formatBulletPoints(formData.summary),
        experience: formData.experience.map(exp => ({
          ...exp,
          description: formatBulletPoints(exp.description)
        })),
        skills: formData.skills.map(skill => ({
          ...skill,
          elaboration: formatBulletPoints(skill.elaboration)
        }))
      };

      // Panggil API untuk generate PDF
      const response = await axios.post(
        "http://localhost:5000/api/cv/generate_custom",
        {
          extracted_name: cleanFormData.name,
          email: cleanFormData.email,
          phone: cleanFormData.phone,
          linkedin_url: cleanFormData.linkedin,
          portfolio_url: cleanFormData.portfolio,
          summary: cleanFormData.summary,
          work_experience: cleanFormData.experience,
          education: cleanFormData.education,
          skills: cleanFormData.skills,
          template: template,
          use_ai_phrasing: true
        },
        {
          timeout: 45000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data.success && response.data.pdf_base64) {
        // Convert base64 to blob URL
        const byteCharacters = atob(response.data.pdf_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        
        // Simpan data ke localStorage untuk nanti
        localStorage.setItem('lastGeneratedCV', JSON.stringify({
          data: cleanFormData,
          template: template,
          pdfUrl: url
        }));
        
        console.log("✅ PDF generated successfully");
      } else {
        throw new Error(response.data.error || "Failed to generate PDF");
      }
    } catch (error) {
      console.error("❌ PDF Generation Error:", error);
      setPdfError("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // --- HANDLER UNTUK SAVE CV ---
  const handleSaveCV = () => {
    if (!formData.name) {
      alert("Please enter your name before saving CV");
      return;
    }

    // Bersihkan data sebelum disimpan
    const cleanFormData = {
      ...formData,
      summary: formatBulletPoints(formData.summary),
      experience: formData.experience.map(exp => ({
        ...exp,
        description: formatBulletPoints(exp.description)
      }))
    };

    const cvData = {
      id: Date.now(),
      name: cleanFormData.name || 'Untitled CV',
      template: template,
      data: cleanFormData,
      date: new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Simpan ke localStorage
    const savedCVs = JSON.parse(localStorage.getItem('generatedCVs') || '[]');
    savedCVs.unshift(cvData);
    localStorage.setItem('generatedCVs', JSON.stringify(savedCVs));

    alert("✅ CV saved successfully! You can find it in My Resumes.");
  };

  // --- HANDLER UNTUK DOWNLOAD PDF ---
  const handleDownloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `CV_${formData.name.replace(/\s+/g, '_')}_${template}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Jika belum ada PDF, generate dulu
      handleGeneratePDF();
    }
  };

  // --- HANDLER UNTUK NEW CV ---
  const handleNewCV = () => {
    if (onBack) {
      onBack();
    }
  };

  // --- HANDLER UNTUK GENERATE FINAL ---
  const handleGenerate = () => {
    if (validateStep(currentStep)) {
      // Pindah ke step 6 (Actions)
      setCurrentStep(6);
    }
  };

  // --- RENDER LAYOUT DENGAN LIVE PREVIEW ---
  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 overflow-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* LEFT SIDE: FORM */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">
          
          {/* HEADER: Progress Bar (Sticky) */}
          <div className="pt-8 px-8 pb-6 bg-white border-b border-gray-100 flex-shrink-0 z-10 sticky top-5">
              <div className="flex justify-between items-start relative px-4">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-gray-100 -z-0 rounded-full"></div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 -z-0 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}></div>
                  {STEPS.map((step) => {
                      const isActive = step.id === currentStep;
                      const isCompleted = step.id < currentStep;
                      return (
                          <div key={step.id} className="relative z-10 flex flex-col items-center w-12 md:w-32 text-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border-2 shadow-md transition-all duration-300 ${isActive ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300 text-white scale-110" : isCompleted ? "bg-gradient-to-br from-green-500 to-green-600 border-green-300 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                                  {isCompleted ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  ) : step.id}
                              </div>
                              <span className={`mt-3 text-sm font-semibold ${isActive ? "text-blue-600" : isCompleted ? "text-gray-700" : "text-gray-400"}`}>{step.label}</span>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* CONTENT AREA (Scrollable) */}
          <div className={`flex-1 overflow-y-auto p-8 min-h-0 ${currentStep === 6 ? 'hide-scrollbar' : 'custom-scrollbar'}`}>
            {currentStep <= 5 ? (
              <form onSubmit={(e) => e.preventDefault()}>
                
                {/* STEP 1: PERSONAL INFO */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Personal Information</h3>
                      <p className="text-gray-500">Please provide your basic contact details</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                          <input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors.name ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`} 
                            placeholder="John Doe" 
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              <span className="text-lg">⚠</span> {errors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                          <input 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`} 
                            placeholder="email@example.com" 
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              <span className="text-lg">⚠</span> {errors.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone <span className="text-red-500">*</span></label>
                          <input 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            onKeyPress={(event) => {
                                if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault();
                                }
                            }}
                            className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors.phone ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`} 
                            placeholder="08123456789" 
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              <span className="text-lg">⚠</span> {errors.phone}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-400">🔗</span>
                            </div>
                            <input 
                              name="linkedin" 
                              value={formData.linkedin} 
                              onChange={handleChange} 
                              className="w-full border-2 border-gray-200 px-4 py-3 pl-10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                              placeholder="linkedin.com/in/username" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio URL</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-400">🌐</span>
                            </div>
                            <input 
                              name="portfolio" 
                              value={formData.portfolio} 
                              onChange={handleChange} 
                              className="w-full border-2 border-gray-200 px-4 py-3 pl-10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                              placeholder="myportfolio.com" 
                            />
                          </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: SUMMARY dengan tombol AI */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="mb-6">
                      <div className="flex justify-between items-center">
                        <div><h3 className="text-2xl font-bold text-gray-800 mb-2">Professional Summary</h3><p className="text-gray-500">Write a compelling summary of your professional background</p></div>
                          <button 
                            type="button" 
                            onClick={handleAISummary} 
                            disabled={aiLoading.summary} 
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px] justify-center whitespace-nowrap"
                          >
                            {aiLoading.summary ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Enhancing...</span>
                              </>
                            ) : (
                              <>
                                <span className="text-base">✨</span>
                                <span>AI Enhance</span>
                              </>
                            )}
                          </button>
                      </div>
                      {formData.summary.length > 0 && formData.summary.length < 20 && (
                        <div className="mt-2 text-amber-600 text-sm flex items-center gap-1">
                          <span>💡</span>
                          <span>Enter at least 20 characters for AI enhancement</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Summary <span className="text-red-500">*</span></label>
                      <textarea 
                        name="summary" 
                        value={formData.summary} 
                        onChange={handleChange}
                        className={`w-full border-2 px-4 py-3 rounded-xl h-48 transition-all resize-none ${errors.summary ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200'}`}
                        placeholder="Briefly describe your professional background, key achievements, and career objectives. Example: 'Experienced software engineer with 5+ years in full-stack development...'"
                      />
                      <div className="flex justify-between items-center mt-2">
                        {errors.summary ? (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <span className="text-lg">⚠</span> {errors.summary}
                          </p>
                        ) : (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <span>📝</span>
                            <span>Use bullet points (•) for better formatting</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400">{formData.summary.length}/500 characters</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: EXPERIENCE dengan tombol AI per item */}
                {currentStep === 3 && (
                   <div className="space-y-6 animate-fade-in">
                      <div className="mb-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Work Experience</h3>
                            <p className="text-gray-500">List your professional work experience</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={addExperience} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
                          >
                            <span>+</span> Add Position
                          </button>
                        </div>
                      </div>
                      {formData.experience.map((exp, index) => {
                          const startDate = parseDate(exp.start_date);
                          const endDate = parseDate(exp.end_date);
                          const isCurrentlyWorking = exp.end_date === "Present";

                          return (
                          <div key={index} className="border-2 border-gray-100 p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50/30 mb-6 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                          {index + 1}
                                      </div>
                                      <h4 className="font-bold text-gray-700 text-lg">Position #{index + 1}</h4>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {/* AI PHRASING BUTTON FOR EXPERIENCE */}
                                      <button
                                        type="button"
                                        onClick={() => handleAIExperience(index)}
                                        disabled={aiLoading.experience[index]}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[130px] justify-center"
                                      >
                                        {aiLoading.experience[index] ? (
                                          <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Enhancing...</span>
                                          </>
                                        ) : (
                                          <>
                                            <span className="text-base">✨</span>
                                            <span>AI Enhance</span>
                                          </>
                                        )}
                                      </button>
                                    {formData.experience.length > 1 && (
                                      <button 
                                        type="button" 
                                        onClick={() => removeExperience(index)} 
                                        className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition px-3 py-2 hover:bg-red-50 rounded-lg"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                        Remove
                                      </button>
                                    )}
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title <span className="text-red-500">*</span></label>
                                      <input 
                                        value={exp.job_title} 
                                        onChange={(e) => handleExperienceChange(index, 'job_title', e.target.value)}
                                        className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors[`exp_${index}_job_title`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`} 
                                        placeholder="e.g. Software Engineer" 
                                      />
                                      {errors[`exp_${index}_job_title`] && (
                                        <p className="text-red-500 text-sm mt-2">{errors[`exp_${index}_job_title`]}</p>
                                      )}
                                  </div>
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name <span className="text-red-500">*</span></label>
                                      <input 
                                        value={exp.company_name} 
                                        onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                                        className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors[`exp_${index}_company_name`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`} 
                                        placeholder="e.g. Tech Corp" 
                                      />
                                      {errors[`exp_${index}_company_name`] && (
                                        <p className="text-red-500 text-sm mt-2">{errors[`exp_${index}_company_name`]}</p>
                                      )}
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                                      <div className="flex gap-3">
                                          <select 
                                            className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors[`exp_${index}_start_date_month`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} 
                                            value={startDate.month} 
                                            onChange={(e) => handleDateChange(index, 'start_date', 'month', e.target.value)}
                                          >
                                            <option value="">Month</option>
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                          </select>
                                          <select 
                                            className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors[`exp_${index}_start_date_year`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} 
                                            value={startDate.year} 
                                            onChange={(e) => handleDateChange(index, 'start_date', 'year', e.target.value)}
                                          >
                                            <option value="">Year</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                          </select>
                                      </div>
                                      {errors[`exp_${index}_start_date_month`] && (
                                        <p className="text-red-500 text-sm mt-2">{errors[`exp_${index}_start_date_month`]}</p>
                                      )}
                                      {errors[`exp_${index}_start_date_year`] && (
                                        <p className="text-red-500 text-sm mt-2">{errors[`exp_${index}_start_date_year`]}</p>
                                      )}
                                  </div>
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Date <span className="text-red-500">*</span></label>
                                      <div className="flex gap-3 mb-3">
                                          <select 
                                            className={`w-full border-2 px-4 py-3 rounded-xl transition-all disabled:bg-gray-100 disabled:text-gray-400 ${!isCurrentlyWorking && errors[`exp_${index}_end_date_month`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} 
                                            value={isCurrentlyWorking ? "" : endDate.month} 
                                            onChange={(e) => handleDateChange(index, 'end_date', 'month', e.target.value)} 
                                            disabled={isCurrentlyWorking}
                                          >
                                            <option value="">Month</option>
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                          </select>
                                          <select 
                                            className={`w-full border-2 px-4 py-3 rounded-xl transition-all disabled:bg-gray-100 disabled:text-gray-400 ${!isCurrentlyWorking && errors[`exp_${index}_end_date_year`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} 
                                            value={isCurrentlyWorking ? "" : endDate.year} 
                                            onChange={(e) => handleDateChange(index, 'end_date', 'year', e.target.value)} 
                                            disabled={isCurrentlyWorking}
                                          >
                                            <option value="">Year</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                          </select>
                                      </div>
                                      <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
                                          <input 
                                            type="checkbox" 
                                            checked={isCurrentlyWorking} 
                                            onChange={(e) => handleCurrentlyWorking(index, e.target.checked)} 
                                            className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-blue-500" 
                                          />
                                          <span className="font-medium">I currently work here</span>
                                      </label>
                                      {!isCurrentlyWorking && errors[`exp_${index}_end_date_month`] && (
                                        <p className="text-red-500 text-sm mt-2">{errors[`exp_${index}_end_date_month`]}</p>
                                      )}
                                      {!isCurrentlyWorking && errors[`exp_${index}_end_date_year`] && (
                                        <p className="text-red-500 text-sm mt-2">{errors[`exp_${index}_end_date_year`]}</p>
                                      )}
                                  </div>
                              </div>
                              
                              <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                                  <textarea 
                                    value={exp.description} 
                                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                    className={`w-full border-2 px-4 py-3 rounded-xl h-32 transition-all resize-none ${errors[`exp_${index}_description`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`} 
                                    placeholder="Describe your responsibilities, achievements, and key projects. Use bullet points (•) for clarity. Example: '• Led development of web applications using React and Node.js\n• Improved system performance by 40% through optimization'" 
                                  />
                                  {errors[`exp_${index}_description`] && (
                                    <p className="text-red-500 text-sm mt-2">{errors[`exp_${index}_description`]}</p>
                                  )}
                                  {exp.description.length > 0 && exp.description.length < 20 && (
                                    <div className="mt-2 text-amber-600 text-sm flex items-center gap-1">
                                      <span>💡</span>
                                      <span>Enter at least 20 characters for AI enhancement</span>
                                    </div>
                                  )}
                              </div>
                          </div>
                          );
                      })}
                   </div>
                )}

                {/* STEP 4: EDUCATION */}
                {currentStep === 4 && (
                   <div className="space-y-6 animate-fade-in">
                      <div className="mb-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Education</h3>
                            <p className="text-gray-500">Add your educational background</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={addEducation} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
                          >
                            <span>+</span> Add Education
                          </button>
                        </div>
                      </div>
                      {formData.education.map((edu, index) => (
                          <div key={index} className="border-2 border-gray-100 p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50/30 mb-6 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                          {index + 1}
                                      </div>
                                      <h4 className="font-bold text-gray-700 text-lg">Education #{index + 1}</h4>
                                  </div>
                                  {formData.education.length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => removeEducation(index)} 
                                      className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition px-3 py-2 hover:bg-red-50 rounded-lg"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
                                      Remove
                                    </button>
                                  )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Degree <span className="text-red-500">*</span></label>
                                      <input 
                                        value={edu.degree} 
                                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} 
                                        className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors[`edu_${index}_degree`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`} 
                                        placeholder="Bachelor's Degree" 
                                      />
                                      {errors[`edu_${index}_degree`] && (
                                        <p className="text-red-500 text-sm mt-2">{errors[`edu_${index}_degree`]}</p>
                                      )}
                                  </div>
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">University <span className="text-red-500">*</span></label>
                                      <input 
                                        value={edu.university} 
                                        onChange={(e) => handleEducationChange(index, 'university', e.target.value)} 
                                        className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors[`edu_${index}_university`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`} 
                                        placeholder="University Name" 
                                      />
                                      {errors[`edu_${index}_university`] && (
                                        <p className="text-red-500 text-sm mt-2">{errors[`edu_${index}_university`]}</p>
                                      )}
                                  </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Graduation Year <span className="text-red-500">*</span></label>
                                      <select 
                                        value={edu.graduation_year} 
                                        onChange={(e) => handleEducationChange(index, 'graduation_year', e.target.value)} 
                                        className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors[`edu_${index}_graduation_year`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                                      >
                                          <option value="">Year</option>
                                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                                      </select>
                                      {errors[`edu_${index}_graduation_year`] && (
                                        <p className="text-red-500 text-sm mt-2">{errors[`edu_${index}_graduation_year`]}</p>
                                      )}
                                  </div>
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">Major <span className="text-red-500">*</span></label>
                                      <input 
                                        value={edu.major} 
                                        onChange={(e) => handleEducationChange(index, 'major', e.target.value)} 
                                        className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors[`edu_${index}_major`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`} 
                                        placeholder="Computer Science" 
                                      />
                                      {errors[`edu_${index}_major`] && (
                                        <p className="text-red-500 text-sm mt-2">{errors[`edu_${index}_major`]}</p>
                                      )}
                                  </div>
                              </div>
                              
                              <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                                  <label className="block text-sm font-semibold text-gray-700 mb-3">GPA / Scale <span className="text-red-500">*</span></label>
                                  <div className="flex items-center gap-4 max-w-xs mx-auto">
                                      <div className="flex-1">
                                          <input 
                                            value={edu.gpa || ''} 
                                            onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)} 
                                            placeholder="3.50" 
                                            className={`w-full border-2 px-4 py-3 rounded-xl text-center font-semibold text-lg ${errors[`edu_${index}_gpa`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} 
                                          />
                                      </div>
                                      <span className="text-gray-400 font-bold text-2xl">/</span>
                                      <div className="flex-1">
                                          <input 
                                            value={edu.gpa_max || '4.00'} 
                                            onChange={(e) => handleEducationChange(index, 'gpa_max', e.target.value)} 
                                            placeholder="4.00" 
                                            className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-center font-semibold text-lg bg-gray-50 focus:border-blue-500 focus:bg-white" 
                                          />
                                      </div>
                                  </div>
                                  {errors[`edu_${index}_gpa`] && (
                                    <p className="text-red-500 text-sm mt-3 text-center font-medium">{errors[`edu_${index}_gpa`]}</p>
                                  )}
                              </div>
                          </div>
                      ))}
                   </div>
                )}

                {/* STEP 5: SKILLS */}
                {currentStep === 5 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">Skills & Expertise</h3>
                          <p className="text-gray-500">Showcase your technical and professional skills</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={addSkill} 
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
                        >
                          <span>+</span> Add Skill
                        </button>
                      </div>
                    </div>
                    
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="border-2 border-gray-100 p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50/30 mb-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                      {index + 1}
                                  </div>
                                  <h4 className="font-bold text-gray-700 text-lg">Skill #{index + 1}</h4>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => removeSkill(index)} 
                                className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition px-3 py-2 hover:bg-red-50 rounded-lg"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                Remove
                              </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category / Name <span className="text-red-500">*</span></label>
                                  <input 
                                      value={skill.name} 
                                      onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                                      className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors[`skill_${index}_name`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                                      placeholder="E.g. Python for Data Science" 
                                  />
                                  {errors[`skill_${index}_name`] && (
                                    <p className="text-red-500 text-sm mt-2">{errors[`skill_${index}_name`]}</p>
                                  )}
                              </div>
                              <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year <span className="text-red-500">*</span></label>
                                  <select 
                                      value={skill.year} 
                                      onChange={(e) => handleSkillChange(index, 'year', e.target.value)}
                                      className={`w-full border-2 px-4 py-3 rounded-xl transition-all ${errors[`skill_${index}_year`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                                  >
                                      <option value="">Year</option>
                                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                                  </select>
                                  {errors[`skill_${index}_year`] && (
                                    <p className="text-red-500 text-sm mt-2">{errors[`skill_${index}_year`]}</p>
                                  )}
                              </div>
                          </div>
                          
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Elaboration <span className="text-red-500">*</span></label>
                              <textarea 
                                  value={skill.elaboration} 
                                  onChange={(e) => handleSkillChange(index, 'elaboration', e.target.value)}
                                  className={`w-full border-2 px-4 py-3 rounded-xl h-32 transition-all resize-none ${errors[`skill_${index}_elaboration`] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                                  placeholder="Experienced in applying Python and its core libraries (Pandas, NumPy, Scikit-learn) for data analysis and machine learning projects. Developed predictive models that improved business decision-making by 25%." 
                              />
                              {errors[`skill_${index}_elaboration`] && (
                                <p className="text-red-500 text-sm mt-2">{errors[`skill_${index}_elaboration`]}</p>
                              )}
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            ) : (
              /* STEP 6: ACTIONS (Download PDF, Save CV, New CV) */
              <div className="space-y-4 animate-fade-in">
  
              {/* Compact Header Section */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">CV Ready to Download!</h3>
                <p className="text-gray-500 text-sm">Your professional CV has been created. Choose what you want to do next.</p>
              </div>

              {/* Grid Container (Action Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
  
              {/* Compact Download PDF Card */}
              <div className="group border border-blue-100 rounded-xl p-4 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Download PDF</h4>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="w-full py-2 px-4 bg-blue-600 text-white text-xs rounded-lg font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingPDF ? "Generating..." : pdfUrl ? "Download" : "Generate"}
                  </button>
                </div>
              </div>

              {/* Compact Save CV Card */}
              <div className="group border border-green-100 rounded-xl p-4 bg-white hover:border-green-300 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Save to My CVs</h4>
                  <button
                    onClick={handleSaveCV}
                    className="w-full py-2 px-4 bg-green-600 text-white text-xs rounded-lg font-bold hover:bg-green-700 transition shadow-sm"
                  >
                    Save CV
                  </button>
                </div>
              </div>

              {/* Compact New CV Card */}
              <div className="group border border-purple-100 rounded-xl p-4 bg-white hover:border-purple-300 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Create New CV</h4>
                  <button
                    onClick={handleNewCV}
                    className="w-full py-2 px-4 bg-purple-600 text-white text-xs rounded-lg font-bold hover:bg-purple-700 transition shadow-sm"
                  >
                    New CV
                  </button>
                </div>
              </div>
            </div>

                {/* Error Message */}
                {pdfError && (
                  <div className="mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-red-700 mb-1">PDF Generation Error</h4>
                        <p className="text-red-600">{pdfError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CV Preview Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-6 ">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Your CV Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formData.name ? 1 : 0}</div>
                      <div className="text-sm text-gray-600">Personal Info</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formData.experience?.length || 0}</div>
                      <div className="text-sm text-gray-600">Experiences</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formData.education?.length || 0}</div>
                      <div className="text-sm text-gray-600">Education</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formData.skills?.length || 0}</div>
                      <div className="text-sm text-gray-600">Skills</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      Template: <span className="font-bold capitalize">{template}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER: Navigation Buttons */}
          <div className="p-6 border-t border-gray-100 bg-white/90 backdrop-blur-sm flex justify-between items-center flex-shrink-0 z-10 sticky bottom-0">
              {currentStep > 1 ? (
                  <button 
                    onClick={handlePrev} 
                    className="px-8 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition flex items-center gap-2 shadow-sm hover:shadow"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back
                  </button>
              ) : (
                  <button 
                    onClick={onBack} 
                    className="px-8 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition flex items-center gap-2 shadow-sm hover:shadow"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Templates
                  </button>
              )}

              {currentStep < STEPS.length - 1 ? (
                  <button 
                    onClick={handleNext} 
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    Continue to {STEPS[currentStep]?.label || 'Next'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
              ) : currentStep === STEPS.length - 1 ? (
                  <button 
                    onClick={handleGenerate} 
                    className="px-10 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 font-bold shadow-lg hover:shadow-xl transition transform hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Finish & Download CV
                  </button>
              ) : (
                  // Empty div untuk menjaga layout di step 6
                  <div></div>
              )}
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: LIVE PREVIEW */}
      <div className="hidden lg:block w-[50%] flex-shrink-0 h-full overflow-hidden">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full overflow-hidden">
          <LivePreview 
            formData={formData}
            template={template}
          />
        </div>
      </div>
    </div>
  );
}

export default FillData;