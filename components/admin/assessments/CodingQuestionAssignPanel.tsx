"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

interface Props {
  assessmentId: string;
  roundId: string;
  roundName?: string;
  expectedCount?: number;
  onAssigned?: () => void;
}

export function CodingQuestionAssignPanel({
  assessmentId,
  roundId,
  roundName,
  expectedCount,
  onAssigned,
}: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiClient.listCodingQuestions({
          status: "published",
          limit: 100,
        });
        setItems(data?.items || []);
      } catch (e: any) {
        setError(e?.response?.data?.detail || e?.message || "Failed to load bank");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const assign = async () => {
    if (selected.length === 0) {
      setError("Select at least one published question");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const res = await apiClient.assignCodingQuestions(assessmentId, {
        round_id: roundId,
        question_ids: selected,
        replace_existing: true,
      });
      setMessage(`Assigned ${res.assigned} coding problem(s) to this round.`);
      onAssigned?.();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Assign failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/20 space-y-3">
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Assign coding problems
          {roundName ? ` — ${roundName}` : ""}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Select published questions from the bank
          {expectedCount ? ` (target: ${expectedCount})` : ""}.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="animate-spin" size={16} /> Loading bank…
        </div>
      ) : items.length === 0 ? (
        <div className="space-y-2 text-sm">
          <p className="text-amber-700 dark:text-amber-400">
            No published coding questions in the bank yet.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Coding rounds can AI-generate problems on create (and auto-fill
            remaining slots from this bank). Use this panel to assign published
            bank questions manually when you need more control. Create questions
            here, set status to <strong>Published</strong>, then assign them.
          </p>
          <a
            href="/dashboard/admin/coding-questions/create"
            className="inline-flex text-blue-600 hover:underline font-medium"
            target="_blank"
            rel="noreferrer"
          >
            Create a coding question →
          </a>
          {" · "}
          <a
            href="/dashboard/admin/coding-questions"
            className="inline-flex text-blue-600 hover:underline font-medium"
            target="_blank"
            rel="noreferrer"
          >
            Open question bank
          </a>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setLoading(true);
                apiClient
                  .listCodingQuestions({ status: "published", limit: 100 })
                  .then((data) => setItems(data?.items || []))
                  .catch((e: any) =>
                    setError(
                      e?.response?.data?.detail ||
                        e?.message ||
                        "Failed to load bank"
                    )
                  )
                  .finally(() => setLoading(false));
              }}
            >
              Refresh list
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-h-56 overflow-y-auto space-y-2">
          {items.map((q) => (
            <label
              key={q.id}
              className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-white/60 dark:hover:bg-gray-800/40"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={selected.includes(q.id)}
                onChange={() => toggle(q.id)}
              />
              <span>
                <span className="font-medium">{q.title}</span>
                <span className="text-gray-500"> · {q.difficulty}</span>
                <span className="block text-xs text-gray-500">
                  {q.public_test_count} public / {q.hidden_test_count} hidden
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}
      <Button onClick={assign} disabled={saving || selected.length === 0} className="gap-2">
        {saving && <Loader2 className="animate-spin" size={16} />}
        Assign selected ({selected.length})
      </Button>
    </div>
  );
}
