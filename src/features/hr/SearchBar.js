// src/components/SearchBar.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ArrowUpDown, X, Check } from "lucide-react";
import CandidateCard from "./CandidateCard"; 

// Daftar role keys yang lengkap
const ROLE_KEYS = [
  'web development', 'web dev', 'frontend', 'web developer',
  'software engineer', 'soft eng', 'swe', 'backend', 'software developer',
  'business analyst', 'ba', 'bi analyst',
  'data scientist', 'data science', 'ds',
  'mobile developer', 'mobile dev', 'android dev', 'ios dev'
];

// Fungsi fuzzy matching yang diperbaiki
const findClosestRole = (input) => {
  const inputLower = input.toLowerCase().trim();
  
  if (!inputLower) {
    return null;
  }

  if (ROLE_KEYS.includes(inputLower)) {
    return inputLower;
  }

  let bestMatch = null;
  let bestScore = 0;

  ROLE_KEYS.forEach(role => {
    if (inputLower.length < 3) {
      return;
    }

    let score = 0;
    
    const inputWords = inputLower.split(/\s+/);
    const roleWords = role.split(/\s+/);
    
    const exactMatches = inputWords.filter(inputWord => 
      roleWords.some(roleWord => roleWord === inputWord)
    ).length;
    
    if (exactMatches > 0) {
      score = 0.6 + (exactMatches / Math.max(inputWords.length, roleWords.length)) * 0.4;
    }
    
    if (inputLower.length >= 3) {
      if (role.includes(inputLower)) {
        const substringScore = 0.7 + (inputLower.length / role.length) * 0.3;
        score = Math.max(score, substringScore);
      }
      
      if (inputLower.includes(role) && role.length >= 3) {
        const containsScore = 0.8 + (role.length / inputLower.length) * 0.2;
        score = Math.max(score, containsScore);
      }
    }
    
    const partialMatches = inputWords.filter(inputWord => 
      roleWords.some(roleWord => 
        roleWord.startsWith(inputWord) || 
        inputWord.startsWith(roleWord) ||
        (inputWord.length >= 3 && roleWord.includes(inputWord)) ||
        (roleWord.length >= 3 && inputWord.includes(roleWord))
      )
    ).length;
    
    const partialScore = (partialMatches / Math.max(inputWords.length, roleWords.length)) * 0.8;
    score = Math.max(score, partialScore);
    
    if (score > bestScore && score > 0.6) {
      bestScore = score;
      bestMatch = role;
    }
  });

  console.log(`🔍 Fuzzy match: "${input}" → "${bestMatch}" (score: ${bestScore})`);
  return bestMatch;
};

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [correctedQuery, setCorrectedQuery] = useState(null);
  
  // State baru untuk autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch suggestions dari API
  const fetchSuggestions = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/skills/autocomplete?q=${encodeURIComponent(searchTerm)}`
      );
      setSuggestions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle input change dengan debounce untuk suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && !selectedSkills.some(skill => skill.name.toLowerCase() === query.toLowerCase())) {
        fetchSuggestions(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside untuk menutup suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current && 
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fungsi untuk menambah skill yang dipilih
  const handleAddSkill = (skill) => {
    if (!selectedSkills.some(s => s.id === skill.id)) {
      setSelectedSkills(prev => [...prev, skill]);
      setQuery("");
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Fungsi untuk menghapus skill yang dipilih
  const handleRemoveSkill = (skillId) => {
    setSelectedSkills(prev => prev.filter(skill => skill.id !== skillId));
  };

  // Fungsi untuk menghapus semua skill
  const handleClearAllSkills = () => {
    setSelectedSkills([]);
  };

  // Fungsi untuk mengecek apakah query adalah role
  const isRoleSearch = (searchQuery) => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    return ROLE_KEYS.includes(normalizedQuery);
  };

  // Fungsi untuk mengecek apakah query mengandung multiple skills
  const isMultipleSkillSearch = (searchQuery) => {
    if (correctedQuery) return false;
    
    const terms = searchQuery.split(/[,\s]+/).filter(term => term.trim().length > 0);
    return terms.length > 1 && !isRoleSearch(searchQuery);
  };

  // Fungsi untuk mengecek apakah ini role search berdasarkan hasil
  const isRoleSearchResult = () => {
    return results.length > 0 && results[0].total_searched_skills === 1 && results[0].matched_skills_count === 1;
  };

  const handleSearch = async () => {
    try {
      // Jika ada selected skills, gabungkan dengan query
      let searchQuery = query;
      if (selectedSkills.length > 0) {
        const skillNames = selectedSkills.map(skill => skill.name);
        if (query.trim()) {
          skillNames.push(query.trim());
        }
        searchQuery = skillNames.join(' ');
      }

      // Jika search query kosong setelah gabungan
      if (!searchQuery.trim()) {
        setResults([]);
        setHasSearched(true);
        setCorrectedQuery(null);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      setCorrectedQuery(null);
      
      console.log("🔍 Original query:", searchQuery);

      // Cari koreksi untuk query
      const closestRole = findClosestRole(searchQuery);
      
      if (closestRole && closestRole !== searchQuery.toLowerCase()) {
        console.log("🎯 Corrected query:", closestRole);
        searchQuery = closestRole;
        setCorrectedQuery(closestRole);
      }

      console.log("API URL:", process.env.REACT_APP_API_URL);

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/hr/candidates/search?q=${encodeURIComponent(searchQuery)}`
      );

      console.log("✅ API Data:", res.data);
      
      setResults(res.data.data || []);
      setHasSearched(true);
      
    } catch (err) {
      console.error("❌ Search Error:", err);
      console.error("Error details:", err.response?.data);
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

  // Reset corrected query ketika user mengubah input
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (correctedQuery) {
      setCorrectedQuery(null);
    }
    setShowSuggestions(true);
  };

  // Handle empty search explicitly
  const handleEmptySearch = () => {
    setResults([]);
    setHasSearched(true);
    setCorrectedQuery(null);
  };

  // Handle key events untuk suggestions
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!query.trim() && selectedSkills.length === 0) {
        handleEmptySearch();
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="p-4 w-full max-w-4xl mx-auto">
      {/* Input Pencarian dengan Autocomplete */}
      <div className="relative mb-6">
        {/* Selected Skills Tags */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSkills.map(skill => (
              <span
                key={skill.id}
                className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1"
              >
                {skill.name}
                <button
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            <button
              onClick={handleClearAllSkills}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={selectedSkills.length > 0 ? "Add more skills..." : "Cari skill atau role (contoh: PHP, Python, Software Engineer)..."}
              className="border rounded-md p-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (query.length >= 1 || suggestions.length > 0) && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {isLoadingSuggestions ? (
                  <div className="p-3 text-gray-500 text-sm">Loading suggestions...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map(skill => (
                    <div
                      key={skill.id}
                      onClick={() => handleAddSkill(skill)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                    >
                      <span className="text-gray-800">{skill.name}</span>
                      {selectedSkills.some(s => s.id === skill.id) && (
                        <Check size={16} className="text-green-500" />
                      )}
                    </div>
                  ))
                ) : query.length >= 2 ? (
                  <div className="p-3 text-gray-500 text-sm">No skills found</div>
                ) : null}
                
                {/* Option untuk menambah query saat ini sebagai skill */}
                {query.length >= 2 && !suggestions.some(s => s.name.toLowerCase() === query.toLowerCase()) && (
                  <div
                    onClick={() => handleAddSkill({ id: Date.now(), name: query })}
                    className="p-3 hover:bg-green-50 cursor-pointer border-t border-gray-200 flex items-center gap-2 text-green-600"
                  >
                    <span>Add "</span>
                    <strong>{query}</strong>
                    <span>" as custom skill</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              if (!query.trim() && selectedSkills.length === 0) {
                handleEmptySearch();
              } else {
                handleSearch();
              }
            }}
            disabled={isLoading}
            className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {isLoading ? 'Mencari...' : 'Cari'}
          </button>
        </div>
      </div>

      {/* Pesan Koreksi */}
      {correctedQuery && query.trim() && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            🔍 Mengarahkan pencarian dari "<strong>{query}</strong>" ke "<strong>{correctedQuery}</strong>"
          </p>
        </div>
      )}

      {/* Informasi Pencarian Skill - HANYA TAMPIL JIKA BUKAN ROLE SEARCH dan ada hasil */}
      {results.length > 0 && isMultipleSkillSearch(query) && !correctedQuery && !isRoleSearchResult() && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Menampilkan kandidat dengan <strong>{results[0].total_searched_skills} skill</strong> yang dicari. 
            Kandidat teratas memiliki <strong>{results[0].matched_skills_count} skill</strong> yang cocok.
          </p>
        </div>
      )}

      {/* Informasi Role Search - TAMPIL JIKA ROLE SEARCH */}
      {results.length > 0 && (isRoleSearch(query) || correctedQuery || isRoleSearchResult()) && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            🎯 Menampilkan kandidat untuk role: <strong>{correctedQuery || query}</strong>
            <br />
            <span className="text-green-600">Berdasarkan pengalaman kerja di kolom experience</span>
          </p>
        </div>
      )}

      {/* Informasi Single Skill Search - TAMPIL JIKA SINGLE SKILL */}
      {results.length > 0 && !isRoleSearch(query) && !isMultipleSkillSearch(query) && !correctedQuery && !isRoleSearchResult() && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-700">
            🔍 Menampilkan kandidat dengan skill: <strong>{query}</strong>
          </p>
        </div>
      )}

      {/* Header Hasil & Tombol Sort */}
      {results.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
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
              {query.trim() || selectedSkills.length > 0
                ? "Tidak ada kandidat ditemukan. Coba kata kunci atau kriteria lain. 🔍"
                : "Silakan masukkan kata kunci pencarian di atas."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SearchBar;