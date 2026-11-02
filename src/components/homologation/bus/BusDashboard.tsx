import React from "react";
import "./tailwind.generated.css";

const BusDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold text-blue-700">Bus Dashboard</h1>

        <p className="mt-3 text-gray-600">
          This page uses React, TypeScript, and Tailwind CSS.
        </p>

        <button
          type="button"
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => alert("Bus Dashboard is working!")}
        >
          Test button
        </button>
      </div>
    </div>
  );
};

export default BusDashboard;
