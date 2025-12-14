// src/components/SearchBar.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ArrowUpDown, X, Check, Star, Target, Search, User, Briefcase, Award } from "lucide-react";
import CandidateCard from "./CandidateCard";

// Keywords untuk pencarian experience
// SearchBar.js - Update EXPERIENCE_KEYWORDS
const EXPERIENCE_KEYWORDS = [
  // Software Engineering
  'software engineer', 'software developer', 'developer', 'programmer', 'coder',
  'backend developer', 'backend engineer', 'backend',
  'frontend developer', 'frontend engineer', 'frontend', 'front end',
  'fullstack developer', 'fullstack engineer', 'fullstack', 'full stack',
  'web developer', 'web engineer',
  'mobile developer', 'mobile engineer',
  'android developer', 'android engineer',
  'ios developer', 'ios engineer', 'swift developer',
  'react native developer',
  'java developer', 'python developer', 'javascript developer', 'js developer',
  'devops engineer', 'devops',
  'cloud engineer', 'cloud',
  'sre', 'site reliability engineer',
  'data scientist', 'data analyst', 'data engineer',
  'machine learning engineer', 'ml engineer',
  'ai engineer', 'artificial intelligence engineer',
  'database administrator', 'dba',
  
  // Design
  'ui designer', 'ux designer', 'ui/ux designer', 'product designer',
  'graphic designer', 'visual designer',
  
  // Business & Management
  'business analyst', 'system analyst', 'analyst',
  'product manager', 'project manager', 'program manager',
  'scrum master', 'agile coach',
  'team lead', 'team leader', 'technical lead',
  
  // Marketing
  'digital marketer', 'content creator', 'copywriter',
  'seo specialist', 'social media specialist', 'community manager',
  
  // Support & Operations
  'customer support', 'technical support', 'it support',
  'system administrator', 'operations',
  
  // HR & Finance
  'hr', 'human resources', 'recruiter', 'talent acquisition',
  'accountant', 'finance', 'tax',
  
  // Tambahkan berdasarkan gambar
  'real estate agent', 'property consultant',
  'full time monopoly player' // dari gambar
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
// SearchBar.js - Perbaiki fungsi extractExperienceRole
// SearchBar.js - GANTI fungsi extractExperienceRole dengan yang lebih akurat
const extractExperienceRole = (experience) => {
  if (!experience) return '';
  
  // 1. Ambil sebelum " at " (case-insensitive)
  const atMatch = experience.match(/^([^]*?)(?=\s+at\s+)/i);
  if (atMatch && atMatch[1]) {
    return atMatch[1].trim();
  }
  
  // 2. Ambil sebelum " - " (dash pemisah)
  const dashMatch = experience.match(/^([^]*?)(?=\s+-\s+)/);
  if (dashMatch && dashMatch[1]) {
    return dashMatch[1].trim();
  }
  
  // 3. Ambil sebelum " (" (tahun)
  const parenMatch = experience.match(/^([^]*?)(?=\s+\()/);
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1].trim();
  }
  
  // 4. Ambil sebelum ","
  const commaMatch = experience.match(/^([^,]*)/);
  if (commaMatch && commaMatch[1]) {
    return commaMatch[1].trim();
  }
  
  return experience.trim();
};

// Juga update fungsi yang sama di CandidateCard.js untuk konsistensi

// Extract company dari experience
const extractCompany = (experience) => {
  if (!experience) return '';
  const companyMatch = experience.match(/at\s+([^(]+)/i);
  return companyMatch ? companyMatch[1].trim() : '';
};

// Calculate years of experience
const calculateYearsFromExperience = (experience) => {
  if (!experience) {
    console.log(`   📅 No experience data for years calculation`);
    return 0;
  }
  
  console.log(`   📅 Calculating years from: "${experience}"`);
  
  const yearMatch = experience.match(/\((\d{4})-(\d{4}|Present)\)/i);
  if (yearMatch) {
    const startYear = parseInt(yearMatch[1]);
    const endYear = yearMatch[2] === 'Present' ? new Date().getFullYear() : parseInt(yearMatch[2]);
    const years = Math.max(endYear - startYear, 0);
    console.log(`   📅 Found year range: ${startYear}-${yearMatch[2]} = ${years} years`);
    return years;
  }
  
  const yearsMatch = experience.match(/(\d+)\s+years?/i);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    console.log(`   📅 Found explicit years: ${years} years`);
    return years;
  }
  
  console.log(`   📅 No years found in experience`);
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
// SearchBar.js - Update autoCorrectTypo
const autoCorrectTypo = (input) => {
  if (!input || input.length < 2) return input;
  
  const inputLower = input.toLowerCase().trim();
  
  // Check exact typo corrections
  if (TYPO_CORRECTIONS[inputLower]) {
    const corrected = TYPO_CORRECTIONS[inputLower];
    console.log(`🔧 Auto-correct: "${input}" → "${corrected}"`);
    return corrected;
  }
  
  // Check for similar keywords dengan fuzzy matching
  let bestMatch = null;
  let bestScore = 0;
  
  EXPERIENCE_KEYWORDS.forEach(keyword => {
    const similarity = calculateStringSimilarity(inputLower, keyword);
    if (similarity > bestScore && similarity > 0.6) { // Threshold lebih rendah
      bestScore = similarity;
      bestMatch = keyword;
    }
  });
  
  if (bestMatch && bestMatch !== inputLower) {
    console.log(`🎯 Auto-suggest: "${input}" → "${bestMatch}" (score: ${bestScore.toFixed(2)})`);
    return bestMatch;
  }
  
  return input;
};

// Detect search mode berdasarkan input
// SearchBar.js - GANTI fungsi detectSearchMode
const detectSearchMode = (query, selectedSkills) => {
  if (!query.trim() && selectedSkills.length > 0) {
    return SEARCH_MODES.SKILLS;
  }
  
  if (query.trim() && selectedSkills.length > 0) {
    return SEARCH_MODES.EXPERIENCE_SKILLS;
  }
  
  if (query.trim()) {
    const queryLower = query.toLowerCase().trim();
    const words = query.split(/\s+/);
    
    // PERBAIKAN: Prioritas 1 - Cek jika query mengandung kata kunci experience
    const isExperienceKeyword = EXPERIENCE_KEYWORDS.some(keyword => {
      // Cek exact match atau contains dengan threshold lebih baik
      if (queryLower === keyword) return true;
      if (queryLower.includes(keyword) && keyword.length >= 3) return true;
      if (keyword.includes(queryLower) && queryLower.length >= 3) return true;
      
      // Cek setiap kata dalam query
      return words.some(word => {
        const wordLower = word.toLowerCase();
        return EXPERIENCE_KEYWORDS.some(kw => 
          wordLower.includes(kw) || kw.includes(wordLower)
        );
      });
    });
    
    if (isExperienceKeyword) {
      console.log(`🔍 Detected as EXPERIENCE: "${query}" contains experience keyword`);
      return SEARCH_MODES.EXPERIENCE;
    }
    
    // PERBAIKAN: Prioritas 2 - Cek jika benar-benar nama (lebih strict)
    const isLikelyName = () => {
      if (words.length < 1 || words.length > 4) return false;
      
      // Tidak boleh mengandung angka
      if (/\d/.test(query)) return false;
      
      // Tidak boleh mengandung karakter khusus (kecuali titik untuk singkatan)
      if (/[@#$%&*+=<>/\\]/.test(query)) return false;
      
      // Kata tidak boleh terlalu panjang untuk nama (>15 karakter)
      if (words.some(word => word.length > 15)) return false;
      
      // Kata harus mengandung setidaknya satu huruf kecil
      if (words.every(word => /^[A-Z]+$/.test(word))) {
        // Jika semua huruf kapital (singkatan), mungkin bukan nama
        return false;
      }
      
      // Cek jika kata mengandung role keywords (lebih komprehensif)
      const commonRoleIndicators = [
        'developer', 'engineer', 'designer', 'analyst', 'manager', 
        'specialist', 'architect', 'programmer', 'coder',
        'frontend', 'backend', 'fullstack', 'mobile', 'web',
        'software', 'data', 'ui', 'ux', 'devops', 'cloud',
        'machine', 'learning', 'ai', 'database', 'admin',
        'support', 'sales', 'marketing', 'content', 'seo',
        'product', 'project', 'scrum', 'agile', 'quality',
        'operations', 'hr', 'finance', 'accounting', 'tax',
        'medical', 'nurse', 'doctor', 'teacher', 'tutor'
      ];
      
      const hasRoleKeyword = words.some(word => {
        const wordLower = word.toLowerCase();
        return commonRoleIndicators.some(keyword => 
          wordLower.includes(keyword) || keyword.includes(wordLower)
        );
      });
      
      if (hasRoleKeyword) {
        console.log(`❌ Rejected as name: contains role keyword`);
        return false;
      }
      
      return true;
    };
    
    if (isLikelyName()) {
      console.log(`👤 Detected as NAME: "${query}" appears to be a person's name`);
      return SEARCH_MODES.NAME;
    }
    
    // Default ke EXPERIENCE jika ada kata kunci umum
    const hasCommonWords = queryLower.split(/\s+/).some(word => 
      EXPERIENCE_KEYWORDS.some(keyword => 
        word.length >= 3 && (keyword.includes(word) || word.includes(keyword))
      )
    );
    
    if (hasCommonWords) {
      return SEARCH_MODES.EXPERIENCE;
    }
  }
  
  return SEARCH_MODES.AUTO;
};

// Calculate experience match score
// SearchBar.js - Update fungsi calculateExperienceMatchScore
// SearchBar.js - Update fungsi calculateExperienceMatchScore untuk handling yang lebih baik
const calculateExperienceMatchScore = (candidateExperience, searchedRole) => {
  if (!searchedRole || !candidateExperience) {
    console.log(`   ⚠️  No experience or search query`);
    return 0;
  }
  
  // Extract role dengan fungsi yang sudah diperbaiki
  const experienceRole = extractExperienceRole(candidateExperience).toLowerCase().trim();
  const searchLower = searchedRole.toLowerCase().trim();
  
  console.log(`   🔍 Experience matching: "${experienceRole}" vs "${searchLower}"`);
  console.log(`   🔍 Original experience: "${candidateExperience}"`);
  
  // 1. EXACT MATCH - 100%
  if (experienceRole === searchLower) {
    console.log(`   ✅ EXACT MATCH: 100%`);
    return 100;
  }
  
  // 2. Contains match (experience mengandung search) - 95%
  if (experienceRole.includes(searchLower)) {
    console.log(`   🔍 Experience contains search term: 95%`);
    return 95;
  }
  
  // 3. Search contains experience - 90%
  if (searchLower.includes(experienceRole)) {
    console.log(`   🔍 Search contains experience: 90%`);
    return 90;
  }
  
  // 4. Check individual words dengan prioritization
  const experienceWords = experienceRole.split(/\s+/);
  const searchWords = searchLower.split(/\s+/);
  
  console.log(`   🎯 Word comparison:`);
  console.log(`      Experience words: [${experienceWords.join(', ')}]`);
  console.log(`      Search words: [${searchWords.join(', ')}]`);
  
  // Hitung similarity per kata
  let wordMatches = 0;
  let totalWordScore = 0;
  
  searchWords.forEach((searchWord, idx) => {
    let bestMatch = { word: '', score: 0 };
    
    experienceWords.forEach(expWord => {
      // Exact word match
      if (expWord === searchWord) {
        bestMatch = { word: expWord, score: 1.0 };
        return;
      }
      
      // Contains match (satu kata mengandung kata lain)
      if (expWord.includes(searchWord) || searchWord.includes(expWord)) {
        const containScore = Math.max(expWord.length, searchWord.length) / 
                           Math.min(expWord.length, searchWord.length) * 0.9;
        if (containScore > bestMatch.score) {
          bestMatch = { word: expWord, score: Math.min(containScore, 0.95) };
        }
      }
      
      // Fuzzy match
      const similarity = calculateStringSimilarity(expWord, searchWord);
      if (similarity > 0.8 && similarity > bestMatch.score) {
        bestMatch = { word: expWord, score: similarity };
      }
    });
    
    if (bestMatch.score > 0) {
      wordMatches++;
      totalWordScore += bestMatch.score;
      console.log(`      "${searchWord}" → "${bestMatch.word}" (score: ${(bestMatch.score * 100).toFixed(1)}%)`);
    } else {
      console.log(`      "${searchWord}" → NO MATCH`);
    }
  });
  
  if (wordMatches > 0) {
    const avgScore = totalWordScore / searchWords.length;
    const finalScore = Math.round(avgScore * 100);
    console.log(`   🎯 Average word match: ${finalScore}% (${wordMatches}/${searchWords.length} words)`);
    return finalScore;
  }
  
  console.log(`   ❌ No match found: 0%`);
  return 0;
};

// Calculate name match score
const calculateNameMatchScore = (candidateName, searchedName) => {
  if (!searchedName || !candidateName) {
    console.log(`   ⚠️  No name to compare`);
    return 0;
  }
  
  const similarity = calculateStringSimilarity(candidateName, searchedName);
  const score = similarity * 100;
  
  console.log(`   👤 Name matching: "${candidateName}" vs "${searchedName}"`);
  console.log(`   👤 Similarity: ${(similarity*100).toFixed(1)}% -> Score: ${Math.round(score)}%`);
  
  return Math.round(score);
};

// SearchBar.js - Update fungsi calculateSkillsMatchScore dengan debug
const calculateSkillsMatchScore = (candidateSkills = [], selectedSkills = []) => {
  if (selectedSkills.length === 0) {
    console.log(`   ⚠️  No skills selected for matching`);
    return 0;
  }
  
  const candidateSkillNames = candidateSkills.map(skill =>
    typeof skill === 'string' ? skill.toLowerCase() : skill.skill_name?.toLowerCase() || ''
  ).filter(Boolean);
  
  console.log(`   🛠️  Skills matching:`);
  console.log(`      Candidate skills: [${candidateSkillNames.join(', ')}]`);
  console.log(`      Selected skills: [${selectedSkills.map(s => s.name.toLowerCase()).join(', ')}]`);
  
  let matchedCount = 0;
  
  selectedSkills.forEach((selectedSkill, idx) => {
    const skillName = selectedSkill.name.toLowerCase();
    let isMatched = false;
    
    for (const candidateSkill of candidateSkillNames) {
      if (candidateSkill.includes(skillName) || skillName.includes(candidateSkill)) {
        isMatched = true;
        console.log(`      Skill ${idx+1}: "${skillName}" matched with "${candidateSkill}" (contains match)`);
        break;
      }
      
      const similarity = calculateStringSimilarity(candidateSkill, skillName);
      if (similarity > 0.8) {
        isMatched = true;
        console.log(`      Skill ${idx+1}: "${skillName}" matched with "${candidateSkill}" (fuzzy match: ${(similarity*100).toFixed(1)}%)`);
        break;
      }
    }
    
    if (!isMatched) {
      console.log(`      Skill ${idx+1}: "${skillName}" - NO MATCH`);
    } else {
      matchedCount++;
    }
  });
  
  const score = (matchedCount / selectedSkills.length) * 100;
  console.log(`   🛠️  Skills match: ${Math.round(score)}% (${matchedCount}/${selectedSkills.length} matched)`);
  return Math.round(score);
};

// Calculate total match score berdasarkan mode
// SearchBar.js - GANTI fungsi calculateTotalMatchScore
const calculateTotalMatchScore = (candidate, searchedQuery, selectedSkills = [], searchMode) => {
  console.log(`\n🔢 START SCORING for candidate: ${candidate.name}`);
  console.log(`   Search Mode: ${searchMode}`);
  console.log(`   Searched Query: "${searchedQuery}"`);
  console.log(`   Candidate Experience: "${candidate.experience}"`);
  console.log(`   Selected Skills: ${selectedSkills.map(s => s.name).join(', ')}`);
  
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
  
  console.log(`   Years Experience: ${years} -> yearsScore: ${yearsScore}%`);
  
  switch (searchMode) {
    case SEARCH_MODES.NAME:
      nameMatch = calculateNameMatchScore(candidate.name, searchedQuery);
      console.log(`   NAME MODE - Name match score: ${nameMatch}%`);
      // NAME ONLY: 100% name (tanpa skills, tanpa years)
      const nameFinalScore = Math.round(nameMatch);
      console.log(`   FINAL NAME SCORE: ${nameFinalScore}%`);
      return nameFinalScore;
      
    case SEARCH_MODES.EXPERIENCE:
      experienceMatch = calculateExperienceMatchScore(candidate.experience, searchedQuery);
      console.log(`   EXPERIENCE MODE - Experience match score: ${experienceMatch}%`);
      console.log(`   Years score: ${yearsScore}%`);
      
      // EXPERIENCE ONLY: 80% experience, 20% years (tanpa skills)
      const expScore = Math.round(
        experienceMatch * 0.8 +
        yearsScore * 0.2
      );
      console.log(`   Calculation: ${experienceMatch}% × 0.8 + ${yearsScore}% × 0.2 = ${expScore}%`);
      console.log(`   FINAL EXPERIENCE SCORE: ${expScore}%`);
      return expScore;
      
    case SEARCH_MODES.SKILLS:
      skillsMatch = calculateSkillsMatchScore(candidate.skills || [], selectedSkills);
      console.log(`   SKILLS MODE - Skills match score: ${skillsMatch}%`);
      // SKILLS ONLY: 100% skills (tanpa years)
      const skillsFinalScore = Math.round(skillsMatch);
      console.log(`   FINAL SKILLS SCORE: ${skillsFinalScore}%`);
      return skillsFinalScore;
      
    case SEARCH_MODES.EXPERIENCE_SKILLS:
      experienceMatch = calculateExperienceMatchScore(candidate.experience, searchedQuery);
      skillsMatch = calculateSkillsMatchScore(candidate.skills || [], selectedSkills);
      console.log(`   EXPERIENCE+SKILLS MODE - Experience match: ${experienceMatch}%`);
      console.log(`   Skills match: ${skillsMatch}%`);
      console.log(`   Years score: ${yearsScore}%`);
      
      // EXPERIENCE + SKILLS: 60% experience, 30% skills, 10% years
      const expSkillsScore = Math.round(
        experienceMatch * 0.6 +
        skillsMatch * 0.3 +
        yearsScore * 0.1
      );
      console.log(`   Calculation: ${experienceMatch}% × 0.6 + ${skillsMatch}% × 0.3 + ${yearsScore}% × 0.1 = ${expSkillsScore}%`);
      console.log(`   FINAL EXPERIENCE+SKILLS SCORE: ${expSkillsScore}%`);
      return expSkillsScore;
      
    case SEARCH_MODES.AUTO:
    default:
      console.log(`   AUTO MODE - Detecting best match...`);
      const nameScore = calculateNameMatchScore(candidate.name, searchedQuery);
      const expScoreAuto = calculateExperienceMatchScore(candidate.experience, searchedQuery);
      const skillScore = calculateSkillsMatchScore(candidate.skills || [], selectedSkills);
      
      console.log(`   Auto - Name score: ${nameScore}%`);
      console.log(`   Auto - Experience score: ${expScoreAuto}%`);
      console.log(`   Auto - Skills score: ${skillScore}%`);
      console.log(`   Auto - Years score: ${yearsScore}%`);
      
      // Jika hanya skill yang dipilih tanpa query, maka skill only
      if (selectedSkills.length > 0 && !searchedQuery.trim()) {
        console.log(`   Auto mode selected: SKILLS ONLY (${skillScore}%)`);
        return Math.round(skillScore);
      }
      
      // Jika hanya query tanpa skill, coba name dan experience
      if (searchedQuery.trim() && selectedSkills.length === 0) {
        const nameWeighted = nameScore;
        const expWeighted = expScoreAuto * 0.8 + yearsScore * 0.2;
        
        console.log(`   Auto - Name weighted: ${nameWeighted}%`);
        console.log(`   Auto - Experience weighted: ${expWeighted}%`);
        
        const scores = [
          { type: 'name', score: nameWeighted },
          { type: 'experience', score: expWeighted }
        ];
        
        scores.sort((a, b) => b.score - a.score);
        console.log(`   Auto mode selected: ${scores[0].type.toUpperCase()} (${scores[0].score}%)`);
        return Math.round(scores[0].score);
      }
      
      // Jika ada query dan skill, maka experience+skills
      if (searchedQuery.trim() && selectedSkills.length > 0) {
        const combinedScore = Math.round(
          expScoreAuto * 0.6 +
          skillScore * 0.3 +
          yearsScore * 0.1
        );
        console.log(`   Auto mode selected: EXPERIENCE+SKILLS (${combinedScore}%)`);
        return combinedScore;
      }
      
      // Default fallback
      console.log(`   Auto mode default: SKILLS (${skillScore}%)`);
      return Math.round(skillScore);
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
  const [allSkills, setAllSkills] = useState([]); // Tambah ini
  const [isLoadingAllSkills, setIsLoadingAllSkills] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // SearchBar.js - Tambahkan useEffect untuk fetch all skills
useEffect(() => {
  const fetchAllSkills = async () => {
    try {
      setIsLoadingAllSkills(true);
      
      // Gunakan autocomplete dengan query kosong untuk mendapatkan semua skills
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/skills/autocomplete?q=`
      );
      
      // Jika backend membatasi hasil, kita mungkin perlu multiple requests
      // Untuk sekarang asumsi semua skills bisa didapat dalam 1 request
      setAllSkills(res.data.data || []);
      
      console.log(`📊 Loaded ${res.data.data?.length || 0} skills for autocorrect`);
      
    } catch (err) {
      console.error("Error fetching all skills:", err);
      setAllSkills([]);
    } finally {
      setIsLoadingAllSkills(false);
    }
  };

  fetchAllSkills();
}, []);
  // Auto-detect search mode ketika query atau skills berubah
  useEffect(() => {
    console.log(`\n🎯 DETECTING SEARCH MODE:`);
    console.log(`   Query: "${query}"`);
    console.log(`   Selected skills count: ${selectedSkills.length}`);
    
    const detectedMode = detectSearchMode(query, selectedSkills);
    console.log(`   Detected mode: ${detectedMode}`);
    
    setSearchMode(detectedMode);
  }, [query, selectedSkills]);

  // Fetch suggestions skills dari API
  // SearchBar.js - Update fungsi fetchSuggestions
const fetchSuggestions = async (searchTerm) => {
  const words = searchTerm.trim().split(/\s+/);
  const lastWord = words[words.length - 1] || '';
  
  if (lastWord.length < 1) {
    setSuggestions([]);
    return;
  }

  setIsLoadingSuggestions(true);
  try {
    // 1. Fetch dari API autocomplete
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/skills/autocomplete?q=${encodeURIComponent(lastWord)}`
    );
    let apiSuggestions = res.data.data || [];
    
    // 2. Jika hasil dari API sedikit, tambahkan skill terdekat dari fuzzy matching
    if (apiSuggestions.length < 5 && allSkills.length > 0 && lastWord.length >= 2) {
      const fuzzyMatches = findClosestSkills(lastWord, allSkills, 5 - apiSuggestions.length);
      
      // Filter agar tidak ada duplikat dengan API suggestions
      const existingNames = new Set(
        apiSuggestions.map(s => (s.skill_name || s.name).toLowerCase())
      );
      
      fuzzyMatches.forEach(skill => {
        const skillName = (skill.skill_name || skill.name).toLowerCase();
        if (!existingNames.has(skillName)) {
          apiSuggestions.push({
            ...skill,
            is_fuzzy_match: true // Flag untuk menandai ini hasil fuzzy matching
          });
          existingNames.add(skillName);
        }
      });
    }
    
    setSuggestions(apiSuggestions);
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    
    // Fallback: gunakan fuzzy matching jika API error
    if (allSkills.length > 0 && lastWord.length >= 2) {
      const fuzzyMatches = findClosestSkills(lastWord, allSkills, 5);
      setSuggestions(fuzzyMatches.map(skill => ({
        ...skill,
        is_fuzzy_match: true
      })));
    } else {
      setSuggestions([]);
    }
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
 // SearchBar.js - Update handleAddSkill
const handleAddSkill = (skill) => {
  // Jika skill punya flag is_custom, cek apakah perlu autocorrect
  if (skill.is_custom && allSkills.length > 0) {
    const correctedSkill = autoCorrectSkillTypo(skill.name);
    
    if (correctedSkill !== skill.name) {
      // Cari skill yang sudah ada di database dengan nama yang corrected
      const existingSkill = allSkills.find(s => 
        (s.skill_name || s.name).toLowerCase() === correctedSkill.toLowerCase()
      );
      
      if (existingSkill) {
        console.log(`✅ Auto-corrected skill: "${skill.name}" → "${correctedSkill}"`);
        
        // Tampilkan konfirmasi ke user (opsional)
        if (window.confirm(`Did you mean "${correctedSkill}" instead of "${skill.name}"?`)) {
          // Gunakan skill yang sudah ada di database
          if (!selectedSkills.some(s => s.id === existingSkill.id)) {
            setSelectedSkills(prev => [...prev, existingSkill]);
          }
        } else {
          // User memilih tetap menggunakan custom skill
          if (!selectedSkills.some(s => s.id === skill.id)) {
            setSelectedSkills(prev => [...prev, skill]);
          }
        }
        
        setShowSuggestions(false);
        setSuggestions([]);
        return;
      }
    }
  }
  
  // Default: tambahkan skill seperti biasa
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

// SearchBar.js - Tambahkan fungsi-fungsi ini

// Fungsi untuk mencari skill terdekat dengan input
const findClosestSkills = (input, skillList, limit = 3) => {
  if (!input || input.length < 2 || skillList.length === 0) return [];
  
  const inputLower = input.toLowerCase().trim();
  
  // Jika input kosong, return empty array
  if (!inputLower) return [];
  
  // 1. Exact match (case-insensitive)
  const exactMatches = skillList.filter(skill => {
    const skillName = (skill.skill_name || skill.name || '').toLowerCase();
    return skillName === inputLower;
  });
  
  if (exactMatches.length > 0) {
    return exactMatches.slice(0, limit);
  }
  
  // 2. Contains match
  const containsMatches = skillList.filter(skill => {
    const skillName = (skill.skill_name || skill.name || '').toLowerCase();
    return skillName.includes(inputLower) || inputLower.includes(skillName);
  });
  
  if (containsMatches.length > 0) {
    return containsMatches.slice(0, limit);
  }
  
  // 3. Fuzzy matching dengan Levenshtein distance
  const skillScores = skillList.map(skill => {
    const skillName = (skill.skill_name || skill.name || '').toLowerCase();
    
    // Hitung similarity score
    let score = 0;
    
    // Jika skill lebih pendek dari input, tidak mungkin match
    if (skillName.length < inputLower.length * 0.5) return { skill, score: 0 };
    
    // Calculate Levenshtein distance
    const distance = calculateLevenshteinDistance(inputLower, skillName);
    const maxLength = Math.max(inputLower.length, skillName.length);
    const similarity = 1 - (distance / maxLength);
    
    // Bonus untuk yang dimulai dengan huruf yang sama
    if (skillName[0] === inputLower[0]) {
      score = similarity * 1.2;
    } else {
      score = similarity;
    }
    
    // Bonus untuk common typos
    const commonTypos = {
      'tensorflo': 'tensorflow',
      'tensorfl': 'tensorflow',
      'tensorf': 'tensorflow',
      'reactjs': 'react',
      'react.js': 'react',
      'nodejs': 'node.js',
      'node.js': 'nodejs',
      'javascript': 'js',
      'js': 'javascript',
      'python': 'py',
      'py': 'python',
      'java': 'jv',
      'jv': 'java',
      'mysql': 'sql',
      'postgresql': 'postgres',
      'mongodb': 'mongo',
      'aws': 'amazon web services',
      'azure': 'microsoft azure',
      'gcp': 'google cloud platform'
    };
    
    if (commonTypos[inputLower] === skillName || commonTypos[skillName] === inputLower) {
      score = Math.max(score, 0.9);
    }
    
    return { skill, score };
  });
  
  // Filter dan sort berdasarkan score
  const filteredSkills = skillScores
    .filter(item => item.score > 0.6) // Minimum 60% similarity
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.skill);
  
  return filteredSkills;
};

// Fungsi untuk autocorrect skill typo
const autoCorrectSkillTypo = (input) => {
  if (!input || input.length < 2 || allSkills.length === 0) return input;
  
  const inputLower = input.toLowerCase().trim();
  
  // Cari skill terdekat
  const closestSkills = findClosestSkills(inputLower, allSkills, 1);
  
  if (closestSkills.length > 0) {
    const closestSkill = closestSkills[0];
    const skillName = closestSkill.skill_name || closestSkill.name;
    
    // Cek similarity untuk menentukan apakah perlu autocorrect
    const similarity = calculateStringSimilarity(inputLower, skillName.toLowerCase());
    
    if (similarity > 0.8) { // 80% similar atau lebih
      console.log(`🔧 Skill autocorrect: "${input}" → "${skillName}" (similarity: ${(similarity*100).toFixed(1)}%)`);
      return skillName;
    }
  }
  
  return input;
};

  // Main search function
  // SearchBar.js - Update bagian handleSearch untuk debug
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
    
    console.log(`🔍 Starting search for: "${searchedQuery}"`);
    console.log(`🎯 Detected mode: ${searchMode}`);
    
    // Auto-correct typo untuk experience search
    let corrected = null;
    let finalQuery = searchedQuery;
    
    if (searchMode === SEARCH_MODES.EXPERIENCE || searchMode === SEARCH_MODES.EXPERIENCE_SKILLS) {
      corrected = autoCorrectTypo(searchedQuery);
      if (corrected !== searchedQuery) {
        console.log(`✏️ Corrected query: "${searchedQuery}" → "${corrected}"`);
        setCorrectedQuery(corrected);
        finalQuery = corrected;
      }
    }
    
    // Fetch all candidates dari API
    console.log(`📡 Calling API: /api/hr/candidates/search?q=${encodeURIComponent(finalQuery || 'all')}`);
    
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/hr/candidates/search?q=${encodeURIComponent(finalQuery || 'all')}`
    );

    let candidates = res.data.data || [];
    console.log(`📥 Received ${candidates.length} candidates from API`);
    
    // Apply scoring ke setiap candidate berdasarkan mode
    const scoredCandidates = candidates.map(candidate => {
      console.log(`\n📊 Scoring candidate: ${candidate.name}`);
      console.log(`   Experience: ${candidate.experience}`);
      
      const matchScore = calculateTotalMatchScore(candidate, finalQuery, selectedSkills, searchMode);
      const experienceRole = extractExperienceRole(candidate.experience);
      const company = extractCompany(candidate.experience);
      const years = calculateYearsFromExperience(candidate.experience);
      
      console.log(`   Extracted role: "${experienceRole}"`);
      console.log(`   Match score: ${matchScore}%`);
      
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
        match_mode: candidate.search_type || searchMode,
        match_note: candidate.match_note || ''
      };
    });
    
    // Filter candidates dengan score yang cukup
    const filteredCandidates = scoredCandidates.filter(candidate => 
      candidate.match_score >= 30
    );
    
    // Sort berdasarkan match score
    filteredCandidates.sort((a, b) => b.match_score - a.match_score);
    
    console.log(`✅ Found ${filteredCandidates.length} filtered candidates (score ≥ 30)`);
    console.log(`🏆 Top scores:`, filteredCandidates.slice(0, 3).map(c => `${c.name}: ${c.match_score}%`));
    
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
        return { icon: <Briefcase size={16} />, label: "Job Search", color: "text-blue-600", bg: "bg-blue-100" };
      case SEARCH_MODES.SKILLS:
        return { icon: <Award size={16} />, label: "Skills Search", color: "text-green-600", bg: "bg-green-100" };
      case SEARCH_MODES.EXPERIENCE_SKILLS:
        return { icon: <Target size={16} />, label: "Job + Skills", color: "text-indigo-600", bg: "bg-indigo-100" };
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
                  <>
                    {suggestions.map(skill => {
                      const skillName = skill.skill_name || skill.name;
                      const isFuzzyMatch = skill.is_fuzzy_match;
                      
                      return (
                        <div
                          key={skill.id || skillName}
                          onClick={() => handleAddSkill(skill)}
                          className={`p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                            isFuzzyMatch ? 'bg-yellow-50 hover:bg-yellow-100' : ''
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-gray-800">{skillName}</span>
                            {isFuzzyMatch && (
                              <span className="text-xs text-yellow-600 mt-1">
                                💡 Did you mean "{skillName}"?
                              </span>
                            )}
                          </div>
                          {selectedSkills.some(s => s.id === skill.id) && (
                            <Check size={16} className="text-green-500" />
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Custom skill option dengan autocorrect */}
                    {query.length >= 2 && !suggestions.some(s => 
                      (s.skill_name || s.name).toLowerCase() === query.toLowerCase()
                    ) && (
                      <div className="border-t border-gray-200">
                        {/* Coba cari skill terdekat untuk autocorrect */}
                        {allSkills.length > 0 && (() => {
                          const closestSkill = findClosestSkills(query, allSkills, 1)[0];
                          const closestSkillName = closestSkill ? (closestSkill.skill_name || closestSkill.name) : null;
                          const similarity = closestSkill ? 
                            calculateStringSimilarity(query.toLowerCase(), closestSkillName.toLowerCase()) : 0;
                          
                          if (closestSkill && similarity > 0.7) {
                            return (
                              <div
                                onClick={() => handleAddSkill(closestSkill)}
                                className="p-3 hover:bg-green-50 cursor-pointer flex items-center gap-2 text-green-600 bg-green-50"
                              >
                                <span className="font-medium">✨ Suggested:</span>
                                <strong>{closestSkillName}</strong>
                                <span className="text-xs text-gray-500">
                                  ({(similarity * 100).toFixed(0)}% match)
                                </span>
                              </div>
                            );
                          } else {
                            return (
                              <div
                                onClick={() => handleAddSkill({ 
                                  id: Date.now(), 
                                  name: query,
                                  is_custom: true 
                                })}
                                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-600"
                              >
                                <span>Add "</span>
                                <strong>{query}</strong>
                                <span>" as custom skill</span>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </>
                ) : query.length >= 2 ? (
                  <div className="p-3 text-gray-500 text-sm">
                    No skills found. Try different spelling.
                  </div>
                ) : null}
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
              Job
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
              Job + Skills
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
      {/* Match Strategy Info */}
      {/* {results.length > 0 && results.some(c => c.match_note) && (
        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-blue-600" />
            <h3 className="font-semibold text-blue-800">Search Strategy Applied</h3>
          </div>
          <div className="space-y-2">
            {Array.from(new Set(results.map(c => c.match_note).filter(Boolean))).map((note, index) => (
              <p key={index} className="text-sm text-blue-700">
                {note}
              </p>
            ))}
          </div>
        </div>
      )} */}
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
                {searchMode === SEARCH_MODES.NAME && "Name 100%"}
                {searchMode === SEARCH_MODES.EXPERIENCE && "Job 80%, Years 20%"}
                {searchMode === SEARCH_MODES.SKILLS && "Skills 100%"}
                {searchMode === SEARCH_MODES.EXPERIENCE_SKILLS && "Job 60%, Skills 30%, Years 10%"}
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
                <p className="text-xs text-gray-600">Job Search:</p>
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