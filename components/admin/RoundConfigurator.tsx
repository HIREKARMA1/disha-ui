"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  IntegerTextField,
  parseIntegerField,
} from "@/components/ui/integer-text-field";
import { MIN_QUESTIONS_PER_ROUND } from "@/lib/validations/assessment";

interface Round {
  id?: string;
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
  { value: "mcq", label: "MCQ based Question" },
  { value: "soft_skills", label: "Soft Skills" },
  { value: "technical_mcq", label: "Technical MCQ" },
  // { value: "coding", label: "Coding Challenge" },
  // { value: "group_discussion", label: "Group Discussion" },
  // { value: "technical_interview", label: "Technical Interview" },
  // { value: "hr_interview", label: "HR Interview" },
];

const MAX_QUESTIONS = 100;
const MAX_DURATION = 600;
const MAX_GD_ROUNDS = 50;

const getRoundTypeLabel = (type: string) => {
  return ROUND_TYPES.find((t) => t.value === type)?.label || type;
};

const inputClassName =
  "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none";

const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";

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
        ai_question_count: 35,
        difficulty: "medium",
        topic: "",
      },
      is_mandatory: true,
    };
    onRoundsChange([...rounds, newRound]);
  };

  const removeRound = (index: number) => {
    const updated = rounds.filter((_, i) => i !== index);
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assessment Rounds</h3>
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
          <div key={round.id || `round-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
            {editingRound === index ? (
              <RoundEditor
                round={round}
                onSave={(updated: Round) => updateRound(index, updated)}
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
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center bg-gray-50/50 dark:bg-gray-900/30">
          <p className="text-gray-500 dark:text-gray-300">No rounds added yet</p>
          <p className="text-gray-400 dark:text-gray-300 text-sm mt-2">Click "Add Round" to start configuring</p>
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
          <span className="inline-block w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
            {round.round_number}
          </span>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{round.round_name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {getRoundTypeLabel(round.round_type)} • {round.duration_minutes} min
              {round.round_type !== "group_discussion" &&
                ` • ${round.config.num_questions || 0} questions` +
                  (round.config.ai_question_count != null
                    ? ` (${round.config.ai_question_count} AI / ${Math.max(0, (round.config.num_questions || 0) - (round.config.ai_question_count || 0))} manual)`
                    : "")}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

function RoundEditor({
  round,
  onSave,
  onCancel,
}: {
  round: Round;
  onSave: (updated: Round) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Round>(round);
  const [topicError, setTopicError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const topicRequired =
    formData.round_type === "mcq" || formData.round_type === "technical_mcq";

  const numQuestionsValue =
    formData.config.num_questions === null ||
    formData.config.num_questions === undefined ||
    formData.config.num_questions === ""
      ? null
      : Number(formData.config.num_questions);

  const aiMax =
    numQuestionsValue !== null && Number.isFinite(numQuestionsValue)
      ? numQuestionsValue
      : MAX_QUESTIONS;

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
      if (configField === "topic") setTopicError("");
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
      if (field === "round_type") setTopicError("");
    }
  };

  const setFieldError = (key: string, msg: string) => {
    setFieldErrors((prev) => {
      if (!msg) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: msg };
    });
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    const topic = String(formData.config.topic || "").trim();
    if (topicRequired && !topic) {
      setTopicError(
        formData.round_type === "mcq"
          ? "Topic is required for MCQ based Question rounds (e.g. Java, SQL)."
          : "Topic is required for Technical MCQ rounds (e.g. Java, Data Structures).",
      );
      return;
    }

    const duration = parseIntegerField(formData.duration_minutes, {
      min: 1,
      max: MAX_DURATION,
    });
    if (duration === null) {
      errors.duration_minutes = `Duration must be a whole number from 1 to ${MAX_DURATION}`;
    }

    let numQuestions: number | null = null;
    let aiCount: number | null = null;
    let numberOfRounds: number | null = null;

    if (formData.round_type === "group_discussion") {
      numberOfRounds = parseIntegerField(formData.config.number_of_rounds, {
        min: 1,
        max: MAX_GD_ROUNDS,
      });
      if (numberOfRounds === null) {
        errors.number_of_rounds = `Number of rounds must be a whole number from 1 to ${MAX_GD_ROUNDS}`;
      }
    } else {
      numQuestions = parseIntegerField(formData.config.num_questions, {
        min: MIN_QUESTIONS_PER_ROUND,
        max: MAX_QUESTIONS,
      });
      if (numQuestions === null) {
        errors.num_questions = `Total questions must be a whole number from ${MIN_QUESTIONS_PER_ROUND} to ${MAX_QUESTIONS}`;
      } else {
        const aiRaw = formData.config.ai_question_count;
        if (aiRaw === null || aiRaw === undefined || aiRaw === "") {
          aiCount = numQuestions;
        } else {
          aiCount = parseIntegerField(aiRaw, { min: 0, max: numQuestions });
          if (aiCount === null) {
            errors.ai_question_count = `AI questions must be a whole number from 0 to ${numQuestions}`;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSave({
      ...formData,
      duration_minutes: duration!,
      config: {
        ...formData.config,
        topic,
        ...(formData.round_type === "group_discussion"
          ? { number_of_rounds: numberOfRounds }
          : {
              num_questions: numQuestions,
              ai_question_count: aiCount,
            }),
      },
    });
  };

  const inputClass = inputClassName;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClassName}>Round Name</label>
          <input
            type="text"
            value={formData.round_name}
            onChange={(e) => handleChange("round_name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClassName}>Round Type</label>
          <select
            value={formData.round_type}
            onChange={(e) => handleChange("round_type", e.target.value)}
            className={inputClass}
          >
            {ROUND_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName}>
            Duration (minutes)
          </label>
          <IntegerTextField
            value={
              formData.duration_minutes === null ||
              formData.duration_minutes === undefined
                ? null
                : Number(formData.duration_minutes)
            }
            min={1}
            max={MAX_DURATION}
            placeholder="e.g. 30"
            className={inputClass}
            error={fieldErrors.duration_minutes}
            onErrorChange={(msg) => setFieldError("duration_minutes", msg)}
            onChange={(n) => handleChange("duration_minutes", n)}
          />
        </div>

        {formData.round_type !== "group_discussion" ? (
          <>
            <div>
              <label className={labelClassName}>
                Total Questions (min {MIN_QUESTIONS_PER_ROUND})
              </label>
              <IntegerTextField
                value={
                  Number.isFinite(numQuestionsValue as number)
                    ? (numQuestionsValue as number)
                    : null
                }
                min={MIN_QUESTIONS_PER_ROUND}
                max={MAX_QUESTIONS}
                placeholder={`e.g. ${MIN_QUESTIONS_PER_ROUND}`}
                className={inputClass}
                error={fieldErrors.num_questions}
                onErrorChange={(msg) => setFieldError("num_questions", msg)}
                onChange={(n) => {
                  const prevAi = formData.config.ai_question_count;
                  let nextAi = prevAi;
                  if (n !== null) {
                    const aiNum = parseIntegerField(prevAi, { min: 0, max: n });
                    nextAi =
                      aiNum !== null
                        ? aiNum
                        : prevAi === null ||
                            prevAi === undefined ||
                            prevAi === ""
                          ? n
                          : Math.min(
                              Number(prevAi) || 0,
                              n,
                            );
                  }
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      num_questions: n,
                      ai_question_count: nextAi,
                    },
                  });
                  setFieldError("num_questions", "");
                }}
              />
            </div>
            <div>
              <label className={labelClassName}>
                AI-generated Questions
              </label>
              <IntegerTextField
                value={
                  formData.config.ai_question_count === null ||
                  formData.config.ai_question_count === undefined ||
                  formData.config.ai_question_count === ""
                    ? null
                    : Number(formData.config.ai_question_count)
                }
                min={0}
                max={aiMax}
                placeholder="e.g. 5"
                className={inputClass}
                error={fieldErrors.ai_question_count}
                onErrorChange={(msg) => setFieldError("ai_question_count", msg)}
                onChange={(n) => handleChange("config.ai_question_count", n)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Manual slots:{" "}
                {Math.max(
                  0,
                  (Number(formData.config.num_questions) || 0) -
                    (formData.config.ai_question_count === null ||
                    formData.config.ai_question_count === undefined ||
                    formData.config.ai_question_count === ""
                      ? Number(formData.config.num_questions) || 0
                      : Number(formData.config.ai_question_count) || 0),
                )}{" "}
                — add after create.
              </p>
            </div>
          </>
        ) : (
          <div>
            <label className={labelClassName}>
              Number of Rounds
            </label>
            <IntegerTextField
              value={
                formData.config.number_of_rounds === null ||
                formData.config.number_of_rounds === undefined ||
                formData.config.number_of_rounds === ""
                  ? null
                  : Number(formData.config.number_of_rounds)
              }
              min={1}
              max={MAX_GD_ROUNDS}
              placeholder="e.g. 5"
              className={inputClass}
              error={fieldErrors.number_of_rounds}
              onErrorChange={(msg) => setFieldError("number_of_rounds", msg)}
              onChange={(n) => handleChange("config.number_of_rounds", n)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Number of speaking turns for the candidate
            </p>
          </div>
        )}
        <div>
          <label className={labelClassName}>Difficulty</label>
          <select
            value={formData.config.difficulty}
            onChange={(e) => handleChange("config.difficulty", e.target.value)}
            className={inputClass}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className={labelClassName}>
            Topic{topicRequired ? " *" : ""}
          </label>
          <input
            type="text"
            value={formData.config.topic || ""}
            onChange={(e) => handleChange("config.topic", e.target.value)}
            required={topicRequired}
            placeholder={
              formData.round_type === "aptitude"
                ? "e.g. percentages, time and work, logical reasoning"
                : formData.round_type === "technical_mcq" || formData.round_type === "mcq"
                  ? "e.g. Java, Python, SQL, Data Structures"
                  : formData.round_type === "soft_skills"
                    ? "e.g. communication, teamwork, leadership"
                    : "e.g. topic focus for this round"
            }
            className={`${inputClass} ${topicError ? "border-red-500" : ""}`}
          />
          {topicError ? (
            <p className="text-xs text-red-600 mt-1">{topicError}</p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.round_type === "aptitude"
                ? "Optional aptitude sub-area (percentages, ratios, etc.). Questions stay aptitude-only — not programming."
                : formData.round_type === "mcq"
                  ? "Required. AI generates MCQs only for this subject (e.g. Java vs SQL produce different sets)."
                  : formData.round_type === "technical_mcq"
                    ? "Required. Technical MCQs are generated strictly for this subject."
                    : formData.round_type === "soft_skills"
                      ? "Optional workplace theme for soft-skills questions."
                      : "Questions are generated to match this round type and topic."}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Round
        </button>
      </div>
    </div>
  );
}
