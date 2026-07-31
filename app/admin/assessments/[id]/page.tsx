"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Legacy /admin/assessments/[id] route — redirect to the dashboard detail page
 * that has delete + AI replenish + manual question entry.
 */
export default function LegacyAssessmentDetailsRedirect() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  useEffect(() => {
    if (assessmentId) {
      router.replace(`/dashboard/admin/assessments/${assessmentId}`);
    }
  }, [assessmentId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );
}
