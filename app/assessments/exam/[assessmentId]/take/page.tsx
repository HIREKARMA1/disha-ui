'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AssessmentExam } from '@/components/assessments/AssessmentExam';
import { Loader2 } from 'lucide-react';

export default function AssessmentExamTakePage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;
  const attemptId = search.get('attempt') || '';
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.user_type !== 'student') {
      router.replace(
        `/auth/login?type=student&redirect=${encodeURIComponent(
          `/assessments/exam/${assessmentId}/take?attempt=${attemptId}`
        )}`
      );
    }
  }, [isLoading, isAuthenticated, user, router, assessmentId, attemptId]);

  if (isLoading || !attemptId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return <AssessmentExam assessmentId={assessmentId} attemptId={attemptId} />;
}
