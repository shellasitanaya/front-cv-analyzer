import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

function RankingPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("match_score"); // State untuk sorting

  // --- 1. STATE BARU UNTUK PAGINASI ---
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default 10 baris

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

  // --- 2. LOGIKA SORTING (TIDAK BERUBAH) ---
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

  // --- 3. LOGIKA BARU UNTUK PAGINASI ---
  // Memo ini akan berjalan setelah sorting selesai
  const { paginatedCandidates, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    // Ambil data untuk halaman saat ini
    const paginated = sortedCandidates.slice(startIndex, endIndex);
    
    // Hitung total halaman
    const total = Math.ceil(sortedCandidates.length / rowsPerPage);
    
    return { paginatedCandidates: paginated, totalPages: total };
  }, [sortedCandidates, currentPage, rowsPerPage]);

  // --- 4. EVENT HANDLER BARU ---
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset ke halaman pertama saat ganti jumlah baris
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

              {/* ... (Judul Kolom) ... */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase border-b">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Candidate</div>
                <div className="col-span-2 text-center">Match Score</div>
                <div className="col-span-2">Skills</div>
                <div className="col-span-1">Education</div>
                <div className="col-span-2">Experience</div>
              </div>

              {/* --- 5. PERBARUI MAP UNTUK PAGINASI --- */}
              <div className="space-y-4 mt-3">
                {/* Gunakan 'paginatedCandidates' BUKAN 'sortedCandidates' */}
                {paginatedCandidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <div className="col-span-1 text-center font-bold text-xl text-gray-500">
                      {/* Perbaikan untuk Rank Number */}
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </div>
                    
                    {/* ... (Kolom Candidate) ... */}
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
                    
                    {/* ... (Kolom Match Score) ... */}
                    <div className="col-span-2 text-center">
                      <p className="font-bold text-lg text-green-600">
                        {candidate.match_score || 0}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${candidate.match_score || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* ... (Kolom Skills) ... */}
                    <div className="col-span-2 text-sm text-gray-700">
                      {candidate.skills && candidate.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 5).map((skill, i) => (
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
                    
                    {/* ... (Kolom Education & GPA) ... */}
                    <div className="col-span-1 text-sm text-gray-700">
                      <span className="font-bold">
                        {candidate.education || "N/A"}
                      </span>
                      <br />
                      GPA: {candidate.gpa || "N/A"}
                    </div>
                    
                    {/* ... (Kolom Experience) ... */}
                    <div className="col-span-2 text-sm text-gray-700">
                      {candidate.total_experience || 0} years
                    </div>
                  </div>
                ))}
              </div>

              {/* --- 6. KONTROL PAGINASI BARU --- */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t text-sm text-gray-600">
                {/* Kiri: Rows per page dropdown */}
                <div className="flex items-center gap-2">
                  <label htmlFor="rowsPerPage">Rows per page:</label>
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

                {/* Kanan: Navigasi Halaman */}
                <div className="flex items-center gap-4">
                  <span>
                    Page {currentPage} of {totalPages} (Total {candidates.length} items)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &laquo; Prev
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next &raquo;
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