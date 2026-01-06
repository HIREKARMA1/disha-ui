"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentList } from "@/components/admin/AssessmentList";
import { Plus } from "lucide-react";

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchAssessments();
  }, [filter]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/admin/assessments/list?${filter ? `status=${filter}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssessments(data);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    router.push("/admin/assessments/create");
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/assessments/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;

    try {
      const response = await fetch(`/api/v1/admin/assessments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        setAssessments(assessments.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
    }
  };

  const handleView = (id: string) => {
    router.push(`/admin/assessments/${id}`);
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/admin/assessments/${id}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        const updated = await response.json();
        setAssessments(assessments.map((a) => (a.id === id ? updated : a)));
        alert("Assessment published to SOLVIQ successfully!");
      }
    } catch (error) {
      console.error("Error publishing assessment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Assessment Management</h1>
              <p className="text-gray-600 mt-2">Create and manage assessments for SOLVIQ</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              <Plus size={20} />
              Create Assessment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilter("")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === ""
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("DRAFT")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "DRAFT"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "ACTIVE"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "COMPLETED"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Assessment List */}
        <div className="bg-white rounded-lg shadow">
          <AssessmentList
            assessments={assessments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onPublish={handlePublish}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
