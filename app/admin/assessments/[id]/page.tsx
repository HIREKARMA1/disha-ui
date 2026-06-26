"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Clock, Users, AlertCircle, ChevronDown, ChevronUp, Trash2, Sparkles, CheckCircle2, HelpCircle, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function AssessmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const assessment_id = params.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  // const [generatingToken, setGeneratingToken] = useState(false);
  // const [studentEmail, setStudentEmail] = useState("");

  const [questionsData, setQuestionsData] = useState<any>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [replenishing, setReplenishing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchAssessment();
  }, [assessment_id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/admin/assessments/${assessment_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssessment(data);
        fetchStats();
        if (data.solviq_assessment_id) {
          fetchQuestions(data.solviq_assessment_id);
        }
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (packageId: string) => {
    if (!packageId || packageId.startsWith("SOLVIQ-")) return;
    try {
      setLoadingQuestions(true);
      const data = await apiClient.get(`/disha/assessments/${packageId}/questions-answers`);
      setQuestionsData(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const toggleRoundExpanded = (roundNumber: number) => {
    setExpandedRounds(prev => ({
      ...prev,
      [roundNumber]: !prev[roundNumber]
    }));
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await apiClient.delete(`/disha/assessments/questions/${questionId}`);
      alert("Question deleted successfully!");
      if (assessment?.solviq_assessment_id) {
        fetchQuestions(assessment.solviq_assessment_id);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Error deleting question");
    }
  };

  const handleReplenishQuestions = async () => {
    if (!assessment?.solviq_assessment_id) return;
    try {
      setReplenishing(true);
      const res = await apiClient.post(`/disha/assessments/${assessment.solviq_assessment_id}/fill-questions`, {});
      alert(`Questions replenished! Total questions added: ${res.total_questions_added || 0}`);
      fetchQuestions(assessment.solviq_assessment_id);
    } catch (error) {
      console.error("Error replenishing questions:", error);
      alert("Error replenishing questions");
    } finally {
      setReplenishing(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const response = await fetch(`/api/v1/admin/assessments/${assessment_id}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        alert("Assessment published to SOLVIQ successfully!");
        fetchAssessment();
      } else {
        alert("Failed to publish assessment");
      }
    } catch (error) {
      console.error("Error publishing assessment:", error);
      alert("Error publishing assessment");
    } finally {
      setPublishing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/v1/admin/assessments/${assessment_id}/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  /*
  const generateStudentToken = async () => {
    if (!studentEmail) {
      alert("Please enter student email");
      return;
    }

    try {
      setGeneratingToken(true);
      const response = await fetch(`/api/v1/admin/assessments/${assessment_id}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          student_id: studentEmail,
          assessment_id: assessment_id,
          expires_in_minutes: 30,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Copy to clipboard
        navigator.clipboard.writeText(data.solviq_url);
        alert("SOLVIQ URL copied to clipboard! Students can open this link to take the assessment.");
        setStudentEmail("");
      }
    } catch (error) {
      console.error("Error generating token:", error);
      alert("Error generating token");
    } finally {
      setGeneratingToken(false);
    }
  };
  */

  if (loading) {
    return <div className="text-center py-12">Loading assessment...</div>;
  }

  if (!assessment) {
    return <div className="text-center py-12 text-red-600">Assessment not found</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      ACTIVE: "bg-green-100 text-green-800",
      PAUSED: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg p-8 mb-8 border">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900">{assessment.assessment_name}</h1>
              <p className="text-gray-600 mt-2">{assessment.disha_assessment_id}</p>
              <p className="text-gray-700 mt-4">{assessment.description}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
              <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(assessment.status)}`}>
                {assessment.status}
              </span>
              {assessment.is_published_to_solviq && !assessment.solviq_assessment_id?.startsWith("SOLVIQ-") ? (
                <div className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  ✓ Published to SOLVIQ
                </div>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {publishing ? "Publishing..." : "Publish to SOLVIQ"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Duration</p>
                <p className="text-2xl font-bold">{assessment.total_duration_minutes} min</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center gap-3">
              <Users className="text-green-600" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Attempts</p>
                <p className="text-2xl font-bold">{stats?.total_attempts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div>
              <p className="text-gray-600 text-sm">Passed</p>
              <p className="text-2xl font-bold text-green-600">{stats?.passed_attempts || 0}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div>
              <p className="text-gray-600 text-sm">Avg Score</p>
              <p className="text-2xl font-bold">{stats?.average_score?.toFixed(1) || "N/A"}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Details */}
          <div className="col-span-2">
            {/* Rounds */}
            <div className="bg-white rounded-lg p-6 border mb-8">
              <h2 className="text-2xl font-bold mb-6">Assessment Rounds ({assessment.rounds.length})</h2>
              <div className="space-y-4">
                {assessment.rounds.map((round: any) => {
                  const solviqRound = questionsData?.rounds?.find((r: any) => r.round_number === round.round_number);
                  const expectedCount = round.config?.num_questions || 0;
                  const currentCount = solviqRound?.questions?.length || 0;
                  const isShort = expectedCount > 0 && currentCount < expectedCount;

                  return (
                    <div key={round.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                              {round.round_number}
                            </span>
                            <div>
                              <h3 className="font-semibold text-gray-900">{round.round_name}</h3>
                              <p className="text-sm text-gray-600">
                                {round.round_type} • {round.duration_minutes} min • {expectedCount} questions
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">
                            Difficulty: <span className="font-semibold">{round.config?.difficulty}</span>
                          </p>
                          {round.passing_percentage && (
                            <p className="text-sm text-gray-600">
                              Pass: {round.passing_percentage}%
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Questions Management Block */}
                      {assessment.is_published_to_solviq && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <button
                              onClick={() => toggleRoundExpanded(round.round_number)}
                              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              {expandedRounds[round.round_number] ? (
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
                                    <RefreshCw size={12} className="animate-spin" />
                                  ) : (
                                    <Sparkles size={12} />
                                  )}
                                  Replenish
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Expanded questions list */}
                          {expandedRounds[round.round_number] && (
                            <div className="mt-4 space-y-4">
                              {loadingQuestions ? (
                                <div className="text-center py-6 text-sm text-gray-500 flex items-center justify-center gap-2">
                                  <RefreshCw size={16} className="animate-spin text-blue-600" />
                                  Loading questions...
                                </div>
                              ) : !solviqRound?.questions || solviqRound.questions.length === 0 ? (
                                <div className="text-center py-8 text-sm text-gray-500 border border-dashed rounded-lg bg-gray-50 flex flex-col items-center gap-2">
                                  <HelpCircle size={24} className="text-gray-400" />
                                  <span>No questions generated yet for this round.</span>
                                  <button
                                    onClick={handleReplenishQuestions}
                                    disabled={replenishing}
                                    className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 shadow"
                                  >
                                    {replenishing ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                    Generate Questions
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {solviqRound.questions.map((question: any, qIdx: number) => (
                                    <div key={question.question_id || qIdx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative group hover:border-gray-300 transition-all">
                                      {/* Delete button */}
                                      <button
                                        onClick={() => handleDeleteQuestion(question.question_id)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Question"
                                      >
                                        <Trash2 size={16} />
                                      </button>

                                      <div className="flex items-start gap-2 pr-8">
                                        <span className="font-bold text-gray-400 min-w-[20px]">{qIdx + 1}.</span>
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900 leading-relaxed">{question.question_text}</p>
                                          
                                          {/* Render Options if MCQ */}
                                          {question.question_type === "mcq" && question.options && (
                                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                              {question.options.map((option: string, oIdx: number) => {
                                                const isCorrect = option === question.correct_answer;
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
                                                      <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                                                    ) : (
                                                      <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-bold flex-shrink-0">
                                                        {String.fromCharCode(65 + oIdx)}
                                                      </span>
                                                    )}
                                                    <span>{option}</span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}

                                          {/* Explanations / Answers for non-MCQ */}
                                          {question.question_type !== "mcq" && (
                                            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Correct Answer</p>
                                              <p className="text-sm font-medium text-gray-800 mt-1">{question.correct_answer}</p>
                                            </div>
                                          )}

                                          {question.explanation && (
                                            <div className="mt-3 text-xs text-gray-600 bg-white p-3 rounded border border-gray-100 flex items-start gap-2">
                                              <HelpCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                              <div>
                                                <span className="font-semibold text-gray-700">Explanation: </span>
                                                {question.explanation}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
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

            {/* Instructions */}
            {assessment.instructions && (
              <div className="bg-white rounded-lg p-6 border mb-8">
                <h2 className="text-2xl font-bold mb-4">Instructions</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{assessment.instructions}</p>
              </div>
            )}

            {/* Time Window */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-2xl font-bold mb-4">Time Window</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Start Time</p>
                  <p className="text-lg font-semibold">
                    {new Date(assessment.start_time).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Time</p>
                  <p className="text-lg font-semibold">
                    {new Date(assessment.end_time).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Student Access */}
            {/*
            {assessment.is_published_to_solviq && (
              <div className="bg-white rounded-lg p-6 border mb-8">
                <h3 className="text-lg font-bold mb-4">Generate Student Token</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Student ID or Email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={generateStudentToken}
                    disabled={generatingToken}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {generatingToken ? "Generating..." : "Generate Token"}
                  </button>
                  <p className="text-sm text-gray-600">
                    Creates a link students can use to access this assessment on SOLVIQ
                  </p>
                </div>
              </div>
            )}
            */}

            {/* Passing Criteria */}
            {assessment.passing_criteria && (
              <div className="bg-white rounded-lg p-6 border mb-8">
                <h3 className="text-lg font-bold mb-4">Passing Criteria</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Percentage</span>
                    <span className="font-semibold">
                      {assessment.passing_criteria.overall_percentage}%
                    </span>
                  </div>
                  {assessment.passing_criteria.minimum_round_scores && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Min Round Scores</p>
                      {Object.entries(assessment.passing_criteria.minimum_round_scores).map(
                        ([round, score]: any) => (
                          <div key={round} className="flex justify-between text-sm">
                            <span className="text-gray-600">{round}</span>
                            <span>{score}%</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SOLVIQ Info */}
            {assessment.is_published_to_solviq && (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex gap-3">
                  <AlertCircle className="text-green-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-green-800">Published to SOLVIQ</p>
                    <p className="text-sm text-green-700 mt-1">
                      SOLVIQ ID: <code className="bg-green-100 px-2 py-1 rounded">{assessment.solviq_assessment_id}</code>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
