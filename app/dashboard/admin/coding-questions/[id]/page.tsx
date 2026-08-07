"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
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

export default function EditCodingQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyReport, setVerifyReport] = useState<any>(null);
  const [verifyLang, setVerifyLang] = useState("python");
  const [verifySolution, setVerifySolution] = useState("");
  const [q, setQ] = useState<any>(null);
  const [newTc, setNewTc] = useState({
    is_public: false,
    input_data: "",
    expected_output: "",
    weight: 1,
  });

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCodingQuestion(id);
      setQ(data);
      const sol = data?.solution_code || {};
      const preferred = sol.python || sol[Object.keys(sol)[0] || ""] || "";
      setVerifySolution(preferred || "");
      if (sol.python) setVerifyLang("python");
      else if (Object.keys(sol || {})[0]) setVerifyLang(Object.keys(sol)[0]);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async () => {
    if (!q) return;
    try {
      setSaving(true);
      setError(null);
      await apiClient.updateCodingQuestion(id, {
        title: q.title,
        slug: q.slug,
        difficulty: q.difficulty,
        category: q.category,
        description: q.description,
        constraints: q.constraints,
        input_format: q.input_format,
        output_format: q.output_format,
        sample_input: q.sample_input,
        sample_output: q.sample_output,
        explanation: q.explanation,
        time_limit_ms: q.time_limit_ms,
        memory_limit_mb: q.memory_limit_mb,
        allowed_languages: q.allowed_languages,
        starter_code: q.starter_code,
        solution_code: q.solution_code,
        tags: q.tags,
        status: q.status,
      });
      await load();
      toast.success("Saved");
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const runVerify = async (fixExpected: boolean) => {
    try {
      setVerifying(true);
      setVerifyReport(null);
      const report = await apiClient.verifyCodingTestCases(id, {
        language: verifyLang,
        solution_code: verifySolution || undefined,
        fix_expected: fixExpected,
      });
      setVerifyReport(report);
      toast.success(report.message || "Verification finished");
      if (fixExpected) await load();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "Verify failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      toast.error(typeof msg === "string" ? msg : "Verify failed");
    } finally {
      setVerifying(false);
    }
  };

  const addTestCase = async () => {
    await apiClient.addCodingTestCase(id, newTc);
    setNewTc({ is_public: false, input_data: "", expected_output: "", weight: 1 });
    await load();
  };

  const removeTestCase = async (tcId: string) => {
    await apiClient.deleteCodingTestCase(tcId);
    await load();
  };

  const removeQuestion = async () => {
    if (!confirm("Delete this coding question?")) return;
    await apiClient.deleteCodingQuestion(id);
    router.push("/dashboard/admin/coding-questions");
  };

  const field =
    "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900";

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" />
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!q) {
    return (
      <AdminDashboardLayout>
        <div className="text-center py-20 text-red-600">{error || "Not found"}</div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/coding-questions" className="text-gray-500">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit: {q.title}
            </h1>
          </div>
          <Button variant="destructive" onClick={removeQuestion}>
            Delete
          </Button>
        </div>

        {error && (
          <div className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</div>
        )}

        <div className="grid gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <input
                className={field}
                value={q.title || ""}
                onChange={(e) => setQ({ ...q, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slug</label>
              <input
                className={field}
                value={q.slug || ""}
                onChange={(e) => setQ({ ...q, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Difficulty</label>
              <select
                className={field}
                value={q.difficulty || "medium"}
                onChange={(e) => setQ({ ...q, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select
                className={field}
                value={q.status || "draft"}
                onChange={(e) => setQ({ ...q, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea
              className={field}
              rows={6}
              value={q.description || ""}
              onChange={(e) => setQ({ ...q, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Languages</label>
            <div className="flex flex-wrap gap-3">
              {LANGS.map((lang) => {
                const selected = (q.allowed_languages || []).includes(lang);
                return (
                  <label key={lang} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        const prev = q.allowed_languages || [];
                        setQ({
                          ...q,
                          allowed_languages: selected
                            ? prev.filter((l: string) => l !== lang)
                            : [...prev, lang],
                        });
                      }}
                    />
                    {lang}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving} className="gap-2">
              {saving && <Loader2 className="animate-spin" size={16} />}
              Save
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border space-y-4">
          <h2 className="font-semibold text-lg">Verify test cases</h2>
          <p className="text-sm text-gray-600">
            Run a reference solution against all cases. Use{" "}
            <strong>Fix expected outputs</strong> to rewrite mismatched expected
            stdout from the solution (recommended for AI-generated pair-sum /
            equilibrium problems).
          </p>
          <div>
            <label className="text-sm font-medium mb-1 block">Language</label>
            <select
              className={field + " max-w-xs"}
              value={verifyLang}
              onChange={(e) => setVerifyLang(e.target.value)}
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Solution code (optional if saved on question)
            </label>
            <textarea
              className={field + " font-mono text-xs"}
              rows={8}
              value={verifySolution}
              onChange={(e) => setVerifySolution(e.target.value)}
              placeholder="Paste a known-good solution…"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={verifying}
              onClick={() => runVerify(false)}
              className="gap-2"
            >
              {verifying && <Loader2 className="animate-spin" size={16} />}
              Verify only
            </Button>
            <Button
              type="button"
              disabled={verifying}
              onClick={() => runVerify(true)}
              className="gap-2"
            >
              {verifying && <Loader2 className="animate-spin" size={16} />}
              Fix expected outputs
            </Button>
          </div>
          {verifyReport && (
            <div className="rounded-lg border bg-gray-50 p-3 text-sm space-y-2">
              <p className="font-medium">
                {verifyReport.matched}/{verifyReport.total} matched
                {verifyReport.fixed ? ` · ${verifyReport.fixed} fixed` : ""}
                {verifyReport.failed_execution
                  ? ` · ${verifyReport.failed_execution} exec failures`
                  : ""}
              </p>
              <p className="text-gray-600">{verifyReport.message}</p>
              <div className="max-h-48 overflow-y-auto font-mono text-xs space-y-1 whitespace-pre-wrap">
                {(verifyReport.cases || []).map((c: any) => (
                  <div
                    key={c.test_case_id || c.index}
                    className={c.matches ? "text-green-700" : "text-red-600"}
                  >
                    #{c.index + 1} {c.is_public ? "public" : "hidden"}:{" "}
                    {c.matches ? "OK" : "MISMATCH"} ({c.status})
                    {!c.matches &&
                      `\nexp: ${String(c.expected_output || "").slice(0, 80)}\ngot: ${String(c.actual_output || "").slice(0, 80)}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border space-y-4">
          <h2 className="font-semibold text-lg">Test cases</h2>
          {(q.test_cases || []).map((tc: any) => (
            <div
              key={tc.id}
              className="p-3 border rounded-lg flex justify-between gap-3 items-start"
            >
              <div className="flex-1 text-sm font-mono whitespace-pre-wrap">
                <div className="text-xs text-gray-500 mb-1">
                  {tc.is_public ? "Public" : "Hidden"} · weight {tc.weight}
                </div>
                <div>In: {tc.input_data}</div>
                <div>Out: {tc.expected_output}</div>
              </div>
              <button
                type="button"
                className="text-red-500"
                onClick={() => removeTestCase(tc.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div className="border-t pt-4 space-y-2">
            <h3 className="font-medium text-sm">Add test case</h3>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newTc.is_public}
                onChange={(e) =>
                  setNewTc({ ...newTc, is_public: e.target.checked })
                }
              />
              Public
            </label>
            <div className="grid md:grid-cols-2 gap-2">
              <textarea
                className={field + " font-mono text-xs"}
                rows={3}
                placeholder="Input"
                value={newTc.input_data}
                onChange={(e) =>
                  setNewTc({ ...newTc, input_data: e.target.value })
                }
              />
              <textarea
                className={field + " font-mono text-xs"}
                rows={3}
                placeholder="Expected output"
                value={newTc.expected_output}
                onChange={(e) =>
                  setNewTc({ ...newTc, expected_output: e.target.value })
                }
              />
            </div>
            <Button type="button" variant="outline" className="gap-1" onClick={addTestCase}>
              <Plus size={14} /> Add test case
            </Button>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
