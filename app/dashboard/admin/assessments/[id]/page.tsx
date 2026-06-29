"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Copy,
  CheckCircle,
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
  solviq_assessment_id?: string;
  package_id?: string;
  assessment_package_id?: string;
  questions_package_id?: string;
  is_published_to_solviq?: boolean;
}

interface AssessmentStats {
  total_attempts: number;
  completed_attempts: number;
  passed_attempts: number;
  failed_attempts: number;
  average_score: number;
  average_percentage: number;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getQuestionsPackageId = (source?: any): string => {
  const candidates = [
    source?.package_id,
    source?.assessment_package_id,
    source?.questions_package_id,
    source?.solviq_assessment_id,
  ];

  return (
    candidates
      .map((candidate) =>
        typeof candidate === "string" ? candidate.trim() : "",
      )
      .find((candidate) => UUID_PATTERN.test(candidate)) || ""
  );
};

const getErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.detail || error?.message || fallback;
};

const getExpectedQuestionCount = (round: any, solviqRound?: any) => {
  return (
    round?.config?.num_questions ||
    round?.questions_count ||
    solviqRound?.expected_questions ||
    solviqRound?.questions_count ||
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
  return rounds.find(
    (candidate: any) =>
      candidate.round_number === round.round_number ||
      candidate.round_id === round.id ||
      candidate.round_id === round.round_id ||
      candidate.round_type === round.round_type,
  );
};

export default function AssessmentDetailPage() {
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [generatedToken, setGeneratedToken] = useState<any>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedSolviq, setCopiedSolviq] = useState(false);
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
  const [expandedRounds, setExpandedRounds] = useState<Record<string, boolean>>(
    {},
  );

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

        const packageId = getQuestionsPackageId(assessmentRes);
        setQuestionPackageId(packageId);
        if (packageId) {
          fetchQuestions(packageId);
        } else {
          setQuestionsData(null);
          setQuestionsError(
            assessmentRes.is_published_to_solviq
              ? "Question package UUID is missing. Publish or sync this assessment to SOLVIQ to load questions."
              : "Publish this assessment to SOLVIQ to generate and manage questions.",
          );
        }
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

  const fetchQuestions = async (packageId: string) => {
    if (!UUID_PATTERN.test(packageId)) {
      setQuestionsData(null);
      setQuestionsError(
        "Question package UUID is missing. Publish or sync this assessment to SOLVIQ to load questions.",
      );
      return;
    }

    try {
      setLoadingQuestions(true);
      setQuestionsError(null);
      const data = await apiClient.get(
        `/disha/assessments/${packageId}/questions-answers`,
      );
      setQuestionsData(data);
      setQuestionPackageId(getQuestionsPackageId(data) || packageId);
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
        getErrorMessage(error, "Failed to load questions from SOLVIQ."),
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

  const handleDeleteQuestion = async (questionId: string) => {
    if (!questionId) return;
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      setDeletingQuestionId(questionId);
      setQuestionActionMessage(null);
      await apiClient.delete(`/disha/assessments/questions/${questionId}`);
      setQuestionActionMessage(
        "Question deleted. Use Replenish missing questions to recreate the required count.",
      );
      if (questionPackageId) {
        fetchQuestions(questionPackageId);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      setQuestionsError(getErrorMessage(error, "Error deleting question"));
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleReplenishQuestions = async () => {
    if (!questionPackageId) {
      setQuestionsError(
        "Question package UUID is missing. Publish or sync this assessment to SOLVIQ first.",
      );
      return;
    }

    try {
      setReplenishing(true);
      setQuestionActionMessage(null);
      setQuestionsError(null);
      const res = await apiClient.post(
        `/disha/assessments/${questionPackageId}/fill-questions`,
        {},
      );
      setQuestionActionMessage(
        `Questions replenished. Total questions added: ${res.total_questions_added || 0}.`,
      );
      fetchQuestions(questionPackageId);
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
      const packageId = getQuestionsPackageId(response);
      setQuestionPackageId(packageId);
      if (packageId) {
        fetchQuestions(packageId);
      } else {
        setQuestionsError(
          "Assessment was published, but no SOLVIQ package UUID was returned. Please sync again before managing questions.",
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to publish assessment");
    } finally {
      setIsPublishing(false);
    }
  };

  // Generate student token
  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail) return;

    try {
      setIsGeneratingToken(true);
      const response = await apiClient.generateAssessmentToken(assessmentId, {
        student_id: studentEmail,
        expires_in_minutes: 30,
      });
      setGeneratedToken(response);
    } catch (err: any) {
      setError(err.message || "Failed to generate token");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Copy token to clipboard
  const copyToClipboard = () => {
    if (generatedToken?.token) {
      navigator.clipboard.writeText(generatedToken.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const copySolviqUrl = () => {
    if (generatedToken?.solviq_url) {
      navigator.clipboard.writeText(generatedToken.solviq_url);
      setCopiedSolviq(true);
      setTimeout(() => setCopiedSolviq(false), 2000);
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
              <h1 className="text-3xl font-bold text-gray-900">
                {assessment.assessment_name}
              </h1>
              <p className="text-gray-600 mt-1">
                Assessment ID: {assessment.disha_assessment_id}
              </p>
            </div>
          </div>
          {(!assessment.is_published_to_solviq || !questionPackageId) && (
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? "Publishing..." : "Publish to SOLVIQ"}
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <StudentExamLinkSection
          assessmentId={assessment.id}
          show={Boolean(
            assessment.is_published_to_solviq && assessment.status === "ACTIVE",
          )}
        />

        {/* Status & Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {assessment.status}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Mode</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {assessment.mode}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Duration</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {assessment.total_duration_minutes}m
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Rounds</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {assessment.rounds?.length || 0}
            </p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total_attempts}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.completed_attempts}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {stats.average_percentage?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rounds */}
        {assessment.rounds && assessment.rounds.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Questions & Answers
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {canManageQuestions
                    ? `${totalLoadedQuestions} of ${totalExpectedQuestions || totalLoadedQuestions} questions loaded across ${assessment.rounds.length} rounds.`
                    : "Publish or sync this assessment to load generated questions from SOLVIQ."}
                </p>
                {questionPackageId && (
                  <p className="mt-1 text-xs text-gray-500">
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
                  Replenish Missing Questions
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
                const solviqRound = findQuestionRound(questionsData, round);
                const expectedCount = getExpectedQuestionCount(
                  round,
                  solviqRound,
                );
                const currentCount =
                  solviqRound?.questions?.length ||
                  solviqRound?.questions_count ||
                  0;
                const isShort =
                  expectedCount > 0 && currentCount < expectedCount;
                const roundKey = String(getRoundKey(round));

                return (
                  <div
                    key={round.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                            {round.round_number}
                          </span>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {round.round_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {round.round_type} • {round.duration_minutes} min
                              • {expectedCount} questions
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          Difficulty:{" "}
                          <span className="font-semibold">
                            {round.config?.difficulty}
                          </span>
                        </p>
                        {round.passing_percentage && (
                          <p className="text-sm text-gray-600">
                            Pass: {round.passing_percentage}%
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Questions Management Block */}
                    {canManageQuestions && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <button
                            onClick={() => toggleRoundExpanded(roundKey)}
                            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {expandedRounds[roundKey] ? (
                              <>
                                <ChevronUp size={16} />
                                Hide Questions ({currentCount})
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} />
                                View & Configure Questions ({currentCount})
                              </>
                            )}
                          </button>

                          {/* Missing questions warning & replenishment button */}
                          {solviqRound && isShort && (
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                <AlertCircle size={14} />
                                {expectedCount - currentCount} questions missing
                              </span>
                              <button
                                onClick={handleReplenishQuestions}
                                disabled={replenishing}
                                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-sm transition-all"
                              >
                                {replenishing ? (
                                  <RefreshCw
                                    size={12}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Sparkles size={12} />
                                )}
                                Replenish
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Expanded questions list */}
                        {expandedRounds[roundKey] && (
                          <div className="mt-4 space-y-4">
                            {loadingQuestions ? (
                              <div className="text-center py-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                                <RefreshCw
                                  size={16}
                                  className="animate-spin text-blue-600"
                                />
                                Loading questions...
                              </div>
                            ) : !solviqRound?.questions ||
                              solviqRound.questions.length === 0 ? (
                              <div className="text-center py-8 text-sm text-gray-500 border border-dashed rounded-lg bg-gray-50 flex flex-col items-center gap-2">
                                <HelpCircle
                                  size={24}
                                  className="text-gray-400"
                                />
                                <span>
                                  No questions generated yet for this round.
                                </span>
                                <button
                                  onClick={handleReplenishQuestions}
                                  disabled={replenishing}
                                  className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 shadow"
                                >
                                  {replenishing ? (
                                    <RefreshCw
                                      size={12}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Sparkles size={12} />
                                  )}
                                  Generate Questions
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {solviqRound.questions.map(
                                  (question: any, qIdx: number) => (
                                    <div
                                      key={question.question_id || qIdx}
                                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative group hover:border-gray-300 transition-all"
                                    >
                                      {/* Delete button */}
                                      <button
                                        onClick={() =>
                                          handleDeleteQuestion(
                                            question.question_id,
                                          )
                                        }
                                        disabled={
                                          deletingQuestionId ===
                                          question.question_id
                                        }
                                        className="absolute top-4 right-4 rounded-lg border border-red-100 bg-white p-1.5 text-red-600 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Delete Question"
                                      >
                                        {deletingQuestionId ===
                                        question.question_id ? (
                                          <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Trash2 size={16} />
                                        )}
                                      </button>

                                      <div className="flex items-start gap-2 pr-8">
                                        <span className="font-bold text-gray-400 min-w-[20px]">
                                          {qIdx + 1}.
                                        </span>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900 leading-relaxed">
                                            {question.question_text}
                                          </p>

                                          {/* Render Options if MCQ */}
                                          {question.question_type === "mcq" &&
                                            question.options && (
                                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {question.options.map(
                                                  (
                                                    option: string,
                                                    oIdx: number,
                                                  ) => {
                                                    const isCorrect =
                                                      option ===
                                                      question.correct_answer;
                                                    return (
                                                      <div
                                                        key={oIdx}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded border text-sm transition-all ${
                                                          isCorrect
                                                            ? "bg-green-50 border-green-200 text-green-800 font-medium"
                                                            : "bg-white border-gray-200 text-gray-700"
                                                        }`}
                                                      >
                                                        {isCorrect ? (
                                                          <CheckCircle2
                                                            size={16}
                                                            className="text-green-600 flex-shrink-0"
                                                          />
                                                        ) : (
                                                          <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-bold flex-shrink-0">
                                                            {String.fromCharCode(
                                                              65 + oIdx,
                                                            )}
                                                          </span>
                                                        )}
                                                        <span>{option}</span>
                                                      </div>
                                                    );
                                                  },
                                                )}
                                              </div>
                                            )}

                                          {/* Explanations / Answers for non-MCQ */}
                                          {question.question_type !== "mcq" && (
                                            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Correct Answer
                                              </p>
                                              <p className="text-sm font-medium text-gray-800 mt-1">
                                                {question.correct_answer}
                                              </p>
                                            </div>
                                          )}

                                          {question.explanation && (
                                            <div className="mt-3 text-xs text-gray-600 bg-white p-3 rounded border border-gray-100 flex items-start gap-2">
                                              <HelpCircle
                                                size={14}
                                                className="text-blue-500 flex-shrink-0 mt-0.5"
                                              />
                                              <div>
                                                <span className="font-semibold text-gray-700">
                                                  Explanation:{" "}
                                                </span>
                                                {question.explanation}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
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

        {/* Generate Token */}
        {/* {assessment.is_published_to_solviq && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Student Token</h2>
          <form onSubmit={handleGenerateToken} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Student Email or ID
              </label>
              <input
                type="text"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Enter student email or ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isGeneratingToken}
              />
            </div>
            <Button
              type="submit"
              disabled={isGeneratingToken || !studentEmail}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isGeneratingToken ? 'Generating...' : 'Generate Token'}
            </Button>
          </form>

          {generatedToken && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="text-green-600" size={20} />
                <p className="font-medium text-gray-900">Token Generated Successfully</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-600">SOLVIQ URL:</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copySolviqUrl}
                      className="flex items-center gap-2"
                    >
                      <Copy size={16} />
                      {copiedSolviq ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm font-mono bg-white p-2 rounded border border-gray-300 break-all">
                    {generatedToken.solviq_url}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-600">JWT Token:</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center gap-2"
                    >
                      <Copy size={16} />
                      {copiedToken ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-xs font-mono bg-white p-2 rounded border border-gray-300 break-all max-h-20 overflow-y-auto">
                    {generatedToken.token}
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  Token expires at: {new Date(generatedToken.expires_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )} */}
      </div>
    </AdminDashboardLayout>
  );
}
