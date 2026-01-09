"use client";

import React, { useState, useEffect } from "react";
import { RoundConfigurator } from "./RoundConfigurator";
import { FileText, Settings, Layers, Briefcase } from "lucide-react";

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
  const defaultValues = {
    assessment_name: "",
    mode: "HIRING",
    // description: "", // Moved to metadata
    // instructions: "", // Moved to metadata
    total_duration_minutes: 0,
    auto_submit_on_timeout: true,
    time_window: {
      start_time: "",
      end_time: "",
    },
    // university_id: "", // Removed
    // corporate_id: "", // Removed
    rounds: [],
    metadata: {
      disha_assessment_id: "", // Managed automatically
      description: "",
      instructions: "",
      callback_url: "",
      passing_criteria: {
        overall_percentage: 70,
        minimum_round_scores: {},
      },
    },
    job_id: "", // Field for linking to a job (kept for UI valid checking but will be moved to metadata on submit)
  };

  const [formData, setFormData] = useState({
    ...defaultValues,
    ...initialData,
    // Ensure nested objects are also merged properly if initialData has partial nested objects
    metadata: {
      ...defaultValues.metadata,
      ...(initialData?.metadata || {}),
    },
    time_window: {
      ...defaultValues.time_window,
      ...(initialData?.time_window || {}),
    }
  });

  // ... defaultValues and state definition ...

  // Sync with initialData changes (e.g. when job title is fetched)
  useEffect(() => {
    if (initialData) {
      setFormData((prev: any) => ({
        ...prev,
        ...initialData,
        metadata: {
          ...prev.metadata,
          ...(initialData.metadata || {}),
        },
        time_window: {
          ...prev.time_window,
          ...(initialData.time_window || {}),
        }
      }));
    }
  }, [initialData]);

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

    // Calculate total duration from rounds
    const calculatedDuration = formData.rounds.reduce(
      (acc: number, round: any) => acc + (round.duration_minutes || 0),
      0
    );

    // Auto-generate DISHA ID if not present
    const dishaId = formData.metadata.disha_assessment_id || `DASM-${Date.now()}`;

    // Construct strict payload matching the requirement
    const submissionData = {
      assessment_name: formData.assessment_name,
      mode: formData.mode,
      time_window: formData.time_window,
      total_duration_minutes: calculatedDuration > 0 ? calculatedDuration : 60,
      auto_submit_on_timeout: formData.auto_submit_on_timeout,
      rounds: formData.rounds,
      metadata: {
        ...formData.metadata,
        disha_assessment_id: dishaId,
        passing_criteria: {
          ...formData.metadata.passing_criteria,
          // Include job_id in passing_criteria if present
          ...(formData.job_id ? { job_id: formData.job_id } : {})
        }
      }
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {/* 1. Basic Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText size={18} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Basic Details</h2>
          </div>

          {formData.job_id && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
              <Briefcase size={14} />
              <span className="font-medium">Linked to Job: {formData.job_id.substring(0, 8)}...</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Name & Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.assessment_name}
                onChange={(e) => handleChange("assessment_name", e.target.value)}
                placeholder="e.g., Full Stack Developer Assessment"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${errors.assessment_name ? "border-red-500 bg-red-50/10" : "border-gray-200"
                  }`}
              />
              {errors.assessment_name && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  {errors.assessment_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode <span className="text-red-500">*</span></label>
              <select
                value={formData.mode}
                onChange={(e) => handleChange("mode", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer"
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.metadata.description}
              onChange={(e) => handleMetadataChange("description", e.target.value)}
              placeholder="Brief description of this assessment..."
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
            />
          </div>

          {/* Time & Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.time_window.start_time}
                onChange={(e) => handleTimeChange("start_time", e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer ${errors.start_time ? "border-red-500" : "border-gray-200"
                  }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.time_window.end_time}
                onChange={(e) => handleTimeChange("end_time", e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer ${errors.end_time ? "border-red-500" : "border-gray-200"
                  }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Percentage (%)
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>
          {(errors.start_time || errors.end_time || errors.timeWindow) && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
              {errors.start_time || errors.end_time || errors.timeWindow}
            </div>
          )}

          {/* Conditional ID Inputs */}
          {/* Inputs removed as they are not needed for this flow */}
        </div>
      </div>

      {/* 2. Rounds Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
            <Layers size={18} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Rounds Configuration</h2>
        </div>
        <div className="p-6">
          <RoundConfigurator
            rounds={formData.rounds}
            onRoundsChange={(rounds) => handleChange("rounds", rounds)}
          />
          {errors.rounds && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errors.rounds}
            </div>
          )}
        </div>
      </div>

      {/* 3. Settings & Policy */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
            <Settings size={18} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Settings & Policy</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Auto-submit */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <input
              type="checkbox"
              id="auto_submit"
              checked={formData.auto_submit_on_timeout}
              onChange={(e) => handleChange("auto_submit_on_timeout", e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <label htmlFor="auto_submit" className="text-sm font-medium text-gray-900 cursor-pointer">
                Auto-submit on Timeout
              </label>
              <p className="text-xs text-gray-500">Automatically submit the assessment when the timer reaches zero.</p>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions for Students</label>
            <textarea
              value={formData.metadata.instructions}
              onChange={(e) => handleMetadataChange("instructions", e.target.value)}
              placeholder="Enter detailed instructions for the students..."
              rows={4}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">These instructions will be displayed to students before they start the assessment.</p>
          </div>

          {/* Callback URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SOLVIQ Callback URL <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
            <div className="relative">
              <input
                type="url"
                value={formData.metadata.callback_url}
                onChange={(e) => handleMetadataChange("callback_url", e.target.value)}
                placeholder="https://disha.example.com/api/v1/assessments/callback"
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-mono text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Custom webhook URL where SOLVIQ will send the assessment results.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="flex justify-end pt-4 pb-12">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Processing...
            </span>
          ) : (
            mode === "create" ? "Create Assessment" : "Update Assessment"
          )}
        </button>
      </div>
    </form>
  );
}
