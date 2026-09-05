"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Loader2, Code2 } from "lucide-react";
import { AdminDashboardLayout } from "@/components/dashboard/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { AdminPageHero } from "@/components/admin/ui/AdminPageHero";
import { adminCard, adminInput } from "@/components/admin/ui/admin-theme";
import { cn } from "@/lib/utils";

interface CodingQuestionItem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category?: string;
  status: string;
  public_test_count: number;
  hidden_test_count: number;
  allowed_languages: string[];
}

export default function CodingQuestionsPage() {
  const [items, setItems] = useState<CodingQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (status !== "all") params.status = status;
      if (difficulty !== "all") params.difficulty = difficulty;
      if (search.trim()) params.search = search.trim();
      const data = await apiClient.listCodingQuestions(params);
      setItems(data?.items || []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminDashboardLayout>
      <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
        <AdminPageHero
          title="Coding Question Bank"
          subtitle="Create reusable coding problems for assessment rounds."
          chips={[
            {
              label: `${items.length} Questions`,
              tone: 'teal',
              icon: <Code2 className="w-3.5 h-3.5" />,
            },
          ]}
          actions={
            <Link href="/dashboard/admin/coding-questions/create">
              <Button className="gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-md shadow-blue-500/20">
                <Plus size={18} />
                New Question
              </Button>
            </Link>
          }
        />

        <div className={cn(adminCard, "flex flex-wrap gap-3 items-end p-4")}>
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                className={cn(adminInput, "pl-9 pr-3 py-2 text-sm")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title or slug"
                aria-label="Search coding questions"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select
              className={cn(adminInput, "px-3 py-2 text-sm")}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Difficulty</label>
            <select
              className={cn(adminInput, "px-3 py-2 text-sm")}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <Button variant="outline" onClick={load}>
            Filter
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 py-12 justify-center">
            <Loader2 className="animate-spin" /> Loading…
          </div>
        ) : error ? (
          <div className="text-red-600 py-8 text-center">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed rounded-xl">
            No coding questions yet. Create your first problem.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Difficulty</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Tests</th>
                  <th className="px-4 py-3 font-medium">Languages</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((q) => (
                  <tr
                    key={q.id}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {q.title}
                      </div>
                      <div className="text-xs text-gray-500">{q.slug}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{q.difficulty}</td>
                    <td className="px-4 py-3 capitalize">{q.status}</td>
                    <td className="px-4 py-3">
                      {q.public_test_count} public / {q.hidden_test_count} hidden
                    </td>
                    <td className="px-4 py-3">
                      {(q.allowed_languages || []).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/coding-questions/${q.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
