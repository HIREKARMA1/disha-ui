"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface Round {
  round_number: number;
  round_type: string;
  round_name: string;
  duration_minutes: number;
  config: Record<string, any>;
  is_mandatory: boolean;
  passing_percentage?: number;
}

interface RoundConfiguratorProps {
  rounds: Round[];
  onRoundsChange: (rounds: Round[]) => void;
}

const ROUND_TYPES = [
  { value: "aptitude", label: "Aptitude Test" },
  { value: "soft_skills", label: "Soft Skills" },
  { value: "technical_mcq", label: "Technical MCQ" },
  { value: "coding", label: "Coding Challenge" },
  { value: "group_discussion", label: "Group Discussion" },
  { value: "technical_interview", label: "Technical Interview" },
  { value: "hr_interview", label: "HR Interview" },
];

const getRoundTypeLabel = (type: string) => {
  return ROUND_TYPES.find((t) => t.value === type)?.label || type;
};

export function RoundConfigurator({ rounds, onRoundsChange }: RoundConfiguratorProps) {
  const [editingRound, setEditingRound] = useState<number | null>(null);

  const addRound = () => {
    const newRound: Round = {
      round_number: rounds.length + 1,
      round_type: "aptitude",
      round_name: "New Round",
      duration_minutes: 30,
      config: {
        num_questions: 35,
        difficulty: "medium",
        topic: "",
      },
      is_mandatory: true,
    };
    onRoundsChange([...rounds, newRound]);
  };

  const removeRound = (index: number) => {
    const updated = rounds.filter((_, i) => i !== index);
    // Reorder round numbers
    updated.forEach((r, i) => {
      r.round_number = i + 1;
    });
    onRoundsChange(updated);
  };

  const updateRound = (index: number, updated: Round) => {
    const newRounds = [...rounds];
    newRounds[index] = updated;
    onRoundsChange(newRounds);
    setEditingRound(null);
  };



  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assessment Rounds</h3>
        <button
          type="button"
          onClick={addRound}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Round
        </button>
      </div>

      <div className="space-y-3">
        {rounds.map((round, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            {editingRound === index ? (
              <RoundEditor
                round={round}
                onSave={(updated) => updateRound(index, updated)}
                onCancel={() => setEditingRound(null)}
              />
            ) : (
              <RoundPreview
                round={round}
                onEdit={() => setEditingRound(index)}
                onRemove={() => removeRound(index)}
              />
            )}
          </div>
        ))}
      </div>

      {rounds.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <p className="text-gray-500">No rounds added yet</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add Round" to start configuring</p>
        </div>
      )}
    </div>
  );
}

function RoundPreview({ round, onEdit, onRemove }: any) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            {round.round_number}
          </span>
          <div>
            <h4 className="font-semibold text-gray-900">{round.round_name}</h4>
            <p className="text-sm text-gray-600">
              {getRoundTypeLabel(round.round_type)}  {round.duration_minutes} min{round.round_type !== 'group_discussion' && `  ${round.config.num_questions || 0} questions`}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

function RoundEditor({ round, onSave, onCancel }: any) {
  const [formData, setFormData] = useState<Round>(round);

  const handleChange = (field: string, value: any) => {
    if (field.startsWith("config.")) {
      const configField = field.replace("config.", "");
      setFormData({
        ...formData,
        config: {
          ...formData.config,
          [configField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Round Name</label>
          <input
            type="text"
            value={formData.round_name}
            onChange={(e) => handleChange("round_name", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Round Type</label>
          <select
            value={formData.round_type}
            onChange={(e) => handleChange("round_type", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {ROUND_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <input
            type="number"
            min="1"
            value={formData.duration_minutes}
            onChange={(e) => handleChange("duration_minutes", parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        {/* Hide "Number of Questions" for Group Discussion rounds, show "Number of Rounds" instead */}
        {formData.round_type !== 'group_discussion' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
            <input
              type="number"
              min="1"
              value={formData.config.num_questions}
              onChange={(e) => handleChange("config.num_questions", parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rounds</label>
            <input
              type="number"
              min="1"
              value={formData.config.number_of_rounds || 5}
              onChange={(e) => handleChange("config.number_of_rounds", parseInt(e.target.value))}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Number of speaking turns for the candidate</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select
            value={formData.config.difficulty}
            onChange={(e) => handleChange("config.difficulty", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <input
            type="text"
            value={formData.config.topic || ""}
            onChange={(e) => handleChange("config.topic", e.target.value)}
            placeholder="e.g. Java, Data Structures, General Aptitude"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passing Percentage (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.passing_percentage || 60}
            onChange={(e) => handleChange("passing_percentage", parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div> */}
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Round
        </button>
      </div>
    </div>
  );
}