import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";

function PreviewCV() {
  const { state } = useLocation();
  const formData = state?.formData;
  const template = state?.template || "modern";
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formData) {
      setError("No form data provided");
      setLoading(false);
      return;
    }

    const generatePDF = async () => {
      try {
        setLoading(true);
        setError(null);

        const requestData = {
          extracted_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          summary: formData.summary,
          work_experience: formData.experience,
          education: formData.education,
          skills: formData.skills,
          template: template,
        };

        console.log("📤 Generating PDF preview...");

        const response = await axios.post(
          "http://localhost:5000/api/cv/preview",
          requestData,
          { 
            responseType: "blob",
            timeout: 45000
          }
        );

        if (response.status === 200) {
          // Create proper PDF blob URL
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          setPdfUrl(url);
          console.log("✅ PDF preview generated successfully");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
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

    generatePDF();
  }, [formData, template]);

  // Clean up URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
        <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-6xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">
            Preview & Download CV
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Generating CV Preview...</p>
              <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-red-600 font-semibold mb-4">{error}</p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                  Kembali ke Form
                </button>
              </div>
            </div>
          ) : pdfUrl ? (
            <>
              {/* PDF Preview Section - Clean Version */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Preview CV</h3>
                  <div className="text-sm text-gray-500">
                    CV {formData.name}
                  </div>
                </div>
                
                {/* Clean PDF Viewer */}
                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white mx-auto" style={{ maxWidth: '210mm', height: '297mm' }}>
                  <div className="w-full h-full">
                    <iframe 
                      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      title="CV Preview" 
                      width="100%" 
                      height="100%"
                      className="border-0"
                      style={{ 
                        minHeight: '297mm',
                        background: 'white'
                      }}
                    />
                  </div>
                </div>

                {/* Mobile warning */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-blue-700 text-sm">
                    💡 <strong>Tips:</strong> Untuk preview terbaik, pastikan browser Anda mendukung PDF viewer. 
                    Jika preview tidak tampil dengan baik, silakan download CV.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a
                    href={pdfUrl}
                    download={`CV_${formData.name.replace(/\s+/g, '_')}.pdf`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition duration-200 transform hover:scale-105 flex items-center gap-2 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download CV
                  </a>
                  
                  <button 
                    onClick={() => window.history.back()}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-md font-semibold transition duration-200 flex items-center gap-2 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Edit Data Kembali
                  </button>

                  <button 
                    onClick={() => window.open(pdfUrl, '_blank')}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-semibold transition duration-200 flex items-center gap-2 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Buka di Tab Baru
                  </button>
                </div>
                
                {/* File Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    📄 File siap didownload. Format: PDF | Ukuran: A4 | Template: {template}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-yellow-500 text-4xl mb-4">❓</div>
                <p className="text-yellow-700 font-semibold mb-4">Tidak dapat menampilkan preview</p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Kembali ke Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default PreviewCV;