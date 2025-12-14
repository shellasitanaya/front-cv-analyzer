import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "lucide-react";

export default function CompareCandidates() {
  const navigate = useNavigate();
  const location = useLocation();
  const candidates = location.state?.candidates || [];

  if (candidates.length < 2) {
    return (
      <div className="p-8">
        <p className="text-gray-700 text-lg">Select at least two candidates.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline mb-6"
      >
        ← Back to Ranking
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Candidate Comparison
      </h1>

      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${candidates.length}, minmax(280px, 1fr))`
        }}
      >
        {candidates.map((c) => {
          const score = c.match_score || 0;
          const experience = c.total_experience || 0;
          const gpa = c.gpa || "-";
          const skills = c.skills || [];

          let scoreColor = "text-green-600";
          if (score < 50) scoreColor = "text-red-600";
          else if (score < 75) scoreColor = "text-yellow-600";

          return (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-md p-5 border"
            >
              {/* HEADER */}
              <div className="flex items-center gap-3 mb-4">
                <User size={40} className="text-gray-500" />
                <div>
                  <p className="font-bold text-gray-800 text-lg">{c.name}</p>
                  <p className="text-gray-600 text-sm">{c.email}</p>
                </div>
              </div>

              {/* MATCH SCORE */}
              <div className="mb-4">
                <p className={`font-bold text-2xl ${scoreColor}`}>{score}%</p>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {/* EDUCATION */}
              <div className="mb-4">
                <p className="font-bold text-gray-800">Education</p>
                <p className="text-gray-600">{c.education || "-"}</p>
                <p className="text-sm text-gray-500">GPA: {gpa}</p>
              </div>

              {/* EXPERIENCE */}
              <div className="mb-4">
                <p className="font-bold text-gray-800">Experience</p>
                <p className="text-gray-600">{experience} years</p>
              </div>

              {/* SKILLS */}
              <div className="mb-4">
                <p className="font-bold text-gray-800 mb-1">Skills</p>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 6).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                      >
                        {s}
                      </span>
                    ))}
                    {skills.length > 6 && (
                      <span className="text-xs text-gray-500">
                        +{skills.length - 6}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No skills listed</p>
                )}
              </div>

              {/* AI ANALYSIS */}
              <div>
                <p className="font-bold text-gray-800 mb-1">Reasoning</p>
                <p className="text-gray-600 text-sm italic leading-snug">
                  {c.scoring_reason || "No reasoning available"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}