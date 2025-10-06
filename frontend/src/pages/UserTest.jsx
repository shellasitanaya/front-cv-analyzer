import React from "react";
import Layout from "../components/Layout";

export default function UserTest() {
  return (
    <Layout>
      <div className="p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold text-[#343F3E] mb-4">User Test Page</h1>
        <p className="text-[#505A5B]">Accessible by User and Admin roles only.</p>
      </div>
    </Layout>
  );
}
