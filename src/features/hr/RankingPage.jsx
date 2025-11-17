import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

function RankingPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("match_score");

  // --- 1. STATE BARU UNTUK PAGINASI ---
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // --- 2. LOGIKA SORTING ---
  const sortedCandidates = useMemo(() => {
    const sortableCandidates = [...candidates];
    sortableCandidates.sort((a, b) => {
      if (sortBy === "match_score") {
        return (b.match_score || 0) - (a.match_score || 0);
      }
      if (sortBy === "gpa") {
        return (b.gpa || 0) - (a.gpa || 0);
      }
      if (sortBy === "total_experience") {
        return (b.total_experience || 0) - (a.total_experience || 0);
      }
      return 0;
    });
    return sortableCandidates;
  }, [candidates, sortBy]);

  // --- 3. LOGIKA PAGINASI ---
  const { paginatedCandidates, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginated = sortedCandidates.slice(startIndex, endIndex);
    const total = Math.ceil(sortedCandidates.length / rowsPerPage);
    return { paginatedCandidates: paginated, totalPages: total };
  }, [sortedCandidates, currentPage, rowsPerPage]);

  // --- 4. EVENT HANDLER ---
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleViewDetails = (candidateId) => {
    // Ganti route ini sesuai kebutuhan Anda
    navigate(`/candidate-details/${candidateId}`);
    console.log("View details for:", candidateId);
  };

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
            Candidate Ranking
          </h1>
          <p className="text-gray-600 mt-1">
            {candidates.length} qualified candidates found and ranked
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <div className="w-full">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  Candidate Rankings
                </h3>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">
                    Sort by:
                  </label>
                  <select
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="match_score">Match Score</option>
                    <option value="gpa">GPA</option>
                    <option value="total_experience">Experience</option>
                  </select>
                </div>
              </div>

              {/* --- JUDUL KOLOM --- */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase border-b">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Candidate</div>
                <div className="col-span-1 text-center">Score</div>
                <div className="col-span-2">AI Analysis</div> {/* Diubah jadi 2 */}
                <div className="col-span-2">Skills</div>
                <div className="col-span-1">Edu</div>
                <div className="col-span-1">Exp</div>
                <div className="col-span-1 text-center">Action</div> {/* Kolom Baru */}
              </div>

              {/* --- ISI DATA --- */}
              <div className="space-y-4 mt-3">
                {paginatedCandidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg hover:shadow-lg transition-shadow"
                  >
                    {/* Rank (Col 1) */}
                    <div className="col-span-1 text-center font-bold text-xl text-gray-500">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </div>

                    {/* Candidate Info (Col 3) */}
                    <div className="col-span-3 flex items-center gap-3 overflow-hidden">
                      <FaUserCircle className="text-3xl text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate" title={candidate.name}>
                          {candidate.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate" title={candidate.email}>
                          {candidate.email || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Match Score (Col 1) */}
                    <div className="col-span-1 text-center">
                      <p className="font-bold text-lg text-green-600">
                        {candidate.match_score || 0}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${candidate.match_score || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* AI Analysis (Col 2) - Disesuaikan jadi 2 kolom */}
                    <div className="col-span-2">
                      {candidate.scoring_reason ? (
                        <p className="text-xs text-gray-600 italic leading-snug line-clamp-3" title={candidate.scoring_reason}>
                          "{candidate.scoring_reason}"
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">No reasoning</p>
                      )}
                    </div>

                    {/* Skills (Col 2) */}
                    <div className="col-span-2 text-sm text-gray-700">
                      {candidate.skills && candidate.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="py-0.5 px-2 bg-blue-100 text-blue-700 rounded-full text-[10px] whitespace-nowrap"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="text-[10px] text-gray-500 self-center">
                              +{candidate.skills.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>

                    {/* Education (Col 1) */}
                    <div className="col-span-1 text-sm text-gray-700 truncate">
                      <span className="font-bold block truncate" title={candidate.education}>
                        {candidate.education || "-"}
                      </span>
                      <span className="text-xs">GPA: {candidate.gpa || "-"}</span>
                    </div>

                    {/* Experience (Col 1) */}
                    <div className="col-span-1 text-sm text-gray-700">
                      {candidate.total_experience || 0} Yrs
                    </div>

                    {/* Action Button (Col 1) - NEW */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => handleViewDetails(candidate.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors shadow-sm whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- CONTROLLER PAGINASI --- */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <label htmlFor="rowsPerPage">Rows:</label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RankingPage;