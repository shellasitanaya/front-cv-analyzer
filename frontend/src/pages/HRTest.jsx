import React from "react";
import Layout from "../components/Layout";

export default function HRTest() {
  return (
    <Layout>
      <div className="p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold text-[#343F3E] mb-4">HR Test Page</h1>
        <p className="text-[#505A5B]">Accessible by HR and Admin roles only.</p>
      </div>
    </Layout>
  );
}
