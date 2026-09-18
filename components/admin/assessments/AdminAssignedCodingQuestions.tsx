"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type CodingQuestionRow = {
  id?: string;
  question_text?: string;
  points?: number | null;
  difficulty?: string | null;
  explanation?: string | null;
  is_ai_generated?: boolean;
  question_metadata?: Record<string, any> | null;
};

function MetaBlock({
  title,
  value,
}: {
  title: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-2.5 font-mono text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200">
        {value}
      </pre>
    </div>
  );
}

function CodingQuestionCard({
  question,
  index,
  defaultOpen = true,
}: {
  question: CodingQuestionRow;
  index: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const meta =
    question.question_metadata && typeof question.question_metadata === "object"
      ? question.question_metadata
      : {};
  const description =
    (typeof meta.description === "string" && meta.description.trim()) ||
    null;
  const sampleInput =
    (typeof meta.sample_input === "string" && meta.sample_input) || "";
  const sampleOutput =
    (typeof meta.sample_output === "string" && meta.sample_output) || "";
  const publicTests = Array.isArray(meta.test_cases)
    ? meta.test_cases.filter((tc: any) => tc && tc.is_public === true).slice(0, 5)
    : [];
  // If flags missing, show first few cases as examples
  const examples =
    publicTests.length > 0
      ? publicTests
      : Array.isArray(meta.test_cases)
        ? meta.test_cases.slice(0, 3)
        : [];
  const isAi = Boolean(question.is_ai_generated);

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {index + 1}. {question.question_text || meta.title || "Coding problem"}
            </span>
            <span
              className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                isAi
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
              }`}
            >
              {isAi ? "AI" : "Bank / Manual"}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {question.points ?? 100} pts · {question.difficulty || meta.difficulty || "—"}
            {Array.isArray(meta.allowed_languages) && meta.allowed_languages.length > 0
              ? ` · ${meta.allowed_languages.join(", ")}`
              : ""}
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-400 mt-1" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 mt-1" />
        )}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2 dark:border-gray-700">
          {description ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Description
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {description}
              </p>
            </div>
          ) : (
            <p className="text-xs italic text-gray-400">No description stored for this problem.</p>
          )}

          <MetaBlock title="Input Format" value={meta.input_format} />
          <MetaBlock title="Output Format" value={meta.output_format} />
          <MetaBlock title="Constraints" value={meta.constraints} />

          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Sample Input / Output
            </p>
            {!sampleInput && !sampleOutput ? (
              <p className="mt-1 text-xs italic text-gray-400">Not provided</p>
            ) : (
              <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Sample Input
                  </p>
                  <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-2.5 font-mono text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200">
                    {sampleInput || "—"}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Sample Output
                  </p>
                  <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 font-mono text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                    {sampleOutput || "—"}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {examples.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Public test cases ({examples.length})
              </p>
              <div className="mt-1 space-y-2">
                {examples.map((tc: any, i: number) => (
                  <div
                    key={tc.id || i}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 font-mono text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200"
                  >
                    <div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300">
                        In:{" "}
                      </span>
                      <span className="whitespace-pre-wrap">{tc.input || "—"}</span>
                    </div>
                    <div className="mt-1">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        Out:{" "}
                      </span>
                      <span className="whitespace-pre-wrap">
                        {tc.expected_output || "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(question.explanation || meta.explanation) && (
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5 text-xs text-gray-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-gray-300">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Explanation:{" "}
              </span>
              {question.explanation || meta.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Admin list of assigned coding problems with full statement + sample I/O. */
export function AdminAssignedCodingQuestions({
  questions,
}: {
  questions: CodingQuestionRow[];
}) {
  if (!questions?.length) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Assigned ({questions.length})
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Expand each problem to review description, sample input, and sample output.
      </p>
      {questions.map((q, idx) => (
        <CodingQuestionCard
          key={q.id || `${idx}-${q.question_text}`}
          question={q}
          index={idx}
          defaultOpen
        />
      ))}
    </div>
  );
}
