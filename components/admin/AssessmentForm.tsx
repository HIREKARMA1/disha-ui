"use client";

import React, { useState } from "react";
import { RoundConfigurator } from "./RoundConfigurator";

interface AssessmentFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading: boolean;
  mode: "create" | "edit";
}

const MODES = [
  { value: "HIRING", label: "Hiring Assessment" },
  { value: "UNIVERSITY", label: "University Assessment" },
  { value: "CORPORATE", label: "Corporate Assessment" },
  { value: "ADMIN", label: "Admin Assessment" },
];

export function AssessmentForm({ initialData, onSubmit, loading, mode }: AssessmentFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      assessment_name: "",
      mode: "HIRING",
      description: "",
      instructions: "",
      total_duration_minutes: 240,
      auto_submit_on_timeout: true,
      time_window: {
        start_time: "",
        end_time: "",
      },
      university_id: "",
      corporate_id: "",
      rounds: [],
      metadata: {
        disha_assessment_id: "",
        description: "",
        instructions: "",
        callback_url: "",
        passing_criteria: {
          overall_percentage: 70,
          minimum_round_scores: {},
        },
      },
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleTimeChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      time_window: {
        ...formData.time_window,
        [field]: value,
      },
    });
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [field]: value,
      },
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.assessment_name) newErrors.assessment_name = "Assessment name is required";
    if (!formData.metadata.disha_assessment_id) newErrors.disha_id = "DISHA Assessment ID is required";
    if (!formData.time_window.start_time) newErrors.start_time = "Start time is required";
    if (!formData.time_window.end_time) newErrors.end_time = "End time is required";
    if (formData.rounds.length === 0) newErrors.rounds = "At least one round is required";

    if (formData.time_window.start_time && formData.time_window.end_time) {
      const start = new Date(formData.time_window.start_time);
      const end = new Date(formData.time_window.end_time);
      if (start >= end) {
        newErrors.timeWindow = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Basic Information */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Name *
            </label>
            <input
              type="text"
              value={formData.assessment_name}
              onChange={(e) => handleChange("assessment_name", e.target.value)}
              placeholder="e.g., Software Engineer Assessment"
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.assessment_name ? "border-red-500" : ""
              }`}
            />
            {errors.assessment_name && (
              <p className="text-red-500 text-sm mt-1">{errors.assessment_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode *</label>
            <select
              value={formData.mode}
              onChange={(e) => handleChange("mode", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DISHA Assessment ID *
            </label>
            <input
              type="text"
              value={formData.metadata.disha_assessment_id}
              onChange={(e) => handleMetadataChange("disha_assessment_id", e.target.value)}
              placeholder="e.g., DASM-2024-001"
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.disha_id ? "border-red-500" : ""
              }`}
            />
            {errors.disha_id && <p className="text-red-500 text-sm mt-1">{errors.disha_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={formData.total_duration_minutes}
              onChange={(e) => handleChange("total_duration_minutes", parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {formData.mode === "UNIVERSITY" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University ID
              </label>
              <input
                type="text"
                value={formData.university_id}
                onChange={(e) => handleChange("university_id", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          )}

          {formData.mode === "CORPORATE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corporate ID
              </label>
              <input
                type="text"
                value={formData.corporate_id}
                onChange={(e) => handleChange("corporate_id", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.metadata.description}
            onChange={(e) => handleMetadataChange("description", e.target.value)}
            placeholder="Brief description of this assessment..."
            rows={3}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Time Window */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-2xl font-bold mb-6">Time Window</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <input
              type="datetime-local"
              value={formData.time_window.start_time}
              onChange={(e) => handleTimeChange("start_time", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.start_time ? "border-red-500" : ""
              }`}
            />
            {errors.start_time && (
              <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <input
              type="datetime-local"
              value={formData.time_window.end_time}
              onChange={(e) => handleTimeChange("end_time", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.end_time ? "border-red-500" : ""
              }`}
            />
            {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
          </div>
        </div>

        {errors.timeWindow && (
          <p className="text-red-500 text-sm mt-4">{errors.timeWindow}</p>
        )}

        <div className="mt-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.auto_submit_on_timeout}
              onChange={(e) => handleChange("auto_submit_on_timeout", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Auto-submit assessment when time expires
            </span>
          </label>
        </div>
      </div>

      {/* Rounds Configuration */}
      <div className="bg-white rounded-lg p-6 border">
        <RoundConfigurator
          rounds={formData.rounds}
          onRoundsChange={(rounds) => handleChange("rounds", rounds)}
        />
        {errors.rounds && <p className="text-red-500 text-sm mt-4">{errors.rounds}</p>}
      </div>

      {/* Passing Criteria */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-2xl font-bold mb-6">Passing Criteria</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Passing Percentage (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.metadata.passing_criteria.overall_percentage}
              onChange={(e) =>
                handleMetadataChange("passing_criteria", {
                  ...formData.metadata.passing_criteria,
                  overall_percentage: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Instructions & Callback */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-2xl font-bold mb-6">Additional Settings</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
          <textarea
            value={formData.metadata.instructions}
            onChange={(e) => handleMetadataChange("instructions", e.target.value)}
            placeholder="Assessment instructions for students..."
            rows={3}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">SOLVIQ Callback URL</label>
          <input
            type="url"
            value={formData.metadata.callback_url}
            onChange={(e) => handleMetadataChange("callback_url", e.target.value)}
            placeholder="https://disha.example.com/api/v1/assessments/callback"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-2">
            URL where SOLVIQ will send assessment results
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : mode === "create" ? "Create Assessment" : "Update Assessment"}
        </button>
      </div>
    </form>
  );
}
