// src/hooks/useSubmitAttempt.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Answer { 
    question_id: string; 
    answer: string[] | string; 
    time_spent: number; 
}

export const useSubmitAttempt = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      module_id: string;
      student_id: string;
      attempt_id: string;
      answers: Answer[];
      started_at: string;
      ended_at: string;
    }) => axios.post('/api/practice/submit', payload).then(r => r.data),
    onSuccess: (data) => {
      // invalidate caches as needed
      qc.invalidateQueries({ queryKey: ['practice', data.module_id] });
    },
    onError: (err) => {
      console.error('Submit failed', err);
      // optionally push attempt to retry queue (localStorage)
    },
  });
};
