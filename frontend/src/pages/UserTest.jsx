import axios from "axios";
import React, { useState } from "react";
import Layout from "../components/Layout";

function UserTest() {
  const [candidateId, setCandidateId] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateCV = async () => {
    if (!candidateId.trim()) {
      alert("Masukkan Candidate ID terlebih dahulu!");
      return;
    }

    setLoading(true);
    setDownloadUrl(null);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/cv/generate/${candidateId}`,
        { responseType: "blob" }
      );

      // Buat blob object URL dari file PDF
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(fileURL);
    } catch (error) {
      console.error("Error generating CV:", error);
      alert("❌ Failed to generate CV. Check Candidate ID or connection to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
          Generate Candidate CV
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter Candidate ID"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="flex-1 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button
            onClick={handleGenerateCV}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Generating..." : "Generate CV"}
          </button>
        </div>

        {downloadUrl && (
          <>
            <div className="text-center my-4">
              <a
                href={downloadUrl}
                download={`Candidate_${candidateId}_CV.pdf`}
                className="text-blue-600 underline font-medium"
              >
                ⬇️ Download CV PDF
              </a>
            </div>

            <div className="border rounded-md overflow-hidden mt-4 shadow-inner">
              <iframe
                src={downloadUrl}
                title="CV Preview"
                width="100%"
                height="600px"
                className="border-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
    </Layout>
  );
}

export default UserTest;
