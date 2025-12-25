import React from "react";
import Layout from "../../components/Layout";
import SearchBar from "../../features/hr/SearchBar";

export default function HRTest() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header Halaman */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#343F3E] mb-2">
              HR Candidate Search
            </h1>
            <p className="text-[#505A5B] text-lg">
              Find the best candidates based on skills, experience, and fit values.
            </p>
          </div>

          {/* Komponen Search */}
          <SearchBar />
        </div>
      </div>
    </Layout>
  );
}
