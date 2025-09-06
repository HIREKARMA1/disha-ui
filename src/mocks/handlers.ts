// src/mocks/handlers.ts
import { rest } from 'msw';

const exampleModule = {
  id: 'mod-dev-1',
  title: 'Full-length Mock - Developer',
  role: 'Developer',
  duration_seconds: 3600,
  questions_count: 3,
  question_ids: ['q1','q2','q3'],
};

const questions = {
  q1: {
    id: 'q1',
    statement: 'What is output of `console.log(typeof NaN)`?',
    type: 'mcq_single',
    options: [{ id: 'a', text: 'number' }, { id: 'b', text: 'NaN' }, { id: 'c', text: 'undefined' }],
    tags: ['javascript','types'],
  },
  q2: {
    id: 'q2',
    statement: 'Choose all stable sorting algorithms.',
    type: 'mcq_multi',
    options: [{ id: 'a', text: 'Merge sort' }, { id: 'b', text: 'Quick sort' }, { id: 'c', text: 'Insertion sort' }],
    tags: ['algorithms','sorting'],
  },
  q3: {
    id: 'q3',
    statement: 'Explain the time complexity of binary search.',
    type: 'descriptive',
    options: [],
    tags: ['algorithms','search'],
  },
};

export const handlers = [
  // GET modules
  rest.get('/api/practice/modules', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([exampleModule]));
  }),

  // GET module by id -> includes questions (light)
  rest.get('/api/practice/modules/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...exampleModule,
        questions: [questions.q1, questions.q2, questions.q3],
      })
    );
  }),

  // Submit attempt
  rest.post('/api/practice/submit', async (req, res, ctx) => {
    const body = await req.json();
    // naive scoring: mark MCQ single correct for q1->a, q2->a,c
    const results = body.answers.map((ans: any) => {
      if (ans.question_id === 'q1') {
        return { question_id: 'q1', is_correct: ans.answer?.[0] === 'a', explanation: 'Because NaN type is number.' };
      }
      if (ans.question_id === 'q2') {
        const correct = ['a','c'];
        const same = JSON.stringify(ans.answer?.sort()) === JSON.stringify(correct.sort());
        return { question_id: 'q2', is_correct: same, explanation: 'Merge and insertion sort are stable.' };
      }
      return { question_id: ans.question_id, is_correct: false, explanation: 'Manual grading required.' };
    });

    // compute simple percent
    const correctCount = results.filter((r:any) => r.is_correct).length;
    const percent = (correctCount / results.length) * 100;

    return res(
      ctx.status(200),
      ctx.json({
        attempt_id: 'attempt-123',
        module_id: body.module_id,
        score_percent: percent,
        time_taken_seconds: (new Date(body.ended_at).getTime() - new Date(body.started_at).getTime()) / 1000,
        weak_areas: [{ tag: 'algorithms', accuracy: 40 }],
        role_fit_score: 70 + (percent/10),
        question_results: results,
      })
    );
  }),

  // Bulk upload (admin) - rudimentary
  rest.post('/api/admin/practice/questions/bulk', async (req, res, ctx) => {
    // If file upload: respond with success with row count.
    return res(ctx.status(200), ctx.json({ imported: 4, invalid: 1 }));
  }),
];
