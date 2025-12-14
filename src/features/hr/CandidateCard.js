// src/components/CandidateCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, GraduationCap, Award, MapPin, 
  Star, Target, Calendar, Building, CheckCircle,
  Mail, Phone, Users, Clock, ChevronRight
} from 'lucide-react';

const SkillTag = ({ skill, isMatched = false }) => (
  <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${isMatched ? 
    'bg-green-100 text-green-800 border border-green-300' : 
    'bg-gray-100 text-gray-700 border border-gray-300'
  }`}>
    {skill}
    {isMatched && <CheckCircle size={12} className="inline ml-1.5" />}
  </span>
);

// Helper functions
const extractRoleFromExperience = (experience) => {
  if (!experience) return 'No experience listed';
  const match = experience.match(/^([^at]+)(?=\s+at\s+)/i);
  return match ? match[1].trim() : experience;
};

const extractCompanyFromExperience = (experience) => {
  if (!experience) return '';
  const match = experience.match(/at\s+([^(]+)/i);
  return match ? match[1].trim() : '';
};

const extractYearsFromExperience = (experience) => {
  if (!experience) return 0;
  const match = experience.match(/\((\d{4})-(\d{4}|Present)\)/i);
  if (match) {
    const startYear = parseInt(match[1]);
    const endYear = match[2] === 'Present' ? new Date().getFullYear() : parseInt(match[2]);
    return Math.max(endYear - startYear, 1);
  }
  return 0;
};

const getExperiencePeriod = (experience) => {
  if (!experience) return '';
  const match = experience.match(/\(([^)]+)\)/);
  return match ? match[1] : '';
};

function CandidateCard({ candidate, matchQuality, searchedRole = '', selectedSkills = [] }) {
  const navigate = useNavigate();
  
  // Extract data dari experience field
  const experience = candidate.experience || '';
  const extractedRole = candidate.experience_role || extractRoleFromExperience(experience);
  const extractedCompany = candidate.experience_company || extractCompanyFromExperience(experience);
  const extractedYears = candidate.experience_years || extractYearsFromExperience(experience);
  const experiencePeriod = getExperiencePeriod(experience);
  
  // Candidate data
  const name = candidate.name || 'Candidate';
  const email = candidate.email || '';
  const phone = candidate.phone || '';
  const education = candidate.education || 'Not specified';
  const matchScore = candidate.match_score || 0;
  const status = candidate.status || 'processing';
  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];
  
  // Extract university dari education
  const universityMatch = education.match(/,([^,(]+(?:University|Institute|College|School)[^,)]*)/i);
  const university = universityMatch ? universityMatch[1].trim() : education;
  
  // Get matched skills
  const matchedSkills = candidate.matched_skills || [];
  
  // Handler untuk view profile
  const handleViewProfile = () => {
    const candidateId = candidate.id || candidate._id || '1';
    navigate(`/candidate/${candidateId}`);
  };

  // Get star rating
  const getStarRating = (score) => {
    if (score >= 90) return '⭐⭐⭐⭐⭐';
    if (score >= 80) return '⭐⭐⭐⭐☆';
    if (score >= 70) return '⭐⭐⭐☆☆';
    if (score >= 60) return '⭐⭐☆☆☆';
    if (score >= 50) return '⭐☆☆☆☆';
    return '☆☆☆☆☆';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Section - Main Info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              {/* Profile Image */}
              <img
                src={`https://api.dicebear.com/8.x/initials/svg?seed=${name}&backgroundColor=4f46e5`}
                alt={name}
                className="w-16 h-16 rounded-xl border-2 border-indigo-100"
              />
              
              {/* Name and Basic Info */}
              <div>
                <h2 className="text-xl font-bold text-gray-800">{name}</h2>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{extractedRole}</span>
                  </div>
                  {extractedCompany && (
                    <div className="flex items-center gap-2">
                      <Building size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Previously at <strong className="text-gray-800">{extractedCompany}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Match Score */}
            <div className={`px-4 py-3 rounded-lg border ${matchQuality?.border || 'border-gray-200'} ${matchQuality?.color || 'bg-gray-100 text-gray-800'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-600" />
                  <span className="text-xl font-bold">{matchScore}%</span>
                </div>
                <div className="text-xs font-semibold ml-2">{matchQuality?.label || 'Match'}</div>
              </div>
              <div className="text-yellow-500 text-xs mt-1">
                {getStarRating(matchScore)}
              </div>
              {searchedRole && (
                <div className="text-xs text-gray-600 mt-2 text-center">
                  Match to: "{searchedRole}"
                </div>
              )}
            </div>
          </div>
          
          {/* Experience Details */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Previous Experience</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <p className="text-sm font-medium text-gray-800">{extractedRole}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Company</p>
                <p className="text-sm font-medium text-gray-800">{extractedCompany || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Duration</p>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <p className="text-sm font-medium text-gray-800">
                    {experiencePeriod || 'Not specified'}
                    {extractedYears > 0 && (
                      <span className="text-gray-600 ml-2">({extractedYears} years)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Skills Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Skills</h3>
              </div>
              <span className="text-xs text-gray-500">
                {skills.length} total skills
                {selectedSkills.length > 0 && matchedSkills.length > 0 && (
                  <span className="text-green-600 font-medium ml-2">
                    ({matchedSkills.length}/{selectedSkills.length} matched)
                  </span>
                )}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 6).map((skill, index) => {
                const skillName = typeof skill === 'string' ? skill : skill.skill_name || '';
                const isMatched = matchedSkills.includes(skillName);
                return (
                  <SkillTag key={index} skill={skillName} isMatched={isMatched} />
                );
              })}
              {skills.length > 6 && (
                <span className="text-sm text-blue-600 font-medium px-3 py-1.5">
                  +{skills.length - 6} more
                </span>
              )}
            </div>
            {selectedSkills.length > 0 && matchedSkills.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                No specific skills match the search criteria
              </p>
            )}
          </div>
          
          {/* Education & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap size={14} className="text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-600">EDUCATION</h4>
              </div>
              <p className="text-sm text-gray-800 line-clamp-2">{education}</p>
              {/* <p className="text-xs text-gray-500 mt-1">
                {education.length > 100 ? education.substring(0, 100) + '...' : education}
              </p> */}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-gray-500" />
                <h4 className="text-xs font-semibold text-gray-600">CONTACT</h4>
              </div>
              <div className="space-y-1">
                {email && (
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-gray-400" />
                    <span className="text-sm text-gray-700 truncate">{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Section - Actions */}
        <div className="lg:w-48 flex flex-col gap-4">
          <button
            onClick={handleViewProfile}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center gap-2"
          >
            View Profile
            <ChevronRight size={16} />
          </button>
          
          {/* Quick Stats */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-600 mb-3">MATCH DETAILS</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Experience Match</span>
                  <span className="text-xs font-bold text-blue-600">
                    {matchScore >= 80 ? 'Excellent' : matchScore >= 60 ? 'Good' : 'Fair'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${matchScore}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Years Experience</span>
                  <span className="text-xs font-bold text-gray-800">{extractedYears} years</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min(extractedYears * 20, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Status</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    status === 'passed_filter' ? 'bg-green-100 text-green-800' :
                    status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateCard;