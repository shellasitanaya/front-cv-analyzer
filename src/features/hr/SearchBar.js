// src/components/SearchBar.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ArrowUpDown, X, Check, Star, Target, Search, User, Briefcase, Award } from "lucide-react";
import CandidateCard from "./CandidateCard";

// Keywords untuk pencarian experience
const EXPERIENCE_KEYWORDS = [
  'developer', 'programmer', 'coder', 'engineer', 'architect',
  'frontend', 'front end', 'backend', 'back end', 'fullstack', 'full stack',
  'web developer', 'software developer', 'mobile developer',
  'android developer', 'ios developer', 'react native developer',
  'java developer', 'python developer', 'javascript developer',
  'devops', 'cloud', 'sre', 'site reliability',
  'data scientist', 'data analyst', 'data engineer',
  'machine learning', 'ml', 'ai', 'artificial intelligence',
  'database', 'dba', 'database administrator',
  'designer', 'ui designer', 'ux designer', 'ui/ux', 'product designer',
  'analyst', 'business analyst', 'system analyst',
  'manager', 'project manager', 'product manager', 'scrum master',
  'team lead', 'team leader', 'technical lead',
  'marketer', 'digital marketer', 'content creator', 'copywriter',
  'seo specialist', 'social media', 'community manager',
  'support', 'customer support', 'technical support',
  'operations', 'it support', 'system administrator'
];

// Common typos untuk autocorrect
const TYPO_CORRECTIONS = {
  'bakcend': 'backend',
  'backe': 'backend',
  'backned': 'backend',
  'backnd': 'backend',
  'frondend': 'frontend',
  'frontned': 'frontend',
  'fronted': 'frontend',
  'fullstak': 'fullstack',
  'fullstac': 'fullstack',
  'fullstck': 'fullstack',
  'devloper': 'developer',
  'develper': 'developer',
  'develloper': 'developer',
  'enginner': 'engineer',
  'engeneer': 'engineer',
  'anallist': 'analyst',
  'analist': 'analyst',
  'desiner': 'designer',
  'desginer': 'designer',
  'manger': 'manager',
  'maneger': 'manager',
  'progammer': 'programmer',
  'programer': 'programmer'
};

// Mode pencarian
const SEARCH_MODES = {
  AUTO: 'auto',
  NAME: 'name',
  EXPERIENCE: 'experience',
  SKILLS: 'skills',
  EXPERIENCE_SKILLS: 'experience_skills'
};

// Extract experience role dari string
const extractExperienceRole = (experience) => {
  if (!experience) return '';
  
  // Pattern 1: "Backend Developer at ABC Corp (2023-2024)"
  const match1 = experience.match(/^([^at]+)(?=\s+at\s+)/i);
  if (match1 && match1[1]) {
    return match1[1].trim();
  }
  
  // Pattern 2: "Software Engineer (2022-2023)"
  const match2 = experience.match(/^([^(]+)/i);
  if (match2 && match2[1]) {
    return match2[1].trim();
  }
  
  return experience;
};

// Extract company dari experience
const extractCompany = (experience) => {
  if (!experience) return '';
  const companyMatch = experience.match(/at\s+([^(]+)/i);
  return companyMatch ? companyMatch[1].trim() : '';
};

// Calculate years of experience
const calculateYearsFromExperience = (experience) => {
  if (!experience) return 0;
  
  const yearMatch = experience.match(/\((\d{4})-(\d{4}|Present)\)/i);
  if (yearMatch) {
    const startYear = parseInt(yearMatch[1]);
    const endYear = yearMatch[2] === 'Present' ? new Date().getFullYear() : parseInt(yearMatch[2]);
    return Math.max(endYear - startYear, 0);
  }
  
  const yearsMatch = experience.match(/(\d+)\s+years?/i);
  if (yearsMatch) {
    return parseInt(yearsMatch[1]);
  }
  
  return 0;
};

// Enhanced fuzzy matching dengan Levenshtein distance
const calculateLevenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const calculateStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  
  // Check for common typos first
  if (TYPO_CORRECTIONS[s1] === s2 || TYPO_CORRECTIONS[s2] === s1) {
    return 0.9;
  }
  
  // Check for containing
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8;
  }
  
  // Levenshtein distance for short strings
  if (s1.length < 10 || s2.length < 10) {
    const maxLength = Math.max(s1.length, s2.length);
    const distance = calculateLevenshteinDistance(s1, s2);
    const similarity = 1 - (distance / maxLength);
    return Math.max(similarity, 0);
  }
  
  // Word overlap for longer strings
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  const commonWords = words1.filter(word1 => 
    words2.some(word2 => {
      if (word1 === word2) return true;
      if (word1.includes(word2) || word2.includes(word1)) return true;
      if (word1.length > 3 && word2.length > 3) {
        const distance = calculateLevenshteinDistance(word1, word2);
        return distance <= 2; // Allow 2 character difference
      }
      return false;
    })
  ).length;
  
  return commonWords / Math.max(words1.length, words2.length);
};

// Fungsi untuk mendeteksi dan memperbaiki typo
const autoCorrectTypo = (input) => {
  if (!input || input.length < 3) return input;
  
  const inputLower = input.toLowerCase().trim();
  
  // Check exact typo corrections
  if (TYPO_CORRECTIONS[inputLower]) {
    return TYPO_CORRECTIONS[inputLower];
  }
  
  // Check for similar keywords dengan fuzzy matching
  let bestMatch = null;
  let bestScore = 0;
  
  EXPERIENCE_KEYWORDS.forEach(keyword => {
    const similarity = calculateStringSimilarity(inputLower, keyword);
    if (similarity > bestScore && similarity > 0.7) {
      bestScore = similarity;
      bestMatch = keyword;
    }
  });
  
  return bestMatch || input;
};

// Detect search mode berdasarkan input
const detectSearchMode = (query, selectedSkills) => {
  if (!query.trim() && selectedSkills.length > 0) {
    return SEARCH_MODES.SKILLS;
  }
  
  if (query.trim() && selectedSkills.length > 0) {
    return SEARCH_MODES.EXPERIENCE_SKILLS;
  }
  
  if (query.trim()) {
    // Check jika query adalah nama (mungkin berisi 2-3 kata, huruf kapital di awal)
    const words = query.trim().split(/\s+/);
    if (words.length <= 3 && words.every(word => /^[A-Z][a-z]+$/.test(word))) {
      return SEARCH_MODES.NAME;
    }
    
    // Check jika query mengandung kata kunci experience
    const queryLower = query.toLowerCase();
    if (EXPERIENCE_KEYWORDS.some(keyword => 
      queryLower.includes(keyword) || keyword.includes(queryLower)
    )) {
      return SEARCH_MODES.EXPERIENCE;
    }
  }
  
  return SEARCH_MODES.AUTO;
};

// Calculate experience match score
const calculateExperienceMatchScore = (candidateExperience, searchedRole) => {
  if (!searchedRole || !candidateExperience) return 0;
  
  const experienceRole = extractExperienceRole(candidateExperience).toLowerCase();
  const searchLower = searchedRole.toLowerCase();
  
  // Exact match
  if (experienceRole === searchLower) return 100;
  
  // Contains match
  if (experienceRole.includes(searchLower)) return 85;
  if (searchLower.includes(experienceRole)) return 75;
  
  // Word overlap dengan fuzzy matching
  const experienceWords = experienceRole.split(/\s+/);
  const searchWords = searchLower.split(/\s+/);
  
  const matchingWords = searchWords.filter(searchWord =>
    experienceWords.some(expWord => {
      const similarity = calculateStringSimilarity(expWord, searchWord);
      return similarity > 0.7;
    })
  ).length;
  
  if (matchingWords > 0) {
    return (matchingWords / searchWords.length) * 80;
  }
  
  return 0;
};

// Calculate name match score
const calculateNameMatchScore = (candidateName, searchedName) => {
  if (!searchedName || !candidateName) return 0;
  
  const similarity = calculateStringSimilarity(candidateName, searchedName);
  return similarity * 100;
};

// Calculate skills match score
const calculateSkillsMatchScore = (candidateSkills = [], selectedSkills = []) => {
  if (selectedSkills.length === 0) return 0;
  
  const candidateSkillNames = candidateSkills.map(skill =>
    typeof skill === 'string' ? skill.toLowerCase() : skill.skill_name?.toLowerCase() || ''
  ).filter(Boolean);
  
  let matchedCount = 0;
  
  selectedSkills.forEach(selectedSkill => {
    const skillName = selectedSkill.name.toLowerCase();
    
    if (candidateSkillNames.some(candidateSkill => {
      if (candidateSkill.includes(skillName) || skillName.includes(candidateSkill)) {
        return true;
      }
      return calculateStringSimilarity(candidateSkill, skillName) > 0.8;
    })) {
      matchedCount++;
    }
  });
  
  return (matchedCount / selectedSkills.length) * 100;
};

// Calculate total match score berdasarkan mode
const calculateTotalMatchScore = (candidate, searchedQuery, selectedSkills = [], searchMode) => {
  let experienceMatch = 0;
  let skillsMatch = 0;
  let nameMatch = 0;
  const years = calculateYearsFromExperience(candidate.experience);
  
  // Years score (0-100)
  let yearsScore = 0;
  if (years >= 5) yearsScore = 100;
  else if (years >= 4) yearsScore = 80;
  else if (years >= 3) yearsScore = 60;
  else if (years >= 2) yearsScore = 40;
  else if (years >= 1) yearsScore = 20;
  
  switch (searchMode) {
    case SEARCH_MODES.NAME:
      nameMatch = calculateNameMatchScore(candidate.name, searchedQuery);
      skillsMatch = calculateSkillsMatchScore(candidate.skills || [], selectedSkills);
      // Weights: Name 70%, Skills 20%, Years 10%
      return Math.round(
        nameMatch * 0.7 +
        skillsMatch * 0.2 +
        yearsScore * 0.1
      );
      
    case SEARCH_MODES.EXPERIENCE:
      experienceMatch = calculateExperienceMatchScore(candidate.experience, searchedQuery);
      skillsMatch = calculateSkillsMatchScore(candidate.skills || [], selectedSkills);
      // Weights: Experience 60%, Skills 30%, Years 10%
      return Math.round(
        experienceMatch * 0.6 +
        skillsMatch * 0.3 +
        yearsScore * 0.1
      );
      
    case SEARCH_MODES.SKILLS:
      skillsMatch = calculateSkillsMatchScore(candidate.skills || [], selectedSkills);
      // Weights: Skills 80%, Years 20%
      return Math.round(
        skillsMatch * 0.8 +
        yearsScore * 0.2
      );
      
    case SEARCH_MODES.EXPERIENCE_SKILLS:
      experienceMatch = calculateExperienceMatchScore(candidate.experience, searchedQuery);
      skillsMatch = calculateSkillsMatchScore(candidate.skills || [], selectedSkills);
      // Weights: Experience 50%, Skills 40%, Years 10%
      return Math.round(
        experienceMatch * 0.5 +
        skillsMatch * 0.4 +
        yearsScore * 0.1
      );
      
    case SEARCH_MODES.AUTO:
    default:
      // Auto-detect: coba semua dan ambil yang terbaik
      const nameScore = calculateNameMatchScore(candidate.name, searchedQuery);
      const expScore = calculateExperienceMatchScore(candidate.experience, searchedQuery);
      const skillScore = calculateSkillsMatchScore(candidate.skills || [], selectedSkills);
      
      const scores = [
        { type: 'name', score: nameScore * 0.7 + yearsScore * 0.3 },
        { type: 'experience', score: expScore * 0.6 + skillScore * 0.3 + yearsScore * 0.1 },
        { type: 'skills', score: skillScore * 0.8 + yearsScore * 0.2 }
      ];
      
      scores.sort((a, b) => b.score - a.score);
      return Math.round(scores[0].score);
  }
};

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [correctedQuery, setCorrectedQuery] = useState(null);
  const [searchMode, setSearchMode] = useState(SEARCH_MODES.AUTO);
  
  // State untuk autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Auto-detect search mode ketika query atau skills berubah
  useEffect(() => {
    const detectedMode = detectSearchMode(query, selectedSkills);
    setSearchMode(detectedMode);
  }, [query, selectedSkills]);

  // Fetch suggestions skills dari API
  const fetchSuggestions = async (searchTerm) => {
    const words = searchTerm.trim().split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    
    if (lastWord.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/skills/autocomplete?q=${encodeURIComponent(lastWord)}`
      );
      setSuggestions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle input change dengan debounce
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

  // Menambah skill
  const handleAddSkill = (skill) => {
    if (!selectedSkills.some(s => s.id === skill.id)) {
      setSelectedSkills(prev => [...prev, skill]);
      setShowSuggestions(false);
      setSuggestions([]);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Menghapus skill
  const handleRemoveSkill = (skillId) => {
    setSelectedSkills(prev => prev.filter(skill => skill.id !== skillId));
  };

  // Menghapus semua skill
  const handleClearAllSkills = () => {
    setSelectedSkills([]);
  };

  // Main search function
  const handleSearch = async () => {
    try {
      const searchedQuery = query.trim();
      
      if (!searchedQuery && selectedSkills.length === 0) {
        setResults([]);
        setHasSearched(true);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      
      // Auto-correct typo untuk experience search
      let corrected = null;
      let finalQuery = searchedQuery;
      
      if (searchMode === SEARCH_MODES.EXPERIENCE || searchMode === SEARCH_MODES.EXPERIENCE_SKILLS) {
        corrected = autoCorrectTypo(searchedQuery);
        if (corrected !== searchedQuery) {
          setCorrectedQuery(corrected);
          finalQuery = corrected;
        }
      }
      
      console.log("🔍 Searching with mode:", { 
        mode: searchMode,
        query: finalQuery, 
        skills: selectedSkills.map(s => s.name),
        corrected: corrected
      });

      // Fetch all candidates dari API
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/hr/candidates/search?q=${encodeURIComponent(finalQuery || 'all')}`
      );

      let candidates = res.data.data || [];
      
      // Apply scoring ke setiap candidate berdasarkan mode
      const scoredCandidates = candidates.map(candidate => {
        const matchScore = calculateTotalMatchScore(candidate, finalQuery, selectedSkills, searchMode);
        const experienceRole = extractExperienceRole(candidate.experience);
        const company = extractCompany(candidate.experience);
        const years = calculateYearsFromExperience(candidate.experience);
        
        // Determine matched skills
        const matchedSkills = selectedSkills.length > 0 ? 
          selectedSkills.filter(skill => {
            const candidateSkills = candidate.skills || [];
            return candidateSkills.some(candidateSkill => {
              const candidateSkillName = typeof candidateSkill === 'string' ? 
                candidateSkill : candidateSkill.skill_name;
              return candidateSkillName?.toLowerCase().includes(skill.name.toLowerCase()) ||
                     skill.name.toLowerCase().includes(candidateSkillName?.toLowerCase()) ||
                     calculateStringSimilarity(candidateSkillName || '', skill.name) > 0.8;
            });
          }).map(s => s.name) : [];
        
        return {
          ...candidate,
          match_score: matchScore,
          extracted_role: experienceRole,
          extracted_company: company,
          extracted_years: years,
          experience_role: experienceRole,
          experience_company: company,
          experience_years: years,
          matched_skills: matchedSkills,
          match_mode: searchMode
        };
      });
      
      // Filter candidates dengan score yang cukup
      const filteredCandidates = scoredCandidates.filter(candidate => 
        candidate.match_score >= 30
      );
      
      // Sort berdasarkan match score
      filteredCandidates.sort((a, b) => b.match_score - a.match_score);
      
      console.log(`✅ Found ${filteredCandidates.length} candidates`);
      
      setResults(filteredCandidates);
      setHasSearched(true);
      
    } catch (err) {
      console.error("❌ Search Error:", err);
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

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (correctedQuery) {
      setCorrectedQuery(null);
    }
    setShowSuggestions(true);
  };

  const handleEmptySearch = () => {
    setResults([]);
    setHasSearched(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!query.trim() && selectedSkills.length === 0) {
        handleEmptySearch();
      } else {
        handleSearch();
      }
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getSelectedSkillNames = () => {
    return selectedSkills.map(skill => skill.name).join(', ');
  };

  // Get match quality badge
  const getMatchQuality = (score) => {
    if (score >= 85) return { label: "Excellent", color: "bg-green-100 text-green-800", border: "border-green-200" };
    if (score >= 70) return { label: "Good", color: "bg-blue-100 text-blue-800", border: "border-blue-200" };
    if (score >= 50) return { label: "Fair", color: "bg-yellow-100 text-yellow-800", border: "border-yellow-200" };
    return { label: "Low", color: "bg-gray-100 text-gray-800", border: "border-gray-200" };
  };

  // Get search mode display
  const getSearchModeDisplay = () => {
    switch (searchMode) {
      case SEARCH_MODES.NAME:
        return { icon: <User size={16} />, label: "Name Search", color: "text-purple-600", bg: "bg-purple-100" };
      case SEARCH_MODES.EXPERIENCE:
        return { icon: <Briefcase size={16} />, label: "Experience Search", color: "text-blue-600", bg: "bg-blue-100" };
      case SEARCH_MODES.SKILLS:
        return { icon: <Award size={16} />, label: "Skills Search", color: "text-green-600", bg: "bg-green-100" };
      case SEARCH_MODES.EXPERIENCE_SKILLS:
        return { icon: <Target size={16} />, label: "Experience + Skills", color: "text-indigo-600", bg: "bg-indigo-100" };
      default:
        return { icon: <Search size={16} />, label: "Auto-detect", color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  const searchModeDisplay = getSearchModeDisplay();

  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      {/* Input Pencarian */}
      <div className="relative mb-6">
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSkills.map(skill => (
              <span
                key={skill.id}
                className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1 border border-blue-200"
              >
                {skill.name}
                <button
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none ml-1"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {selectedSkills.length > 0 && (
              <button
                onClick={handleClearAllSkills}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1.5"
              >
                Clear all
              </button>
            )}
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
              placeholder="Search by name, job experience, or skills..."
              className="border border-gray-300 rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Search Mode Indicator */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${searchModeDisplay.bg} ${searchModeDisplay.color}`}>
                {searchModeDisplay.icon}
                <span className="hidden sm:inline">{searchModeDisplay.label}</span>
              </div>
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (query.length >= 1 || suggestions.length > 0) && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
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
                      <span className="text-gray-800">{skill.skill_name || skill.name}</span>
                      {selectedSkills.some(s => s.id === skill.id) && (
                        <Check size={16} className="text-green-500" />
                      )}
                    </div>
                  ))
                ) : query.length >= 2 ? (
                  <div className="p-3 text-gray-500 text-sm">No skills found</div>
                ) : null}
                
                {query.length >= 2 && !suggestions.some(s => 
                  (s.skill_name || s.name).toLowerCase() === query.toLowerCase()
                ) && (
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
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-md"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-2 ml-1">
          <span className="text-xs text-gray-500">Search mode:</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSearchMode(SEARCH_MODES.AUTO)}
              className={`text-xs px-3 py-1 rounded-full ${searchMode === SEARCH_MODES.AUTO ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700'}`}
            >
              Auto
            </button>
            <button
              onClick={() => setSearchMode(SEARCH_MODES.NAME)}
              className={`text-xs px-3 py-1 rounded-full ${searchMode === SEARCH_MODES.NAME ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-gray-100 text-gray-700'}`}
            >
              Name
            </button>
            <button
              onClick={() => setSearchMode(SEARCH_MODES.EXPERIENCE)}
              className={`text-xs px-3 py-1 rounded-full ${searchMode === SEARCH_MODES.EXPERIENCE ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700'}`}
            >
              Experience
            </button>
            <button
              onClick={() => setSearchMode(SEARCH_MODES.SKILLS)}
              className={`text-xs px-3 py-1 rounded-full ${searchMode === SEARCH_MODES.SKILLS ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-700'}`}
            >
              Skills
            </button>
            <button
              onClick={() => setSearchMode(SEARCH_MODES.EXPERIENCE_SKILLS)}
              className={`text-xs px-3 py-1 rounded-full ${searchMode === SEARCH_MODES.EXPERIENCE_SKILLS ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-gray-100 text-gray-700'}`}
            >
              Experience + Skills
            </button>
          </div>
        </div>
      </div>

      {/* Typo Correction Message */}
      {correctedQuery && query.trim() && correctedQuery !== query.trim().toLowerCase() && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            🔍 Auto-corrected from "<strong>{query}</strong>" to "<strong>{correctedQuery}</strong>"
          </p>
        </div>
      )}

      {/* Search Info */}
      {results.length > 0 && (
        <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-800">
                <span className="font-semibold">🎯 {results.length} candidates found</span>
                <span className="block mt-1">
                  Mode: <strong className="text-indigo-900">{searchModeDisplay.label}</strong>
                  {query.trim() && (
                    <span className="ml-3">
                      Query: <strong className="text-indigo-900">{correctedQuery || query}</strong>
                    </span>
                  )}
                  {selectedSkills.length > 0 && (
                    <span className="ml-3">
                      Skills: <strong className="text-indigo-900">{getSelectedSkillNames()}</strong>
                    </span>
                  )}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-indigo-600">
                Score weights:{" "}
                {searchMode === SEARCH_MODES.NAME && "Name 70%, Skills 20%, Years 10%"}
                {searchMode === SEARCH_MODES.EXPERIENCE && "Experience 60%, Skills 30%, Years 10%"}
                {searchMode === SEARCH_MODES.SKILLS && "Skills 80%, Years 20%"}
                {searchMode === SEARCH_MODES.EXPERIENCE_SKILLS && "Experience 50%, Skills 40%, Years 10%"}
                {searchMode === SEARCH_MODES.AUTO && "Auto-adjusted based on query"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Hasil & Sort */}
      {results.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 p-4 bg-white rounded-xl border border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Matching Candidates
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Sorted by match score ({results.filter(c => c.match_score >= 70).length} highly relevant)
            </p>
          </div>
          <button
            onClick={handleSortToggle}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all border border-gray-300"
          >
            <Star size={16} className={sortOrder === 'desc' ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} />
            Sort by Match
            <ArrowUpDown size={16} />
            {sortOrder === 'desc' ? 'High to Low' : 'Low to High'}
          </button>
        </div>
      )}

      {/* Daftar Hasil Pencarian */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Searching candidates...</p>
          </div>
        ) : hasSearched && results.length > 0 ? (
          results.map((candidate, index) => {
            const matchQuality = getMatchQuality(candidate.match_score);
            return (
              <div key={candidate.id || index}>
                <CandidateCard 
                  candidate={candidate} 
                  matchQuality={matchQuality}
                  searchedQuery={query}
                  selectedSkills={selectedSkills}
                  searchMode={searchMode}
                />
              </div>
            );
          })
        ) : hasSearched && results.length === 0 ? (
          <div className="mt-8 p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-inner text-center border border-gray-200">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-700 font-medium">
              No candidates found
            </p>
            <p className="text-gray-500 mt-2">
              {query.trim() || selectedSkills.length > 0
                ? "Try different search modes or adjust your criteria."
                : "Enter search terms above to find candidates."}
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-gray-600">Name Search:</p>
                <p className="text-sm font-medium">"John Doe"</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-gray-600">Experience Search:</p>
                <p className="text-sm font-medium">"Backend Developer"</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-gray-600">Skills Search:</p>
                <p className="text-sm font-medium">"React + Node.js"</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-gray-600">Combined:</p>
                <p className="text-sm font-medium">"Frontend + Figma"</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SearchBar;