"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Play, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
}) as any;

const LANG_OPTIONS = [
  { key: "python", label: "Python", monaco: "python" },
  { key: "javascript", label: "JavaScript", monaco: "javascript" },
  { key: "typescript", label: "TypeScript", monaco: "typescript" },
  { key: "java", label: "Java", monaco: "java" },
  { key: "cpp", label: "C++", monaco: "cpp" },
  { key: "c", label: "C", monaco: "c" },
  { key: "go", label: "Go", monaco: "go" },
  { key: "rust", label: "Rust", monaco: "rust" },
];

const SAFE_STARTERS: Record<string, string> = {
  python:
    "import sys\ndata = sys.stdin.read().strip()\n# TODO: solve and print answer\n",
  javascript:
    "const fs = require('fs');\nconst data = fs.readFileSync(0, 'utf8').trim();\n// TODO\n",
  typescript:
    "const fs = require('fs');\nconst data: string = fs.readFileSync(0, 'utf8').trim();\n// TODO\n",
  java:
    "import java.util.*;\npublic class Solution {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n  }\n}\n",
  cpp:
    "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  return 0;\n}\n",
  c:
    "#include <stdio.h>\nint main() {\n  return 0;\n}\n",
  go:
    "package main\nimport \"fmt\"\nfunc main() {\n}\n",
  rust:
    "use std::io::{self, Read};\nfn main() {\n  let mut s = String::new();\n  io::stdin().read_to_string(&mut s).unwrap();\n}\n",
};

const selectClass =
  "bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60";

function MetaBlock({
  title,
  value,
  mono = false,
}: {
  title: string;
  value?: string | null;
  mono?: boolean;
}) {
  const empty = !value || !String(value).trim();
  return (
    <section className="mt-4">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      {empty ? (
        <p className="mt-1 text-xs italic text-gray-400">Not provided</p>
      ) : (
        <pre
          className={`mt-1 whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-800 ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </pre>
      )}
    </section>
  );
}

export type CodingExamQuestion = {
  id: string;
  question_text: string;
  points: number;
  question_metadata?: any;
  coding_submitted?: boolean;
  coding_submission?: any;
};

type Props = {
  assessmentId: string;
  attemptId: string;
  question: CodingExamQuestion;
  allCodingQuestions: CodingExamQuestion[];
  onSelectQuestion: (id: string) => void;
  onSubmitted?: (questionId: string, result: any) => void;
  onBusyChange?: (busy: boolean) => void;
};

async function pollJob(
  assessmentId: string,
  attemptId: string,
  jobId: string,
  maxMs = 120000
) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const job = await apiClient.codingJobStatus(assessmentId, attemptId, jobId);
    if (job.status === "completed" || job.status === "failed") return job;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timed out waiting for code execution");
}

export function CodingWorkspace({
  assessmentId,
  attemptId,
  question,
  allCodingQuestions,
  onSelectQuestion,
  onSubmitted,
  onBusyChange,
}: Props) {
  const meta = question.question_metadata || {};
  const allowed = (meta.allowed_languages || ["python"]).map((l: string) =>
    String(l).toLowerCase()
  );
  const langs = LANG_OPTIONS.filter((l) => allowed.includes(l.key));
  const defaultLang = langs[0]?.key || "python";

  const [language, setLanguage] = useState(defaultLang);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [busy, setBusy] = useState(false);
  const [consoleOut, setConsoleOut] = useState<any>(null);
  const [submitted, setSubmitted] = useState(Boolean(question.coding_submitted));
  const [submitSummary, setSubmitSummary] = useState<any>(
    question.coding_submission || null
  );
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    setSubmitted(Boolean(question.coding_submitted));
    setSubmitSummary(question.coding_submission || null);
    setConsoleOut(null);
    setSubmitConfirmOpen(false);
    const starters = meta.starter_code || {};
    const lang = allowed.includes(language) ? language : defaultLang;
    setLanguage(lang);
    if (question.coding_submission?.source_code) {
      setCode(question.coding_submission.source_code);
      if (question.coding_submission.language) {
        setLanguage(question.coding_submission.language);
      }
    } else {
      setCode(starters[lang] || SAFE_STARTERS[lang] || SAFE_STARTERS.python);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const monacoLang = useMemo(
    () => LANG_OPTIONS.find((l) => l.key === language)?.monaco || "python",
    [language]
  );

  const onLanguageChange = (lang: string) => {
    setLanguage(lang);
    const starters = meta.starter_code || {};
    setCode(starters[lang] || SAFE_STARTERS[lang] || SAFE_STARTERS.python);
  };

  const handleRun = useCallback(async () => {
    if (submitted) return;
    try {
      setBusy(true);
      setConsoleOut(null);
      const enqueued = await apiClient.codingRun(assessmentId, attemptId, {
        question_id: question.id,
        language,
        source_code: code,
        stdin: useCustomInput ? customInput : null,
      });
      const job = await pollJob(assessmentId, attemptId, enqueued.job_id);
      if (job.status === "failed") {
        toast.error(job.error_message || "Run failed");
        setConsoleOut({ error: job.error_message });
      } else {
        setConsoleOut(job.result);
        toast.success("Run completed");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || e?.message || "Run failed");
    } finally {
      setBusy(false);
    }
  }, [
    assessmentId,
    attemptId,
    question.id,
    language,
    code,
    useCustomInput,
    customInput,
    submitted,
  ]);

  const requestSubmit = () => {
    if (submitted || busy) return;
    setSubmitConfirmOpen(true);
  };

  const performSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitConfirmOpen(false);
    try {
      setBusy(true);
      const enqueued = await apiClient.codingSubmit(assessmentId, attemptId, {
        question_id: question.id,
        language,
        source_code: code,
      });
      const job = await pollJob(assessmentId, attemptId, enqueued.job_id);
      if (job.status === "failed") {
        toast.error(job.error_message || "Submit failed");
        setConsoleOut({ error: job.error_message });
      } else {
        setConsoleOut(job.result);
        setSubmitted(true);
        setSubmitSummary({
          language,
          source_code: code,
          points_earned: job.result?.points_earned,
          max_points: job.result?.max_points,
          passed: job.result?.passed,
          total: job.result?.total,
        });
        onSubmitted?.(question.id, job.result);
        toast.success(
          `Answer saved: ${job.result?.passed ?? 0}/${job.result?.total ?? 0} tests`
        );
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || e?.message || "Submit failed");
    } finally {
      setBusy(false);
    }
  }, [
    assessmentId,
    attemptId,
    question.id,
    language,
    code,
    submitted,
    onSubmitted,
  ]);

  const publicTests = meta.public_test_cases || [];
  const title = meta.title || question.question_text;
  const description =
    (meta.description && String(meta.description).trim()) ||
    (question.question_text &&
    question.question_text.trim() !== String(title || "").trim()
      ? question.question_text
      : "");

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-white">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 px-3 py-2">
        {allCodingQuestions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelectQuestion(q.id)}
            className={`rounded px-2 py-1 text-xs font-medium ${
              q.id === question.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Q{i + 1}
            {q.coding_submitted || (q.id === question.id && submitted) ? " ✓" : ""}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="w-full min-h-0 overflow-y-auto border-b border-gray-200 p-4 lg:w-[42%] lg:border-b-0 lg:border-r">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {meta.difficulty && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-800">
                {meta.difficulty}
              </span>
            )}
            <span className="text-xs text-gray-500">{question.points} pts</span>
          </div>

          <section>
            <h4 className="text-sm font-semibold text-gray-900">Description</h4>
            {description ? (
              <div className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                {description}
              </div>
            ) : (
              <p className="mt-1 text-xs italic text-gray-400">Not provided</p>
            )}
          </section>

          <MetaBlock title="Input Format" value={meta.input_format} />
          <MetaBlock title="Output Format" value={meta.output_format} />
          <MetaBlock title="Constraints" value={meta.constraints} />

          <section className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900">Samples</h4>
            {!meta.sample_input && !meta.sample_output ? (
              <p className="mt-1 text-xs italic text-gray-400">Not provided</p>
            ) : (
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-700">Sample Input</p>
                  <pre className="mt-1 whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-2 font-mono text-xs text-gray-800">
                    {meta.sample_input || "—"}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Sample Output</p>
                  <pre className="mt-1 whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-2 font-mono text-xs text-gray-800">
                    {meta.sample_output || "—"}
                  </pre>
                </div>
              </div>
            )}
          </section>

          <section className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900">
              Public Examples
              {publicTests.length > 0 ? ` (${publicTests.length})` : ""}
            </h4>
            {publicTests.length === 0 ? (
              <p className="mt-1 text-xs italic text-gray-400">Not provided</p>
            ) : (
              <div className="mt-1 space-y-2">
                {publicTests.slice(0, 3).map((tc: any, i: number) => (
                  <div
                    key={tc.id || i}
                    className="rounded border border-gray-200 bg-gray-50 p-2 font-mono text-xs text-gray-800"
                  >
                    <div>In: {tc.input || "—"}</div>
                    <div>Out: {tc.expected_output || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col lg:w-[58%]">
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2.5">
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-800">
              Language
              <select
                className={selectClass}
                value={language}
                disabled={submitted || busy}
                onChange={(e) => onLanguageChange(e.target.value)}
              >
                {(langs.length ? langs : LANG_OPTIONS).map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-800">
              Theme
              <select
                className={selectClass}
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-800">
              Font
              <select
                className={selectClass}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              >
                {[12, 14, 16, 18].map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
            </label>
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={busy || submitted}
                onClick={handleRun}
                className="gap-1 bg-gray-800 text-white hover:bg-gray-900"
              >
                {busy ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
                Run
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={busy || submitted}
                onClick={requestSubmit}
                className="gap-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Send size={14} />
                {submitted ? "Saved" : "Save Answer"}
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1" style={{ minHeight: 240 }}>
            <MonacoEditor
              height="100%"
              language={monacoLang}
              theme={theme}
              value={code}
              onChange={(v: string) => !submitted && setCode(v || "")}
              options={{
                fontSize,
                minimap: { enabled: false },
                readOnly: submitted,
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 flex items-center gap-3 text-sm">
              <label className="inline-flex items-center gap-2 text-gray-800">
                <input
                  type="checkbox"
                  checked={useCustomInput}
                  disabled={submitted}
                  onChange={(e) => setUseCustomInput(e.target.checked)}
                />
                Custom input
              </label>
              {submitSummary && (
                <span
                  className={
                    (submitSummary.passed ?? 0) === (submitSummary.total ?? 0) &&
                    (submitSummary.total ?? 0) > 0
                      ? "font-medium text-green-700"
                      : "font-medium text-amber-700"
                  }
                >
                  Graded score: {submitSummary.points_earned ?? 0}/
                  {submitSummary.max_points ?? question.points} (
                  {submitSummary.passed ?? 0}/{submitSummary.total ?? 0} tests
                  incl. hidden)
                </span>
              )}
            </div>
            {useCustomInput && (
              <textarea
                className="mb-2 w-full rounded border border-gray-300 bg-white p-2 font-mono text-xs text-gray-900"
                rows={3}
                placeholder="Custom stdin…"
                value={customInput}
                disabled={submitted}
                onChange={(e) => setCustomInput(e.target.value)}
              />
            )}
            <div className="max-h-40 overflow-y-auto rounded border border-gray-200 bg-white p-2 font-mono text-xs whitespace-pre-wrap text-gray-900">
              {!consoleOut && (
                <span className="text-gray-400">
                  Console output will appear here. Run checks public tests only
                  (not graded). Use Save Answer to score all tests.
                </span>
              )}
              {consoleOut?.error && (
                <span className="text-red-600">{consoleOut.error}</span>
              )}
              {consoleOut?.mode === "custom" && (
                <>
                  <div className="mb-1 text-xs font-semibold text-gray-600">
                    Custom stdin run (not graded)
                  </div>
                  <div>Status: {consoleOut.status}</div>
                  <div>stdout:{'\n'}{consoleOut.stdout}</div>
                  {consoleOut.stderr && (
                    <div>stderr:{'\n'}{consoleOut.stderr}</div>
                  )}
                </>
              )}
              {consoleOut?.mode === "public_tests" && (
                <>
                  <div className="mb-1 text-xs font-semibold text-amber-700">
                    Public tests only (not graded) — {consoleOut.passed}/
                    {consoleOut.total} passed
                  </div>
                  {(consoleOut.test_results || []).map((tr: any, i: number) => (
                    <div
                      key={tr.test_case_id || i}
                      className={tr.passed ? "text-green-700" : "text-red-600"}
                    >
                      Case {i + 1}: {tr.passed ? "PASS" : "FAIL"}
                      {!tr.passed && tr.expected_output != null
                        ? `\n  expected: ${String(tr.expected_output).slice(0, 120)}\n  actual: ${String(tr.actual_output ?? "").slice(0, 120)}`
                        : tr.actual_output != null
                          ? ` → ${String(tr.actual_output).slice(0, 80)}`
                          : ""}
                    </div>
                  ))}
                </>
              )}
              {consoleOut?.mode === "submit" && (
                <>
                  <div className="mb-1 text-xs font-semibold text-blue-700">
                    Graded save (public + hidden) — {consoleOut.passed}/
                    {consoleOut.total} passed
                    {consoleOut.points_earned != null &&
                      ` · ${consoleOut.points_earned}/${consoleOut.max_points} pts`}
                  </div>
                  {(consoleOut.passed ?? 0) < (consoleOut.total ?? 0) && (
                    <div className="mb-1 text-xs text-amber-700">
                      Some tests failed (may include hidden cases). Only this
                      Save Answer score counts toward your exam result.
                    </div>
                  )}
                  {(consoleOut.test_results || []).map((tr: any, i: number) => (
                    <div
                      key={tr.test_case_id || i}
                      className={tr.passed ? "text-green-700" : "text-red-600"}
                    >
                      Case {i + 1}
                      {tr.is_public === false ? " (hidden)" : ""}:{" "}
                      {tr.passed ? "PASS" : "FAIL"}
                      {tr.is_public !== false &&
                      !tr.passed &&
                      tr.expected_output != null
                        ? `\n  expected: ${String(tr.expected_output).slice(0, 120)}\n  actual: ${String(tr.actual_output ?? "").slice(0, 120)}`
                        : tr.is_public !== false && tr.actual_output != null
                          ? ` → ${String(tr.actual_output).slice(0, 80)}`
                          : ""}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {submitConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coding-submit-confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <h2
              id="coding-submit-confirm-title"
              className="text-lg font-bold text-gray-900"
            >
              Save this answer?
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              You cannot change it after saving. This grades all public and
              hidden tests and saves your score for this question.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSubmitConfirmOpen(false)}
                disabled={busy}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void performSubmit()}
                disabled={busy}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save answer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
