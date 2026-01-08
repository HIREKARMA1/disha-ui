"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentForm } from "@/components/admin/AssessmentForm";
import { ChevronLeft } from "lucide-react";

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/v1/admin/assessments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create assessment");
      }

      const created = await response.json();
      alert("Assessment created successfully!");
      router.push("/admin/assessments");
    } catch (err: any) {
      setError(err.message || "Error creating assessment");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft size={20} />
          Back to Assessments
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Create New Assessment</h1>
          <p className="text-gray-600 mt-2">Set up a comprehensive assessment with multiple rounds</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Form */}
        <AssessmentForm onSubmit={handleSubmit} loading={loading} mode="create" />
      </div>
    </div>
  );
}
