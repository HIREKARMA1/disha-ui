"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Clock, Users, AlertCircle } from "lucide-react";

export default function AssessmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const assessment_id = params.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");

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
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
    } finally {
      setLoading(false);
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
            <div className="text-right">
              <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(assessment.status)}`}>
                {assessment.status}
              </span>
              {assessment.is_published_to_solviq && (
                <div className="mt-3 text-sm text-green-600 font-medium">
                  ✓ Published to SOLVIQ
                </div>
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
                {assessment.rounds.map((round: any) => (
                  <div key={round.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                            {round.round_number}
                          </span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{round.round_name}</h3>
                            <p className="text-sm text-gray-600">
                              {round.round_type} • {round.duration_minutes} min • {round.config.num_questions} questions
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          Difficulty: <span className="font-semibold">{round.config.difficulty}</span>
                        </p>
                        {round.passing_percentage && (
                          <p className="text-sm text-gray-600">
                            Pass: {round.passing_percentage}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
