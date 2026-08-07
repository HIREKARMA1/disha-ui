"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { AdminDashboardLayout } from "@/components/dashboard/AdminDashboardLayout";
import { StudentExamLinkSection } from "@/components/admin/assessments/StudentExamLinkSection";
import { CodingQuestionAssignPanel } from "@/components/admin/assessments/CodingQuestionAssignPanel";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface Assessment {
  id: string;
  disha_assessment_id: string;
  assessment_name: string;
  description?: string;
  mode: string;
  status: string;
  start_time: string;
  end_time: string;
  total_duration_minutes: number;
  rounds: any[];
  passing_criteria?: any;
}

interface AssessmentStats {
  total_attempts: number;
  completed_attempts: number;
  passed_attempts: number;
  failed_attempts: number;
  average_score?: number | null;
  average_percentage?: number | null;
  highest_score?: number | null;
  lowest_score?: number | null;
}

const getErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.detail || error?.message || fallback;
};

const getExpectedQuestionCount = (round: any, questionRound?: any) => {
  return (
    round?.config?.num_questions ||
    round?.questions_count ||
    questionRound?.expected_questions ||
    questionRound?.questions_count ||
    0
  );
};

const getRoundKey = (round: any) =>
  String(
    round?.round_number ??
      round?.id ??
      round?.round_id ??
      round?.round_type ??
      "",
  );

const findQuestionRound = (questionsData: any, round: any) => {
  const rounds = questionsData?.rounds || [];
  const matched = rounds.find(
    (candidate: any) =>
      candidate.round_number === round.round_number ||
      candidate.round_id === round.id ||
      candidate.round_id === round.round_id ||
      (candidate.round_type === round.round_type &&
        candidate.round_number === round.round_number),
  );
  if (matched?.questions?.length) return matched;

  // Fallback: attach flat question list by round_id when round grouping mismatched
  const flat = (questionsData?.questions || []).filter(
    (q: any) => q.round_id === round.id || q.round_id === round.round_id,
  );
  if (flat.length) {
    return {
      ...(matched || {}),
      round_id: round.id,
      round_number: round.round_number,
      round_type: round.round_type,
      questions: flat,
      questions_count: flat.length,
    };
  }
  return matched;
};

const getQuestionId = (question: any): string => {
  const raw =
    question?.id ??
    question?.question_id ??
    question?.questionId ??
    "";
  const id = String(raw).trim();
  if (!id || id === "undefined" || id === "null") return "";
  return id;
};

const normalizeQuestion = (question: any) => {
  const id = getQuestionId(question);
  return {
    ...question,
    id: id || question?.id,
    question_id: id || question?.question_id,
    is_ai_generated: Boolean(question?.is_ai_generated),
  };
};

const normalizeQuestionsPayload = (data: any) => {
  if (!data) return data;
  const questions = (data.questions || []).map(normalizeQuestion);
  const rounds = (data.rounds || []).map((round: any) => ({
    ...round,
    questions: (round.questions || []).map(normalizeQuestion),
  }));
  return { ...data, questions, rounds };
};

const isCorrectOption = (
  option: string,
  optionIndex: number,
  correctAnswer: any,
): boolean => {
  if (correctAnswer == null || correctAnswer === "") return false;
  const letter = String.fromCharCode(65 + optionIndex);
  const correct = String(correctAnswer).trim();
  const upper = correct.toUpperCase();
  if (upper === letter) return true;
  if (option === correct) return true;
  if (String(option).trim().toUpperCase() === upper) return true;
  return false;
};

const getAiQuestionTarget = (round: any): number => {
  const num = Number(round?.config?.num_questions) || 0;
  const ai = round?.config?.ai_question_count;
  if (ai === undefined || ai === null || ai === "") return num;
  const n = Number(ai);
  if (!Number.isFinite(n)) return num;
  return Math.max(0, Math.min(n, num));
};

const MCQ_ROUND_TYPES = new Set([
  "aptitude",
  "mcq",
  "technical_mcq",
  "soft_skills",
]);

export default function AssessmentDetailPage() {
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showCreatedBanner, setShowCreatedBanner] = useState(false);
  const [questionsData, setQuestionsData] = useState<any>(null);
  const [questionPackageId, setQuestionPackageId] = useState("");
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [questionActionMessage, setQuestionActionMessage] = useState<
    string | null
  >(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [replenishing, setReplenishing] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  );
  const [pendingDeleteQuestionId, setPendingDeleteQuestionId] = useState<
    string | null
  >(null);
  const [expandedRounds, setExpandedRounds] = useState<Record<string, boolean>>(
    {},
  );
  const [addingManualRoundId, setAddingManualRoundId] = useState<string | null>(
    null,
  );
  const [manualFormByRound, setManualFormByRound] = useState<
    Record<
      string,
      {
        question_type: string;
        question_text: string;
        options: [string, string, string, string];
        correct_answer: string;
        explanation: string;
      }
    >
  >({});

  // Fetch assessment details
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        const [assessmentRes, statsRes] = await Promise.all([
          apiClient.getAssessment(assessmentId),
          apiClient.getAssessmentStats(assessmentId),
        ]);

        setAssessment(assessmentRes);
        setStats(statsRes);
        setExpandedRounds(
          (assessmentRes.rounds || []).reduce(
            (acc: Record<string, boolean>, round: any) => {
              const key = String(getRoundKey(round));
              if (key) acc[key] = true;
              return acc;
            },
            {},
          ),
        );

        setQuestionPackageId(assessmentRes.id);
        await fetchQuestions(assessmentRes.id, assessmentRes.rounds || []);
      } catch (err: any) {
        console.error("Failed to fetch assessment:", err);
        setError(err.message || "Failed to load assessment");
      } finally {
        setIsLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("created=1")
    ) {
      setShowCreatedBanner(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchQuestions = async (assessmentKey: string, roundsHint: any[] = []) => {
    try {
      setLoadingQuestions(true);
      setQuestionsError(null);
      // Prefer grouped legacy-compatible endpoint
      let data: any;
      try {
        data = await apiClient.get(
          `/disha/assessments/${assessmentKey}/questions-answers`,
        );
      } catch {
        const list = await apiClient.get(
          `/admin/assessments/${assessmentKey}/questions`,
        );
        const questions = Array.isArray(list) ? list : list?.questions || [];
        const roundsSrc = roundsHint.length
          ? roundsHint
          : assessment?.rounds || [];
        const byRound: Record<string, any[]> = {};
        questions.forEach((q: any) => {
          const rid = q.round_id || "unknown";
          if (!byRound[rid]) byRound[rid] = [];
          byRound[rid].push(q);
        });
        data = {
          rounds: roundsSrc.map((round: any) => ({
            round_id: round.id,
            round_number: round.round_number,
            round_type: round.round_type,
            round_name: round.round_name,
            expected_questions: round?.config?.num_questions,
            questions_count: (byRound[round.id] || []).length,
            questions: byRound[round.id] || [],
          })),
          questions,
          count: questions.length,
        };
      }
      setQuestionsData(normalizeQuestionsPayload(data));
      setQuestionPackageId(assessmentKey);
      setExpandedRounds((prev) => {
        const next = { ...prev };
        (data.rounds || []).forEach((round: any) => {
          const key = String(getRoundKey(round));
          if (key && next[key] === undefined) {
            next[key] = true;
          }
        });
        return next;
      });
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestionsError(
        getErrorMessage(error, "Failed to load questions."),
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  const toggleRoundExpanded = (roundKey: string) => {
    setExpandedRounds((prev) => ({
      ...prev,
      [roundKey]: !prev[roundKey],
    }));
  };

  const removeQuestionFromState = (questionId: string) => {
    setQuestionsData((prev: any) => {
      if (!prev) return prev;
      const filterQs = (list: any[] = []) =>
        list.filter((q) => getQuestionId(q) !== questionId);
      return {
        ...prev,
        questions: filterQs(prev.questions),
        count: filterQs(prev.questions).length,
        rounds: (prev.rounds || []).map((round: any) => {
          const questions = filterQs(round.questions);
          return {
            ...round,
            questions,
            questions_count: questions.length,
          };
        }),
      };
    });
  };

  const requestDeleteQuestion = (questionId: string) => {
    const qid = String(questionId || "").trim();
    if (!qid || qid === "undefined" || qid === "null") {
      setQuestionsError(
        "Cannot delete: question id is missing. Reload the page and try again.",
      );
      return;
    }
    setPendingDeleteQuestionId(qid);
  };

  const performDeleteQuestion = async (questionId: string) => {
    const qid = String(questionId || "").trim();
    if (!qid) return;
    try {
      setDeletingQuestionId(qid);
      setQuestionActionMessage(null);
      setQuestionsError(null);
      const paths = [
        `/admin/assessments/${assessmentId}/questions/${qid}`,
        `/disha/assessments/questions/${qid}`,
      ];
      let deleted = false;
      let lastError: any = null;
      for (const path of paths) {
        try {
          await apiClient.delete(path);
          deleted = true;
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (!deleted) {
        throw lastError || new Error("Delete failed");
      }
      removeQuestionFromState(qid);
      setPendingDeleteQuestionId(null);
      setQuestionActionMessage(
        "Question deleted. Replenish AI for AI shortfalls, or add a manual question to fill remaining slots.",
      );
      fetchQuestions(assessmentId, assessment?.rounds || []);
    } catch (error) {
      console.error("Error deleting question:", error);
      setQuestionsError(getErrorMessage(error, "Error deleting question"));
      throw error;
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const getManualForm = (roundId: string) =>
    manualFormByRound[roundId] || {
      question_type: "mcq",
      question_text: "",
      options: ["", "", "", ""] as [string, string, string, string],
      correct_answer: "A",
      explanation: "",
    };

  const updateManualForm = (
    roundId: string,
    patch: Partial<ReturnType<typeof getManualForm>>,
  ) => {
    setManualFormByRound((prev) => ({
      ...prev,
      [roundId]: { ...getManualForm(roundId), ...patch },
    }));
  };

  const handleAddManualQuestion = async (round: any) => {
    const roundId = round.id || round.round_id;
    if (!roundId) {
      setQuestionsError("Cannot add question: round id is missing.");
      return;
    }
    const form = getManualForm(roundId);
    const text = form.question_text.trim();
    const qtype = (form.question_type || "mcq").toLowerCase();
    const isSoftRound =
      String(round.round_type || "").toLowerCase() === "soft_skills";
    if (!text && qtype !== "dictation") {
      setQuestionsError("Question text is required.");
      return;
    }

    let payload: Record<string, any> = {
      round_id: roundId,
      question_text: text,
      question_type: qtype,
      explanation: form.explanation.trim() || null,
    };

    if (qtype === "mcq") {
      const options = form.options.map((o) => o.trim());
      if (!text) {
        setQuestionsError("Question text is required.");
        return;
      }
      if (options.some((o) => !o)) {
        setQuestionsError("All four options are required for MCQ.");
        return;
      }
      payload = {
        ...payload,
        options,
        correct_answer: form.correct_answer || "A",
      };
    } else if (qtype === "dictation" || qtype === "listening") {
      const expected = (form.correct_answer || "").trim();
      if (!expected) {
        setQuestionsError(
          "Expected sentence (correct answer) is required for listening questions.",
        );
        return;
      }
      const promptText =
        text && text.toLowerCase().includes("listen")
          ? text
          : `Listen and write down the following sentence: '${expected}'`;
      payload = {
        ...payload,
        question_type: "dictation",
        question_text: promptText,
        options: null,
        correct_answer: expected,
      };
    } else if (qtype === "voice_speaking" || qtype === "speaking") {
      payload = {
        ...payload,
        question_type: "voice_speaking",
        options: null,
        correct_answer: null,
      };
    } else if (qtype === "text" || qtype === "writing") {
      payload = {
        ...payload,
        question_type: "text",
        options: null,
        correct_answer: null,
      };
    } else if (!isSoftRound) {
      setQuestionsError("Unsupported question type for this round.");
      return;
    }

    try {
      setAddingManualRoundId(roundId);
      setQuestionsError(null);
      setQuestionActionMessage(null);
      await apiClient.post(`/admin/assessments/${assessmentId}/questions`, payload);
      setManualFormByRound((prev) => ({
        ...prev,
        [roundId]: {
          question_type: isSoftRound ? form.question_type : "mcq",
          question_text: "",
          options: ["", "", "", ""],
          correct_answer: form.question_type === "dictation" ? "" : "A",
          explanation: "",
        },
      }));
      setQuestionActionMessage("Manual question added.");
      await fetchQuestions(assessmentId, assessment?.rounds || []);
    } catch (error) {
      console.error("Error adding manual question:", error);
      setQuestionsError(getErrorMessage(error, "Error adding manual question"));
    } finally {
      setAddingManualRoundId(null);
    }
  };

  const handleReplenishQuestions = async () => {
    if (!questionPackageId) {
      setQuestionsError(
        "Assessment id missing; reload the page.",
      );
      return;
    }

    try {
      setReplenishing(true);
      setQuestionActionMessage(null);
      setQuestionsError(null);
      const res = await apiClient.post(
        `/admin/assessments/${assessmentId}/questions/fill`,
        {},
      );
      const added = res.added ?? res.total_questions_added ?? 0;
      const stillMissingAi = res.still_missing_ai ?? res.still_missing ?? 0;
      const stillMissingManual = res.still_missing_manual ?? 0;
      const serverMessage =
        res.message || `AI questions replenished. Added: ${added}.`;
      const displayMessage = res.cohere_error
        ? `${serverMessage} (${res.cohere_error})`
        : serverMessage;

      if (stillMissingAi > 0 && added === 0) {
        setQuestionsError(displayMessage);
        setQuestionActionMessage(null);
      } else if (stillMissingAi > 0 || stillMissingManual > 0) {
        setQuestionActionMessage(displayMessage);
        setQuestionsError(null);
      } else {
        setQuestionActionMessage(displayMessage);
        setQuestionsError(null);
      }
      fetchQuestions(assessmentId, assessment?.rounds || []);
    } catch (error) {
      console.error("Error replenishing questions:", error);
      setQuestionsError(getErrorMessage(error, "Error replenishing questions"));
    } finally {
      setReplenishing(false);
    }
  };

  // Publish assessment
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const response = await apiClient.post(
        `/admin/assessments/${assessmentId}/publish`,
        {},
      );
      setAssessment(response);
      setQuestionPackageId(response.id);
      setQuestionsError(null);
      await fetchQuestions(response.id, response.rounds || []);
    } catch (err: any) {
      setError(err.message || "Failed to publish assessment");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error && !assessment) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Link href="/dashboard/admin/assessments">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!assessment) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Link href="/dashboard/admin/assessments">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">
              Not Found
            </h3>
            <p className="text-yellow-700">Assessment not found</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  const questionRounds = questionsData?.rounds || [];
  const totalLoadedQuestions = questionRounds.reduce(
    (total: number, round: any) =>
      total + (round.questions?.length || round.questions_count || 0),
    0,
  );
  const totalExpectedQuestions = (assessment.rounds || []).reduce(
    (total: number, round: any) =>
      total +
      getExpectedQuestionCount(round, findQuestionRound(questionsData, round)),
    0,
  );
  const missingQuestions = Math.max(
    totalExpectedQuestions - totalLoadedQuestions,
    0,
  );
  const canManageQuestions = Boolean(questionPackageId);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {showCreatedBanner && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
            Assessment created successfully. Share the{" "}
            <strong>student exam link</strong> below with candidates.
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/assessments">
              <Button variant="outline" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {assessment.assessment_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Assessment ID: {assessment.disha_assessment_id}
              </p>
            </div>
          </div>
          {(assessment.status !== "ACTIVE" || !questionPackageId) && (
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? "Publishing..." : "Publish Assessment"}
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <StudentExamLinkSection
          assessmentId={assessment.id}
          show={Boolean(
            assessment.status === "ACTIVE",
          )}
        />

        {/* Status & Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Status</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {assessment.status}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Mode</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {assessment.mode}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Duration</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {assessment.total_duration_minutes}m
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Rounds</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {assessment.rounds?.length || 0}
            </p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.total_attempts}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats.completed_attempts}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {typeof stats.average_percentage === "number"
                    ? `${stats.average_percentage.toFixed(1)}%`
                    : typeof stats.average_score === "number"
                    ? `${stats.average_score.toFixed(1)}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rounds */}
        {assessment.rounds && assessment.rounds.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Questions & Answers
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {canManageQuestions
                    ? `${totalLoadedQuestions} of ${totalExpectedQuestions || totalLoadedQuestions} questions loaded. Use Replenish AI Questions Only above for AI gaps; add manual questions per round below.`
                    : "Questions will appear here after generation."}
                </p>
                {questionPackageId && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Package ID: {questionPackageId}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {missingQuestions > 0 && (
                  <span className="flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    <AlertCircle size={14} />
                    {missingQuestions} missing
                  </span>
                )}
                <Button
                  type="button"
                  onClick={handleReplenishQuestions}
                  disabled={!canManageQuestions || replenishing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {replenishing ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Sparkles size={16} className="mr-2" />
                  )}
                  Replenish AI Questions Only
                </Button>
              </div>
            </div>

            {questionActionMessage && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {questionActionMessage}
              </div>
            )}

            {questionsError && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {questionsError}
              </div>
            )}

            <div className="space-y-4">
              {assessment.rounds.map((round: any) => {
                const questionRound = findQuestionRound(questionsData, round);
                const expectedCount = getExpectedQuestionCount(
                  round,
                  questionRound,
                );
                const questions = questionRound?.questions || [];
                const currentCount =
                  questions.length ||
                  questionRound?.questions_count ||
                  0;
                const aiTarget = getAiQuestionTarget(round);
                const manualSlots = Math.max(0, expectedCount - aiTarget);
                const aiCount = questions.filter(
                  (q: any) => q.is_ai_generated,
                ).length;
                const manualCount = currentCount - aiCount;
                const aiMissing = Math.max(0, aiTarget - aiCount);
                const manualMissing = Math.max(0, manualSlots - manualCount);
                const isShort =
                  expectedCount > 0 && currentCount < expectedCount;
                const roundKey = String(getRoundKey(round));
                const canAddManual =
                  MCQ_ROUND_TYPES.has(String(round.round_type || "").toLowerCase()) &&
                  currentCount < expectedCount;
                const manualForm = getManualForm(round.id);

                return (
                  <div
                    key={round.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-block w-8 h-8 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold text-sm">
                            {round.round_number}
                          </span>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {round.round_name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {round.round_type} • {round.duration_minutes} min
                              • {expectedCount} questions
                              {expectedCount > 0 && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  {" "}
                                  ({aiTarget} AI / {manualSlots} manual)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Difficulty:{" "}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {round.config?.difficulty}
                          </span>
                        </p>
                        {round.passing_percentage && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Pass: {round.passing_percentage}%
                          </p>
                        )}
                      </div>
                    </div>

                    {String(round.round_type || "").toLowerCase() === "coding" && (
                      <>
                        <CodingQuestionAssignPanel
                          assessmentId={assessmentId}
                          roundId={round.id}
                          roundName={round.round_name}
                          expectedCount={expectedCount}
                          onAssigned={() =>
                            fetchQuestions(assessmentId, assessment?.rounds || [])
                          }
                        />
                        {questions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              Assigned ({questions.length})
                            </p>
                            {questions.map((q: any, idx: number) => (
                              <div
                                key={q.id}
                                className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                              >
                                {idx + 1}. {q.question_text}{" "}
                                <span className="text-gray-500">
                                  ({q.points ?? 100} pts · {q.difficulty || "—"})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* Questions Management Block — always visible for local assessments */}
                    {canManageQuestions && String(round.round_type || "").toLowerCase() !== "coding" && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleRoundExpanded(roundKey)}
                            className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            {expandedRounds[roundKey] ? (
                              <>
                                <ChevronUp size={16} />
                                Hide Questions ({currentCount})
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} />
                                View Questions ({currentCount})
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2 flex-wrap">
                            {isShort && (
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
                                <AlertCircle size={14} />
                                {aiMissing > 0 && `${aiMissing} AI missing`}
                                {aiMissing > 0 && manualMissing > 0 && " · "}
                                {manualMissing > 0 &&
                                  `${manualMissing} manual needed`}
                                {aiMissing === 0 &&
                                  manualMissing === 0 &&
                                  `${expectedCount - currentCount} missing`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add Manual — always visible (not behind expand) */}
                        {MCQ_ROUND_TYPES.has(
                          String(round.round_type || "").toLowerCase(),
                        ) && (
                          <div
                            id={`manual-form-${round.id}`}
                            className="rounded-lg border-2 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4"
                          >
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              Add Manual Question
                            </h4>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                              Total {expectedCount}: {aiCount} AI + {manualCount}{" "}
                              manual loaded.{" "}
                              {canAddManual
                                ? `${expectedCount - currentCount} slot(s) left — fill with manual MCQs or replenish AI.`
                                : expectedCount > 0 &&
                                    currentCount >= expectedCount
                                  ? "Round is full — delete a question first to add another."
                                  : "Set total questions on the round to enable manual entry."}
                            </p>
                            <div className="mt-3 space-y-3">
                              {String(round.round_type || "").toLowerCase() ===
                                "soft_skills" && (
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                                    Question type
                                  </label>
                                  <select
                                    value={manualForm.question_type || "mcq"}
                                    disabled={!canAddManual}
                                    onChange={(e) =>
                                      updateManualForm(round.id, {
                                        question_type: e.target.value,
                                        correct_answer:
                                          e.target.value === "mcq"
                                            ? "A"
                                            : e.target.value === "dictation"
                                              ? ""
                                              : "",
                                      })
                                    }
                                    className="min-w-[10rem] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pl-3 pr-10 py-2 text-sm disabled:bg-gray-50 dark:disabled:bg-gray-900"
                                  >
                                    <option value="mcq">MCQ</option>
                                    <option value="dictation">Listening</option>
                                    <option value="voice_speaking">Speaking</option>
                                    <option value="text">Writing</option>
                                  </select>
                                </div>
                              )}
                              <textarea
                                value={manualForm.question_text}
                                onChange={(e) =>
                                  updateManualForm(round.id, {
                                    question_text: e.target.value,
                                  })
                                }
                                disabled={!canAddManual}
                                rows={2}
                                placeholder={
                                  manualForm.question_type === "dictation"
                                    ? "Optional prompt (or leave blank and set expected sentence below)"
                                    : "Question text / prompt"
                                }
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 px-3 py-2 text-sm disabled:bg-gray-50 dark:disabled:bg-gray-900"
                              />
                              {(manualForm.question_type || "mcq") === "mcq" && (
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {manualForm.options.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="w-6 text-xs font-bold text-gray-500 dark:text-gray-400">
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <input
                                      type="text"
                                      value={opt}
                                      disabled={!canAddManual}
                                      onChange={(e) => {
                                        const next = [
                                          ...manualForm.options,
                                        ] as [string, string, string, string];
                                        next[oIdx] = e.target.value;
                                        updateManualForm(round.id, {
                                          options: next,
                                        });
                                      }}
                                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 px-3 py-2 text-sm disabled:bg-gray-50 dark:disabled:bg-gray-900"
                                    />
                                  </div>
                                ))}
                              </div>
                              )}
                              {manualForm.question_type === "dictation" && (
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                                    Expected sentence (spoken + graded)
                                  </label>
                                  <input
                                    type="text"
                                    value={manualForm.correct_answer}
                                    disabled={!canAddManual}
                                    onChange={(e) =>
                                      updateManualForm(round.id, {
                                        correct_answer: e.target.value,
                                      })
                                    }
                                    placeholder="Exact sentence the candidate must type"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 px-3 py-2 text-sm disabled:bg-gray-50 dark:disabled:bg-gray-900"
                                  />
                                </div>
                              )}
                              <div className="flex flex-wrap items-end gap-3">
                                {(manualForm.question_type || "mcq") === "mcq" && (
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                                    Correct answer
                                  </label>
                                  <select
                                    value={manualForm.correct_answer}
                                    disabled={!canAddManual}
                                    onChange={(e) =>
                                      updateManualForm(round.id, {
                                        correct_answer: e.target.value,
                                      })
                                    }
                                    className="w-20 min-w-[4.5rem] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pl-3 pr-10 py-2 text-sm disabled:bg-gray-50 dark:disabled:bg-gray-900"
                                  >
                                    {["A", "B", "C", "D"].map((l) => (
                                      <option key={l} value={l}>
                                        {l}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                )}
                                <div className="min-w-[200px] flex-1">
                                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                                    Explanation (optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={manualForm.explanation}
                                    disabled={!canAddManual}
                                    onChange={(e) =>
                                      updateManualForm(round.id, {
                                        explanation: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 px-3 py-2 text-sm disabled:bg-gray-50 dark:disabled:bg-gray-900"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAddManualQuestion(round)}
                                  disabled={
                                    !canAddManual ||
                                    addingManualRoundId === round.id
                                  }
                                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {addingManualRoundId === round.id
                                    ? "Adding…"
                                    : "Add Manual Question"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Expanded questions list */}
                        {expandedRounds[roundKey] !== false && (
                          <div className="space-y-4">
                            {loadingQuestions ? (
                              <div className="text-center py-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                                <RefreshCw
                                  size={16}
                                  className="animate-spin text-blue-600"
                                />
                                Loading questions...
                              </div>
                            ) : (
                              <>
                                {questions.length === 0 && (
                                  <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/40 flex flex-col items-center gap-2">
                                    <HelpCircle
                                      size={24}
                                      className="text-gray-400 dark:text-gray-500"
                                    />
                                    <span>
                                      No questions yet. Use Replenish AI and/or
                                      Add Manual Question above.
                                    </span>
                                    {aiTarget > 0 && (
                                      <button
                                        type="button"
                                        onClick={handleReplenishQuestions}
                                        disabled={replenishing}
                                        className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                                      >
                                        {replenishing ? (
                                          <RefreshCw
                                            size={12}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Sparkles size={12} />
                                        )}
                                        Generate AI Questions
                                      </button>
                                    )}
                                  </div>
                                )}

                                {questions.length > 0 && (
                                  <div className="space-y-4">
                                    {questions.map(
                                      (question: any, qIdx: number) => {
                                        const qid = getQuestionId(question);
                                        const isAi = Boolean(
                                          question.is_ai_generated,
                                        );
                                        return (
                                          <div
                                            key={qid || `q-${qIdx}`}
                                            className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative group hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                                          >
                                            <button
                                              type="button"
                                              onClick={() =>
                                                requestDeleteQuestion(qid)
                                              }
                                              disabled={
                                                !qid ||
                                                deletingQuestionId === qid
                                              }
                                              className="absolute top-4 right-4 z-10 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 p-2 text-red-600 dark:text-red-400 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 disabled:cursor-not-allowed disabled:opacity-50"
                                              title={
                                                qid
                                                  ? "Delete Question"
                                                  : "Missing question id"
                                              }
                                            >
                                              {deletingQuestionId === qid ? (
                                                <RefreshCw
                                                  size={16}
                                                  className="animate-spin"
                                                />
                                              ) : (
                                                <Trash2 size={16} />
                                              )}
                                            </button>

                                            <div className="flex items-start gap-2 pr-10">
                                              <span className="font-bold text-gray-400 dark:text-gray-500 min-w-[20px]">
                                                {qIdx + 1}.
                                              </span>
                                              <div className="flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                  <span
                                                    className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                                      isAi
                                                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800"
                                                        : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800"
                                                    }`}
                                                  >
                                                    {isAi ? "AI" : "Manual"}
                                                  </span>
                                                  {!qid && (
                                                    <span className="text-[10px] text-red-600 dark:text-red-400">
                                                      Missing id — cannot delete
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="font-medium text-gray-900 dark:text-white leading-relaxed">
                                                  {question.question_text}
                                                </p>

                                                {question.question_type ===
                                                  "mcq" &&
                                                  question.options && (
                                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                      {question.options.map(
                                                        (
                                                          option: string,
                                                          oIdx: number,
                                                        ) => {
                                                          const isCorrect =
                                                            isCorrectOption(
                                                              option,
                                                              oIdx,
                                                              question.correct_answer,
                                                            );
                                                          return (
                                                            <div
                                                              key={oIdx}
                                                              className={`flex items-center gap-2 px-3 py-2 rounded border text-sm transition-all ${
                                                                isCorrect
                                                                  ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 font-medium"
                                                                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                                                              }`}
                                                            >
                                                              {isCorrect ? (
                                                                <CheckCircle2
                                                                  size={16}
                                                                  className="text-green-600 dark:text-green-400 flex-shrink-0"
                                                                />
                                                              ) : (
                                                                <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-400 font-bold flex-shrink-0">
                                                                  {String.fromCharCode(
                                                                    65 + oIdx,
                                                                  )}
                                                                </span>
                                                              )}
                                                              <span>
                                                                {option}
                                                              </span>
                                                            </div>
                                                          );
                                                        },
                                                      )}
                                                    </div>
                                                  )}

                                                {question.question_type !==
                                                  "mcq" && (
                                                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                      Correct Answer
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                                                      {question.correct_answer}
                                                    </p>
                                                  </div>
                                                )}

                                                {question.explanation && (
                                                  <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700 flex items-start gap-2">
                                                    <HelpCircle
                                                      size={14}
                                                      className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5"
                                                    />
                                                    <div>
                                                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                        Explanation:{" "}
                                                      </span>
                                                      {question.explanation}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <ConfirmationModal
        isOpen={!!pendingDeleteQuestionId}
        onClose={() => {
          if (!deletingQuestionId) setPendingDeleteQuestionId(null);
        }}
        onConfirm={async () => {
          if (pendingDeleteQuestionId) {
            await performDeleteQuestion(pendingDeleteQuestionId);
          }
        }}
        title="Delete Question?"
        message="Are you sure you want to delete this question? You can replenish AI questions or add a manual question afterward to fill the slot."
        confirmText="Delete Question"
        cancelText="Cancel"
        variant="danger"
        isLoading={!!deletingQuestionId}
      />
    </AdminDashboardLayout>
  );
}
