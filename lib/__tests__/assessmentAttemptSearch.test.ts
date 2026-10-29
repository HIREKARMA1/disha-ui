import { filterAssessmentAttemptsBySearch } from '@/lib/assessmentAnalytics'

const attempts = [
  { id: '1', student_name: 'Ada Lovelace', student_email: 'ada@example.com', student_id: 'uuid-ada' },
  { id: '2', student_name: 'Grace Hopper', email: 'grace@example.com', student_id: 'uuid-grace' },
]

describe('filterAssessmentAttemptsBySearch', () => {
  it('matches student name case-insensitively', () => {
    expect(filterAssessmentAttemptsBySearch(attempts, 'ada')).toHaveLength(1)
    expect(filterAssessmentAttemptsBySearch(attempts, 'LOVELACE')).toHaveLength(1)
  })

  it('matches student email', () => {
    expect(filterAssessmentAttemptsBySearch(attempts, 'grace@')).toHaveLength(1)
  })

  it('matches assessment title when provided', () => {
    expect(filterAssessmentAttemptsBySearch(attempts, 'aptitude', 'Campus Aptitude Test')).toHaveLength(2)
  })

  it('returns all rows for empty or whitespace search', () => {
    expect(filterAssessmentAttemptsBySearch(attempts, '')).toHaveLength(2)
    expect(filterAssessmentAttemptsBySearch(attempts, '   ')).toHaveLength(2)
  })

  it('returns no rows when nothing matches', () => {
    expect(filterAssessmentAttemptsBySearch(attempts, 'no-match')).toHaveLength(0)
  })
})
