import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function CVUploadSection({ 
  onAnalysisComplete, 
  isLoading, 
  setIsLoading, 
  onNewUpload,
  uploadedFile,
  setUploadedFile 
}) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [currentEndpoint, setCurrentEndpoint] = useState('');

  // Format Astra response ke format yang diharapkan komponen
  const formatAstraResponse = (astraResponse) => {
    console.log("🔍 [FRONTEND] RAW Astra Response:", astraResponse);

    if (!astraResponse.analysis_result) {
      return formatGeneralAnalysisResponse(astraResponse);
    }

    const result = astraResponse.analysis_result;
    
    const overallScore = result.skor_akhir || 0;
    const jobReqScore = result.detail_skor?.job_requirements?.persentase || 0;
    const niceToHaveScore = result.detail_skor?.nice_to_have?.persentase || 0;
    
    const atsScore = calculateRealAtsScore(result, astraResponse.parsed_info);

    return {
        overview: {
            keyword_match: `${overallScore}%`,
            keyword_notes: `${overallScore}% match with target job requirements`
        },
        ats_check: {
            compatibility: `${atsScore}%`,
            format_check: atsScore >= 70 ? "Pass" : "Needs Improvement",
            readability: atsScore >= 65 ? "Good" : "Fair",
            section_headers: atsScore >= 60 ? "Complete" : "Incomplete",
            contact_info: astraResponse.parsed_info?.email ? "Complete" : "Incomplete",
            overall_score: atsScore,
            ats_status: getAtsStatus(atsScore)
        },
        score: {
            overall: overallScore,
            content_quality: jobReqScore,
            ats_optimization: niceToHaveScore
        },
        suggestions: generateSuggestions(result),
        job_info: astraResponse.job_info,
        parsed_info: astraResponse.parsed_info || {}
    };
  };

  const formatGeneralAnalysisResponse = (response) => {
    console.log("🔍 [FRONTEND] RAW General Response:", response);

    const matchScore = response.match_score || 0;
    const atsData = response.ats_friendliness || {};
    const atsScore = atsData.overall_score || 0;

    return {
        overview: {
            keyword_match: `${matchScore}%`,
            keyword_notes: `${matchScore}% match with job requirements`
        },
        ats_check: {
            compatibility: `${atsScore}%`,
            format_check: atsScore >= 70 ? "Pass" : "Needs Improvement",
            readability: atsScore >= 65 ? "Good" : "Fair",
            section_headers: atsData.common_sections?.experience && atsData.common_sections?.education ? "Complete" : "Incomplete",
            contact_info: atsData.contact_info?.email_found && atsData.contact_info?.phone_found ? "Complete" : "Incomplete",
            overall_score: atsScore,
            ats_status: atsData.ats_status || getAtsStatus(atsScore)
        },
        score: {
            overall: matchScore,
            content_quality: matchScore * 0.8,
            ats_optimization: atsScore
        },
        suggestions: generateSuggestionsFromKeywords(response.keyword_analysis),
        job_info: {
            nama: "General CV Analysis",
            deskripsi: "Analysis completed successfully"
        },
        parsed_info: response.parsed_info || {}
    };
  };

  const generateMockAnalysisData = (filename) => {
    console.log("🔄 Using mock analysis data");
    
    const randomScore = Math.floor(Math.random() * 40) + 50;
    const atsScore = Math.floor(Math.random() * 30) + 60;
    
    return {
        overview: {
            keyword_match: `${randomScore}%`,
            keyword_notes: `${randomScore}% match with target job requirements`
        },
        ats_check: {
            compatibility: `${atsScore}%`,
            format_check: atsScore >= 70 ? "Pass" : "Needs Improvement",
            readability: atsScore >= 65 ? "Good" : "Fair",
            section_headers: atsScore >= 60 ? "Complete" : "Partial",
            contact_info: atsScore >= 70 ? "Complete" : "Incomplete",
            overall_score: atsScore,
            ats_status: getAtsStatus(atsScore)
        },
        score: {
            overall: randomScore,
            content_quality: randomScore * 0.9,
            ats_optimization: atsScore
        },
        suggestions: [
            {
                id: 1,
                title: "Add More Technical Keywords",
                description: "Include specific technologies mentioned in job descriptions",
                priority: "medium"
            },
            {
                id: 2,
                title: "Quantify Achievements", 
                description: "Add specific numbers and metrics to your accomplishments",
                priority: "high"
            }
        ],
        job_info: {
            nama: "ERP Business Analyst Project - GSI",
            deskripsi: "Mock analysis - Real analysis service temporarily unavailable"
        },
        parsed_info: {
            name: filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
            email: "sample@email.com",
            language: "en"
        }
    };
  };

  const calculateRealAtsScore = (result, parsedInfo) => {
    let score = 0;
    
    if (result.detail_skor?.job_requirements?.persentase) {
      score += result.detail_skor.job_requirements.persentase * 0.6;
    }
    
    if (result.detail_skor?.nice_to_have?.persentase) {
      score += result.detail_skor.nice_to_have.persentase * 0.2;
    }
    
    if (parsedInfo?.email) score += 10;
    if (parsedInfo?.phone) score += 10;
    
    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const getAtsStatus = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const generateSuggestions = (result) => {
    const suggestions = [];
    
    if (result.detail_skor?.job_requirements?.persentase < 80) {
      suggestions.push({
        id: 1,
        title: "Tambah Keyword Teknis yang Relevan",
        description: "Sertakan teknologi dan tools spesifik yang disebutkan dalam deskripsi pekerjaan",
        priority: "high"
      });
    }
    
    if (result.detail_skor?.nice_to_have?.persentase < 50) {
      suggestions.push({
        id: 2,
        title: "Kuantifikasi Pencapaian",
        description: "Tambahkan angka dan metrik spesifik untuk pencapaian Anda",
        priority: "medium"
      });
    }
    
    if (!result.detail_skor?.wajib?.detail?.jurusan) {
      suggestions.push({
        id: 3,
        title: "Highlight Pendidikan yang Relevan",
        description: "Tekankan latar belakang pendidikan yang sesuai dengan requirements pekerjaan",
        priority: "high"
      });
    }

    if (suggestions.length === 0) {
      suggestions.push(
        {
          id: 1,
          title: "Optimasi untuk ATS",
          description: "Pastikan CV Anda mudah diparsing oleh Applicant Tracking Systems",
          priority: "medium"
        },
        {
          id: 2,
          title: "Skills Match", 
          description: "CV Anda menunjukkan kecocokan yang baik untuk posisi ini",
          priority: "low"
        }
      );
    }

    return suggestions;
  };

  const generateSuggestionsFromKeywords = (keywordAnalysis) => {
    if (!keywordAnalysis) return [];
    
    const suggestions = [];
    
    if (keywordAnalysis.missing_keywords && keywordAnalysis.missing_keywords.length > 0) {
      suggestions.push({
        id: 1,
        title: "Tambahkan Keyword yang Diperlukan",
        description: `Keyword yang disarankan: ${keywordAnalysis.missing_keywords.slice(0, 5).join(', ')}`,
        priority: "high"
      });
    }
    
    return suggestions.length > 0 ? suggestions : [
      {
        id: 1,
        title: "CV Analysis Complete",
        description: "Your CV has been analyzed successfully. Consider optimizing based on specific job requirements.",
        priority: "low"
      }
    ];
  };

  const analyzeWithFallback = useCallback(async (file) => {
    const endpoints = [
      {
        name: 'Astra ERP Analyst',
        url: `${API_URL}/api/astra/analyze/erp_business_analyst`,
        method: 'post'
      },
      {
        name: 'Astra Data Engineer', 
        url: `${API_URL}/api/astra/analyze/it_data_engineer`,
        method: 'post'
      },
      {
        name: 'General CV Analysis',
        url: `${API_URL}/api/jobseeker/analyze`,
        method: 'post'
      }
    ];

    const formData = new FormData();
    formData.append('cv_file', file);

    for (const endpoint of endpoints) {
      try {
        setAnalysisProgress(`Menganalisis dengan ${endpoint.name}...`);
        setCurrentEndpoint(endpoint.name);
        
        console.log(`🔄 Trying endpoint: ${endpoint.name}`);
        const response = await axios.post(endpoint.url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000
        });

        console.log(`✅ Success with ${endpoint.name}:`, response.data);
        setAnalysisProgress(`Analisis berhasil dengan ${endpoint.name}`);
        
        const analysisData = formatAstraResponse(response.data);
        return analysisData;

      } catch (error) {
        console.warn(`❌ Failed with ${endpoint.name}:`, error.response?.data || error.message);
        continue;
      }
    }

    console.warn('⚠️ All API endpoints failed, using mock data');
    setAnalysisProgress('Menggunakan data simulasi...');
    return generateMockAnalysisData(file.name);
  }, [API_URL]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setIsLoading(true);
    setAnalysisProgress('Memulai analisis...');
    setCurrentEndpoint('');

    try {
      const analysisData = await analyzeWithFallback(file);
      onAnalysisComplete(analysisData);
    } catch (error) {
      console.error('❌ Semua metode analisis gagal:', error);
      alert('Error menganalisis CV. Silakan coba lagi atau gunakan file yang berbeda.');
    } finally {
      setIsLoading(false);
      setAnalysisProgress('');
      setCurrentEndpoint('');
    }
  }, [analyzeWithFallback, onAnalysisComplete, setIsLoading, setUploadedFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#343F3E] mb-6">
          Upload Your CV
        </h2>
        
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all ${
              isDragActive 
                ? 'border-[#94B0DA] bg-[#DCEDFF]' 
                : 'border-[#8F91A2] hover:border-[#94B0DA] hover:bg-[#DCEDFF]'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl">📄</div>
              <div>
                <p className="font-semibold text-[#505A5B] text-lg mb-2">
                  Drag & drop your CV here
                </p>
                <p className="text-[#8F91A2]">or click to browse files</p>
              </div>
              <button
                type="button"
                className="mt-4 px-6 py-3 bg-[#94B0DA] text-white font-semibold rounded-lg hover:bg-[#8F91A2] transition-colors"
              >
                Choose File
              </button>
              <p className="text-sm text-[#8F91A2] mt-2">
                Supported formats: PDF, DOCX (Max 10MB)
              </p>
              <p className="text-xs text-[#94B0DA] mt-1">
                Supports Bahasa Indonesia & English CVs
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#DCEDFF] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">📄</div>
                <div>
                  <p className="font-semibold text-[#343F3E]">{uploadedFile.name}</p>
                  <p className="text-sm text-[#505A5B]">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {analysisProgress && (
                    <p className="text-sm text-[#94B0DA] mt-1">
                      {analysisProgress}
                      {currentEndpoint && (
                        <span className="text-xs text-[#8F91A2] ml-2">
                          ({currentEndpoint})
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-[#505A5B]">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#94B0DA]"></div>
                    Analyzing...
                  </div>
                ) : (
                  <button
                    onClick={onNewUpload}
                    className="px-4 py-2 bg-[#8F91A2] text-white rounded-lg hover:bg-[#505A5B] transition-colors"
                  >
                    Upload New CV
                  </button>
                )}
              </div>
            </div>
            
            {isLoading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#94B0DA] h-2 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-[#505A5B] mt-2 text-center">
                  Analyzing your CV with AI... This may take a few seconds
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CVUploadSection;