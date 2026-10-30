'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AssessmentExam } from '@/components/assessments/AssessmentExam';
import { Loader2 } from 'lucide-react';
import { buildAuthPath } from '@/lib/authLinks';

export default function AssessmentExamTakePage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;
  const attemptId = search.get('attempt') || '';
  const slExam = search.get('sl_exam') || '';
  const { user, isAuthenticated, isLoading } = useAuth();

  if (slExam && typeof window !== 'undefined') {
    sessionStorage.setItem('disha_sl_exam_token', slExam);
  }

  useEffect(() => {
    if (slExam) return;
    if (isLoading) return;
    if (!isAuthenticated || user?.user_type !== 'student') {
      router.replace(
        buildAuthPath('/auth/login', {
          type: 'student',
          redirect: `/assessments/exam/${assessmentId}/take?attempt=${attemptId}`,
        })
      );
    }
  }, [slExam, isLoading, isAuthenticated, user, router, assessmentId, attemptId]);

  if (!attemptId || (!slExam && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return <AssessmentExam assessmentId={assessmentId} attemptId={attemptId} />;
}
