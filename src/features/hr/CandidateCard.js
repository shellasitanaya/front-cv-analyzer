// src/components/CandidateCard.js
import React from 'react';
// Impor MapPin sekarang akan digunakan
import { Briefcase, GraduationCap, Award, MapPin } from 'lucide-react';

const SkillTag = ({ skill }) => (
  <span className="bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
    {skill}
  </span>
);

function CandidateCard({ candidate }) {
  // Data dummy sebagai placeholder jika tidak ada di API
  // const jobTitle = candidate.job_title || 'Senior Frontend Developer';
  const experience = candidate.experience || '5 years experience';
  const university = candidate.university || 'Stanford University';
  // const location = candidate.location || 'San Francisco, CA';
  const currentCompany = candidate.current_company || 'TechCorp';
  const gpa = candidate.gpa || '3.8';

  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];

  const skillsToShow = skills.slice(0, 3);
  const remainingSkills = skills.length > 3 ? skills.length - 3 : 0;


  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex items-center justify-between transition-all hover:shadow-xl hover:scale-[1.01]">
      <div className="flex items-center gap-5">
        <img
          src={`https://api.dicebear.com/8.x/initials/svg?seed=${candidate.name}`}
          alt={candidate.name}
          className="w-20 h-20 rounded-full border-2 border-gray-200"
        />

        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-gray-800">{candidate.name}</h2>
            <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-md">
              {candidate.match_score}% Match
            </span>
          </div>

          {/* <p className="text-md text-gray-600 font-medium">{jobTitle}</p> */}
          <p className="text-sm text-gray-500 mt-1">
            {experience} &bull; {university}
          </p>

          <div className="mt-3 flex items-center flex-wrap">
            {skillsToShow.map((skill, index) => <SkillTag key={index} skill={skill} />)}
            {remainingSkills > 0 && <span className="text-sm text-blue-600 font-semibold ml-1">+{remainingSkills} more</span>}
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 border-t pt-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-gray-400" />
              <span>Last work at <strong>{currentCompany}</strong></span>
            </div>
            {/* INI BAGIAN YANG DIPERBAIKI: Menggunakan ikon MapPin */}
            {/* <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <span>{location}</span>
            </div> */}
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-gray-400" />
              <span>GPA: <strong>{gpa}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-gray-400" />
              <span>{candidate.status?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
          View Profile
        </button>
        <button className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg font-semibold text-sm border border-gray-300 hover:bg-gray-200 transition-colors">
          + Add to Job
        </button>
      </div>
    </div>
  );
}

export default CandidateCard;