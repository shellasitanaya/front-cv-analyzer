import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

function UserTest() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    { id: "modern", name: "Modern", img: "/templates/modern.png" },
    { id: "classic", name: "Classic", img: "/templates/classic.png" },
    { id: "minimalist", name: "Minimalist", img: "/templates/minimalist.png" },
  ];

  const handleNext = () => {
    if (!selectedTemplate) {
      alert("Pilih template terlebih dahulu!");
      return;
    }
    navigate("/fill-data", { state: { template: selectedTemplate } });
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-3xl">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
            Pilih Template CV
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedTemplate === tpl.id ? "border-blue-500" : "border-gray-300"
                }`}
                onClick={() => setSelectedTemplate(tpl.id)}
              >
                <img
                  src={tpl.img}
                  alt={tpl.name}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <p className="text-center font-medium text-gray-600">{tpl.name}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!selectedTemplate}
            className={`w-full py-3 rounded-md text-white text-lg font-semibold ${
              selectedTemplate
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Lanjut Isi Data
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default UserTest;