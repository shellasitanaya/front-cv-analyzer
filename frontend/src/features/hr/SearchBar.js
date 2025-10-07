// src/components/SearchBar.js
import React, { useState } from "react";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";
import CandidateCard from "./CandidateCard"; 


function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setHasSearched(true);
      console.log("API URL:", process.env.REACT_APP_API_URL);

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/hr/candidates/search?q=${query}`
      );

      console.log("API Response:", res.data);
      const sortedResults = (res.data.data || []).sort(
        (a, b) => b.match_score - a.match_score
      );

      setResults(sortedResults);
      setHasSearched(true);
      setSortOrder("desc");
    } catch (err) {
      console.error("Error:", err);
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortToggle = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    const sorted = [...results].sort((a, b) =>
      newOrder === "asc" ? a.match_score - b.match_score : b.match_score - a.match_score
    );
    setResults(sorted);
    setSortOrder(newOrder);
  };

  return (
    <div className="p-4 w-full max-w-4xl mx-auto">
      {/* Input Pencarian */}
      <div className="flex items-center mb-6 gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Cari skill, nama, atau kriteria lain..."
          className="border rounded-md p-2 flex-1 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {isLoading ? 'Mencari...' : 'Cari'}
        </button>
      </div>

      {/* Header Hasil & Tombol Sort */}
      {results.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-300">
            Ditemukan {results.length} kandidat
          </h3>
          <button
            onClick={handleSortToggle}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition"
          >
            Urutkan Match Score
            <ArrowUpDown size={16} />
          </button>
        </div>
      )}

      {/* Daftar Hasil Pencarian */}
      <div className="space-y-4">
        {isLoading ? (
            <p className="text-center text-gray-500">Loading candidates...</p>
        ) : hasSearched && results.length > 0 ? (
          results.map((candidate, index) => (
            <CandidateCard key={candidate.id || index} candidate={candidate} />
          ))
        ) : hasSearched && results.length === 0 ? (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-inner text-center">
            <p className="text-gray-600">
              Tidak ada kandidat ditemukan. Coba kata kunci atau kriteria lain. 🔍
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SearchBar;
