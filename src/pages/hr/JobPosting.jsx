import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateJobPosting() {
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    job_title: "",
    job_location: "",
    job_description: "",
    requirements: [],
    min_experience: 0,
    max_experience: 10,
    min_gpa: 0,
    degree_requirements: "Bachelor's",
  });

  const [requirementInput, setRequirementInput] = useState("");

  const handleAddRequirement = () => {
    if (requirementInput.trim() === "") return;
    setJobData({
      ...jobData,
      requirements: [...jobData.requirements, requirementInput],
    });
    setRequirementInput("");
  };

  const handleDeleteRequirement = (index) => {
    const newReqs = jobData.requirements.filter((_, i) => i !== index);
    setJobData({ ...jobData, requirements: newReqs });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/hr/jobs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      alert("Job posted successfully!");
      navigate("/hr-screening");
    } catch (err) {
      alert("Failed to post job.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-8 space-y-8">
        <h1 className="text-2xl font-semibold text-gray-700">Create Job Posting</h1>

        {/* Job Details */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-600">Job Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="e.g. Senior Software Engineer"
              value={jobData.job_title}
              onChange={(e) => setJobData({ ...jobData, job_title: e.target.value })}
            />
          </div>
          <input
            className="border p-2 w-full rounded"
            placeholder="e.g. San Francisco, CA (Remote)"
            value={jobData.job_location}
            onChange={(e) => setJobData({ ...jobData, job_location: e.target.value })}
          />
          <textarea
            className="border p-2 w-full rounded h-24"
            placeholder="Describe the role, responsibilities, and what makes this position unique..."
            value={jobData.job_description}
            onChange={(e) => setJobData({ ...jobData, job_description: e.target.value })}
          />
        </section>

        {/* Requirements */}
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-600">Requirements</h2>
          <div className="flex gap-2">
            <input
              className="border flex-1 p-2 rounded"
              placeholder="Add requirement..."
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
            />
            <button
              onClick={handleAddRequirement}
              className="bg-blue-600 text-white px-3 rounded"
            >
              +
            </button>
          </div>
          <ul className="space-y-2">
            {jobData.requirements.map((req, i) => (
              <li key={i} className="flex justify-between border p-2 rounded bg-blue-50">
                {req}
                <button
                  onClick={() => handleDeleteRequirement(i)}
                  className="text-red-600 font-semibold"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Experience & Education Filters */}
        <section className="space-y-4">
        <h2 className="font-semibold text-gray-600">Experience & Education Filters</h2>

        <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
                Min Experience (Years)
            </label>
            <input
                type="number"
                className="border p-2 rounded"
                placeholder="0"
                value={jobData.min_experience}
                onChange={(e) =>
                setJobData({ ...jobData, min_experience: e.target.value })
                }
            />
            </div>

            <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
                Max Experience (Years)
            </label>
            <input
                type="number"
                className="border p-2 rounded"
                placeholder="10"
                value={jobData.max_experience}
                onChange={(e) =>
                setJobData({ ...jobData, max_experience: e.target.value })
                }
            />
            </div>

            <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
                Minimum GPA
            </label>
            <input
                type="number"
                step="0.1"
                className="border p-2 rounded"
                placeholder="3.0"
                value={jobData.min_gpa}
                onChange={(e) => setJobData({ ...jobData, min_gpa: e.target.value })}
            />
            </div>
        </div>

        <div className="flex gap-4">
            {["High School", "Bachelor's", "Master's", "PhD"].map((degree) => (
            <label key={degree} className="flex items-center gap-2">
                <input
                type="radio"
                name="degree"
                checked={jobData.degree_requirements === degree}
                onChange={() =>
                    setJobData({ ...jobData, degree_requirements: degree })
                }
                />
                {degree}
            </label>
            ))}
        </div>
        </section>


        {/* Job Preview */}
        <section className="space-y-2 border-t pt-4">
          <h2 className="font-semibold text-gray-600">Job Preview</h2>
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold">{jobData.job_title || "Job Title"}</h3>
            <p className="text-sm text-gray-600">
              {jobData.job_location}
            </p>
            <p className="mt-2 text-gray-700">{jobData.job_description}</p>
            <ul className="mt-2 list-disc pl-5">
              {jobData.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button className="border px-4 py-2 rounded" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save & Post Job
          </button>
        </div>
      </div>
    </div>
  );
}