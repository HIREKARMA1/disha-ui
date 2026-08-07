"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { AdminDashboardLayout } from "@/components/dashboard/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

const LANGS = [
  "python",
  "java",
  "javascript",
  "typescript",
  "c",
  "cpp",
  "go",
  "rust",
];

const DEFAULT_STARTERS: Record<string, string> = {
  python:
    "import sys\ndata = sys.stdin.read().strip()\n# TODO: solve\n",
  javascript:
    "const fs = require('fs');\nconst data = fs.readFileSync(0, 'utf8').trim();\n// TODO: solve\n",
  java:
    "import java.util.*;\npublic class Solution {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n  }\n}\n",
  cpp:
    "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  // TODO\n  return 0;\n}\n",
};

type TestCaseForm = {
  is_public: boolean;
  input_data: string;
  expected_output: string;
  weight: number;
};

export default function CreateCodingQuestionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [category, setCategory] = useState("Arrays");
  const [description, setDescription] = useState("");
  const [constraints, setConstraints] = useState("");
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [explanation, setExplanation] = useState("");
  const [timeLimit, setTimeLimit] = useState(2000);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [languages, setLanguages] = useState<string[]>(["python"]);
  const [status, setStatus] = useState("draft");
  const [testCases, setTestCases] = useState<TestCaseForm[]>([
    { is_public: true, input_data: "", expected_output: "", weight: 1 },
    { is_public: false, input_data: "", expected_output: "", weight: 1 },
  ]);

  const toggleLang = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const save = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }
    if (languages.length === 0) {
      setError("Select at least one language");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const starter_code: Record<string, string> = {};
      for (const lang of languages) {
        starter_code[lang] = DEFAULT_STARTERS[lang] || DEFAULT_STARTERS.python;
      }
      const created = await apiClient.createCodingQuestion({
        title: title.trim(),
        slug: slug.trim() || undefined,
        difficulty,
        category,
        description,
        constraints,
        input_format: inputFormat,
        output_format: outputFormat,
        sample_input: sampleInput,
        sample_output: sampleOutput,
        explanation,
        time_limit_ms: timeLimit,
        memory_limit_mb: memoryLimit,
        allowed_languages: languages,
        starter_code,
        status,
        test_cases: testCases.map((tc, i) => ({
          ...tc,
          order_index: i + 1,
        })),
      });
      router.push(`/dashboard/admin/coding-questions/${created.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const field =
    "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900";

  return (
    <AdminDashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin/coding-questions"
            className="text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Coding Question
          </h1>
        </div>

        {error && (
          <div className="text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slug (optional)</label>
              <input className={field} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-from-title" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Difficulty</label>
              <select className={field} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <input className={field} value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Time limit (ms)</label>
                <input type="number" className={field} value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Memory (MB)</label>
                <input type="number" className={field} value={memoryLimit} onChange={(e) => setMemoryLimit(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description *</label>
            <textarea className={field} rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Constraints</label>
              <textarea className={field} rows={3} value={constraints} onChange={(e) => setConstraints(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Explanation</label>
              <textarea className={field} rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Input format</label>
              <textarea className={field} rows={2} value={inputFormat} onChange={(e) => setInputFormat(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Output format</label>
              <textarea className={field} rows={2} value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sample input</label>
              <textarea className={field + " font-mono text-sm"} rows={3} value={sampleInput} onChange={(e) => setSampleInput(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sample output</label>
              <textarea className={field + " font-mono text-sm"} rows={3} value={sampleOutput} onChange={(e) => setSampleOutput(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Allowed languages</label>
            <div className="flex flex-wrap gap-3">
              {LANGS.map((lang) => (
                <label key={lang} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={languages.includes(lang)}
                    onChange={() => toggleLang(lang)}
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Test cases</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  setTestCases((prev) => [
                    ...prev,
                    { is_public: false, input_data: "", expected_output: "", weight: 1 },
                  ])
                }
              >
                <Plus size={14} /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={tc.is_public}
                        onChange={(e) => {
                          const next = [...testCases];
                          next[idx] = { ...tc, is_public: e.target.checked };
                          setTestCases(next);
                        }}
                      />
                      Public (visible on Run)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">Weight</label>
                      <input
                        type="number"
                        className="w-20 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-transparent"
                        value={tc.weight}
                        min={0}
                        step={0.5}
                        onChange={(e) => {
                          const next = [...testCases];
                          next[idx] = { ...tc, weight: Number(e.target.value) };
                          setTestCases(next);
                        }}
                      />
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() =>
                          setTestCases((prev) => prev.filter((_, i) => i !== idx))
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <textarea
                      className={field + " font-mono text-xs"}
                      rows={3}
                      placeholder="Input"
                      value={tc.input_data}
                      onChange={(e) => {
                        const next = [...testCases];
                        next[idx] = { ...tc, input_data: e.target.value };
                        setTestCases(next);
                      }}
                    />
                    <textarea
                      className={field + " font-mono text-xs"}
                      rows={3}
                      placeholder="Expected output"
                      value={tc.expected_output}
                      onChange={(e) => {
                        const next = [...testCases];
                        next[idx] = { ...tc, expected_output: e.target.value };
                        setTestCases(next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/dashboard/admin/coding-questions">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={save} disabled={saving} className="gap-2">
              {saving && <Loader2 className="animate-spin" size={16} />}
              Create
            </Button>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
