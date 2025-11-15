import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// (Pastikan Anda sudah menginstall react-icons: npm install react-icons)
import { FaUserCircle } from "react-icons/fa";

function RankingPage() {
  const { jobId } = useParams(); // Ambil jobId dari URL
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/hr/jobs/${jobId}/candidates`)
      .then((response) => {
        setCandidates(response.data);
      })
      .catch((error) => console.error("Error fetching candidates:", error))
      .finally(() => setIsLoading(false));
  }, [jobId]);

  if (isLoading) {
    return <div className="p-8">Loading ranked candidates...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline mb-4"
        >
          &larr; Back to Screening
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Candidate Ranking - {candidates.job_title}
          </h1>
          <p className="text-gray-600 mt-1">
            {candidates.length} qualified candidates found and ranked by match
            score
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Kolom Filter */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              {/* Filter controls bisa ditambahkan di sini nanti */}
              <div className="space-y-4">
                <div>
                  <label className="font-semibold">GPA Range</label>
                  <input type="range" className="w-full" />
                </div>
                <div>
                  <label className="font-semibold">Required Skills</label>
                  <div className="space-y-1 mt-2">
                    <div>
                      <input type="checkbox" id="react" />
                      <label htmlFor="react" className="ml-2">
                        React
                      </label>
                    </div>
                    <div>
                      <input type="checkbox" id="js" />
                      <label htmlFor="js" className="ml-2">
                        JavaScript
                      </label>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Daftar Ranking */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  Candidate Rankings
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">
                    Sort by:
                  </label>
                  <select className="p-2 border border-gray-300 rounded-lg text-sm">
                    <option>Match Score</option>
                    <option>Experience</option>
                  </select>
                </div>
              </div>

              {/* --- TAMBAHKAN JUDUL KOLOM DI SINI --- */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase border-b">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Candidate</div>
                <div className="col-span-2 text-center">Match Score</div>
                <div className="col-span-2">Skills</div>
                <div className="col-span-1">Education</div>
                <div className="col-span-2">Experience</div>
              </div>

              <div className="space-y-4 mt-3">
                {candidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <div className="col-span-1 text-center font-bold text-xl text-gray-500">
                      {index + 1}
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <FaUserCircle className="text-4xl text-gray-400" />
                      <div>
                        <p className="font-bold text-gray-800">
                          {candidate.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {candidate.email || "email@notfound.com"}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="font-bold text-lg text-green-600">
                        {candidate.match_score}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${candidate.match_score}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="col-span-2 text-sm text-gray-700">
                      {candidate.skills && candidate.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {/* Tampilkan 3 skill pertama */}
                          {candidate.skills.slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="py-1 px-2 bg-blue-100 text-blue-700 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          No skills listed
                        </span>
                      )}
                    </div>

                    <div className="col-span-1 text-sm text-gray-700">
                      {candidate.education || "S1"} <br /> GPA: {candidate.gpa}
                    </div>
                    <div className="col-span-2 text-sm text-gray-700">
                      {candidate.total_experience || 0} years
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center items-center mt-6 space-x-2">
                {/* Pagination bisa ditambahkan di sini */}
                <button className="px-4 py-2 border rounded-lg">&laquo;</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-4 py-2 border rounded-lg">&raquo;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RankingPage;
