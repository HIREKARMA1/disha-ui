import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { config } from '@/lib/config'
import { 
    PracticeModule, 
    Question, 
    SubmitAttemptRequest, 
    SubmitAttemptResponse,
    PracticeStats,
    StudentAttempt
} from '@/types/practice'

// Check if we should use mock data
const USE_MOCK_DATA = false // Disable mock data to use real API

// Mock data for development
const mockModules: PracticeModule[] = [
    {
        id: 'mod-dev-1',
        title: 'Full-length Mock - Developer',
        role: 'Developer',
        duration_seconds: 3600,
        questions_count: 3,
        question_ids: ['q1', 'q2', 'q3'],
        is_archived: false,
        description: 'Comprehensive developer assessment covering programming fundamentals, algorithms, and system design.',
        difficulty: 'medium',
        tags: ['programming', 'algorithms', 'system-design'],
        category: 'ai-mock-tests'
    },
    {
        id: 'mod-apt-1',
        title: 'Aptitude Quick Test',
        role: 'General',
        duration_seconds: 1800,
        questions_count: 2,
        question_ids: ['q4', 'q5'],
        is_archived: false,
        description: 'Quick aptitude test covering logical reasoning, quantitative analysis, and verbal ability.',
        difficulty: 'easy',
        tags: ['aptitude', 'logical-reasoning', 'quantitative'],
        category: 'ai-mock-tests'
    },
    {
        id: 'mod-coding-1',
        title: '100-Day Coding Sprint',
        role: 'Developer',
        duration_seconds: 5400,
        questions_count: 1,
        question_ids: ['q6'],
        is_archived: false,
        description: 'Intensive coding challenge with complex algorithmic problems and system design questions.',
        difficulty: 'hard',
        tags: ['coding', 'algorithms', 'data-structures'],
        category: 'coding-practice'
    },
    {
        id: 'mod-interview-1',
        title: 'AI Mock Interview - Software Engineer',
        role: 'Developer',
        duration_seconds: 2700,
        questions_count: 5,
        question_ids: ['q7', 'q8', 'q9', 'q10', 'q11'],
        is_archived: false,
        description: 'Practice technical interviews with AI-powered feedback and evaluation.',
        difficulty: 'medium',
        tags: ['interview', 'technical', 'ai-feedback'],
        category: 'ai-mock-interviews'
    },
    {
        id: 'mod-challenge-1',
        title: 'Weekly Coding Challenge',
        role: 'Developer',
        duration_seconds: 3600,
        questions_count: 3,
        question_ids: ['q12', 'q13', 'q14'],
        is_archived: false,
        description: 'Weekly coding challenges to improve problem-solving skills.',
        difficulty: 'medium',
        tags: ['challenge', 'problem-solving', 'weekly'],
        category: 'challenges-engagement'
    },
    {
        id: 'mod-interview-2',
        title: 'AI Mock Interview - Data Scientist',
        role: 'Data Scientist',
        duration_seconds: 3000,
        questions_count: 4,
        question_ids: ['q15', 'q16', 'q17', 'q18'],
        is_archived: false,
        description: 'Data science interview practice with AI evaluation.',
        difficulty: 'hard',
        tags: ['interview', 'data-science', 'ai-feedback'],
        category: 'ai-mock-interviews'
    },
    {
        id: 'mod-coding-2',
        title: 'Algorithm Practice Set',
        role: 'Developer',
        duration_seconds: 2400,
        questions_count: 6,
        question_ids: ['q19', 'q20', 'q21', 'q22', 'q23', 'q24'],
        is_archived: false,
        description: 'Practice various algorithms and data structures.',
        difficulty: 'medium',
        tags: ['algorithms', 'data-structures', 'practice'],
        category: 'coding-practice'
    },
    {
        id: 'mod-challenge-2',
        title: 'Hackathon Practice',
        role: 'General',
        duration_seconds: 7200,
        questions_count: 4,
        question_ids: ['q25', 'q26', 'q27', 'q28'],
        is_archived: false,
        description: 'Simulate hackathon environment with time-pressured challenges.',
        difficulty: 'hard',
        tags: ['hackathon', 'time-pressure', 'teamwork'],
        category: 'challenges-engagement'
    }
]

const mockQuestions: Record<string, Question[]> = {
    'mod-dev-1': [
        {
            id: 'q1',
            statement: 'What is the output of <code>console.log(typeof NaN)</code>?',
            type: 'mcq_single',
            options: [
                { id: 'a', text: 'number' },
                { id: 'b', text: 'NaN' },
                { id: 'c', text: 'undefined' }
            ],
            correct_options: ['a'],
            explanation: 'NaN is of type "number" in JavaScript, even though it represents "Not a Number".',
            tags: ['javascript', 'types'],
            role: 'Developer',
            difficulty: 'easy',
            time_limit_seconds: 120
        },
        {
            id: 'q2',
            statement: 'Choose all stable sorting algorithms.',
            type: 'mcq_multi',
            options: [
                { id: 'a', text: 'Merge sort' },
                { id: 'b', text: 'Quick sort' },
                { id: 'c', text: 'Insertion sort' }
            ],
            correct_options: ['a', 'c'],
            explanation: 'Merge sort and Insertion sort are stable sorting algorithms. Quick sort is not stable.',
            tags: ['algorithms', 'sorting'],
            role: 'Developer',
            difficulty: 'medium',
            time_limit_seconds: 180
        },
        {
            id: 'q3',
            statement: 'Explain the time complexity of binary search.',
            type: 'descriptive',
            explanation: 'Binary search has O(log n) time complexity because it eliminates half of the search space in each iteration.',
            tags: ['algorithms', 'search'],
            role: 'Developer',
            difficulty: 'medium',
            time_limit_seconds: 300
        }
    ],
    'mod-apt-1': [
        {
            id: 'q4',
            statement: 'If a train travels 120 km in 2 hours, what is its average speed?',
            type: 'mcq_single',
            options: [
                { id: 'a', text: '60 km/h' },
                { id: 'b', text: '40 km/h' },
                { id: 'c', text: '80 km/h' }
            ],
            correct_options: ['a'],
            explanation: 'Average speed = Total distance / Total time = 120 km / 2 hours = 60 km/h',
            tags: ['mathematics', 'speed'],
            role: 'General',
            difficulty: 'easy',
            time_limit_seconds: 90
        },
        {
            id: 'q5',
            statement: 'Complete the series: 2, 4, 8, 16, ?',
            type: 'mcq_single',
            options: [
                { id: 'a', text: '24' },
                { id: 'b', text: '32' },
                { id: 'c', text: '20' }
            ],
            correct_options: ['b'],
            explanation: 'The series follows the pattern of powers of 2: 2^1, 2^2, 2^3, 2^4, 2^5 = 32',
            tags: ['logical-reasoning', 'series'],
            role: 'General',
            difficulty: 'easy',
            time_limit_seconds: 120
        }
    ],
    'mod-coding-1': [
        {
            id: 'q6',
            statement: 'Implement a function to find the longest common subsequence between two strings.',
            type: 'coding',
            explanation: 'Use dynamic programming to solve this problem efficiently.',
            tags: ['dynamic-programming', 'strings', 'algorithms'],
            role: 'Developer',
            difficulty: 'hard',
            time_limit_seconds: 1800
        }
    ]
}

// Mock API functions
const mockApi = {
    getModules: async (): Promise<PracticeModule[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        return mockModules.filter(module => !module.is_archived)
    },

    getQuestions: async (moduleId: string): Promise<Question[]> => {
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockQuestions[moduleId] || []
    },

    submitAttempt: async (request: SubmitAttemptRequest): Promise<SubmitAttemptResponse> => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock scoring logic
        const questions = mockQuestions[request.module_id] || []
        const questionResults = questions.map(q => {
            const userAnswer = request.answers.find(a => a.question_id === q.id)
            const isCorrect = userAnswer && q.correct_options 
                ? JSON.stringify(userAnswer.answer.sort()) === JSON.stringify(q.correct_options.sort())
                : false
            
            return {
                question_id: q.id,
                is_correct: isCorrect,
                explanation: q.explanation
            }
        })

        const correctCount = questionResults.filter(r => r.is_correct).length
        const scorePercent = (correctCount / questions.length) * 100

        // Mock weak areas based on tags
        const weakAreas = [
            { tag: 'algorithms', accuracy: Math.random() * 100 },
            { tag: 'javascript', accuracy: Math.random() * 100 },
            { tag: 'data-structures', accuracy: Math.random() * 100 }
        ].filter(area => area.accuracy < 70)

        return {
            attempt_id: request.attempt_id,
            module_id: request.module_id,
            score_percent: scorePercent,
            time_taken_seconds: request.answers.reduce((sum, a) => sum + a.time_spent, 0),
            weak_areas: weakAreas,
            role_fit_score: scorePercent + (Math.random() * 20 - 10), // Add some variance
            question_results: questionResults
        }
    },

    getStats: async (): Promise<PracticeStats> => {
        await new Promise(resolve => setTimeout(resolve, 300))
        return {
            totalAttempts: 15,
            averageScore: 72.5,
            bestScore: 95.0,
            totalTimeSpent: 7200,
            weakAreas: [
                { tag: 'algorithms', accuracy: 65.0 },
                { tag: 'system-design', accuracy: 45.0 }
            ],
            recentAttempts: [
                {
                    moduleId: 'mod-dev-1',
                    moduleTitle: 'Full-length Mock - Developer',
                    score: 85.0,
                    date: '2024-01-15'
                }
            ]
        }
    }
}

// Custom hooks using useState and useEffect
export function usePracticeModules() {
    const [data, setData] = useState<PracticeModule[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchModules = async () => {
            try {
                setIsLoading(true)
                
                // Always use real API calls - no mock data
                console.log('🔄 Fetching real practice modules')
                const response = await apiClient.client.get('/practice/modules')
                console.log('📚 Real modules received:', response.data)
                setData(response.data)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch modules'))
                console.error('Error fetching practice modules:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchModules()
    }, [])

    return { data, isLoading, error }
}

export function usePracticeQuestions(moduleId: string) {
    const [data, setData] = useState<Question[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!moduleId) {
            setData([])
            setIsLoading(false)
            return
        }

        // Clear any cached data
        setData([])
        setError(null)
        
        // Force clear any cached data in localStorage
        const cacheKeys = ['practice-questions', 'practice-modules']
        cacheKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key)
                console.log('🗑️ Cleared cached data:', key)
            }
        })

        const fetchQuestions = async () => {
            try {
                setIsLoading(true)
                
                // Always use real API calls - no mock data
                console.log('🔄 Fetching real questions for module:', moduleId)
                const response = await apiClient.client.get(`/practice/modules/${moduleId}`)
                console.log('📚 Real questions received:', response.data.questions)
                console.log('📚 Question count:', response.data.questions?.length || 0)
                console.log('📚 Question IDs:', response.data.questions?.map(q => q.id) || [])
                setData(response.data.questions || [])
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch questions'))
                console.error('Error fetching practice questions:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchQuestions()
    }, [moduleId])

    return { data, isLoading, error }
}

export function useSubmitAttempt() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (request: SubmitAttemptRequest): Promise<SubmitAttemptResponse> => {
        try {
            setIsPending(true)
            setError(null)
            
            // Always use real API calls - no mock data
            console.log('🚀 Submitting practice attempt:', request)
            const response = await apiClient.client.post('/practice/submit', request)
            console.log('✅ Practice attempt submitted successfully:', response.data)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to submit attempt')
            setError(error)
            console.error('❌ Error submitting practice attempt:', err)
            if (err && typeof err === 'object' && 'response' in err) {
                console.error('❌ Error response:', (err as any).response?.data)
                console.error('❌ Error status:', (err as any).response?.status)
            }
            throw error
        } finally {
            setIsPending(false)
        }
    }

    return { mutateAsync, isPending, error }
}

export function usePracticeStats() {
    const [data, setData] = useState<PracticeStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true)
                
                // Always use real API calls - no mock data
                console.log('🔄 Fetching real practice stats')
                const response = await apiClient.client.get('/practice/stats')
                console.log('📚 Real stats received:', response.data)
                setData(response.data)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch stats'))
                console.error('Error fetching practice stats:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [])

    return { data, isLoading, error }
}

// TODO: Replace with real API calls when backend is available
/*
export function usePracticeModules() {
    return useQuery({
        queryKey: ['practice-modules'],
        queryFn: () => apiClient.client.get('/api/practice/modules'),
        staleTime: 5 * 60 * 1000,
    })
}
*/

