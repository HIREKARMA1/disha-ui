"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Send } from "lucide-react";

interface AssessmentListProps {
  assessments: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onPublish: (id: string) => void;
  loading: boolean;
}

export function AssessmentList({
  assessments,
  onEdit,
  onDelete,
  onView,
  onPublish,
  loading,
}: AssessmentListProps) {
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      DRAFT: "bg-gray-200 text-gray-800",
      ACTIVE: "bg-green-200 text-green-800",
      PAUSED: "bg-yellow-200 text-yellow-800",
      COMPLETED: "bg-blue-200 text-blue-800",
      ARCHIVED: "bg-red-200 text-red-800",
    };

    return statusStyles[status as keyof typeof statusStyles] || "bg-gray-200";
  };

  const getModeStyles = (mode: string) => {
    const modeStyles = {
      HIRING: "text-purple-600",
      UNIVERSITY: "text-blue-600",
      CORPORATE: "text-orange-600",
      ADMIN: "text-gray-600",
    };

    return modeStyles[mode as keyof typeof modeStyles] || "text-gray-600";
  };

  if (loading) {
    return <div className="text-center py-8">Loading assessments...</div>;
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-gray-500 mb-4">No assessments found</p>
        <p className="text-gray-400 text-sm">Create your first assessment to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mode</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rounds</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {assessments.map((assessment) => (
            <tr key={assessment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{assessment.assessment_name}</p>
                  <p className="text-sm text-gray-500">{assessment.disha_assessment_id}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`font-medium ${getModeStyles(assessment.mode)}`}>
                  {assessment.mode}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(assessment.status)}`}>
                  {assessment.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">{assessment.round_count} rounds</td>
              <td className="px-6 py-4 text-sm">{assessment.total_duration_minutes} min</td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(assessment.id)}
                    className="p-2 hover:bg-blue-100 text-blue-600 rounded"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(assessment.id)}
                    className="p-2 hover:bg-yellow-100 text-yellow-600 rounded"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  {assessment.status === "DRAFT" && !assessment.is_published_to_solviq && (
                    <button
                      onClick={() => onPublish(assessment.id)}
                      className="p-2 hover:bg-green-100 text-green-600 rounded"
                      title="Publish to SOLVIQ"
                    >
                      <Send size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(assessment.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
