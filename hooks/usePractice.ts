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
const USE_MOCK_DATA = config.features.useMockData

// Mock data for development (only used when NEXT_PUBLIC_USE_MOCK_DATA=true)
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
        tags: ['programming', 'algorithms', 'system-design']
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
        tags: ['aptitude', 'logical-reasoning', 'quantitative']
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
        tags: ['coding', 'algorithms', 'data-structures']
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
                
                if (USE_MOCK_DATA) {
                    // Use mock data in development
                    const modules = await mockApi.getModules()
                    setData(modules)
                } else {
                    // Use real API calls
                    const modules = await apiClient.getPracticeModules()
                    setData(modules)
                }
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

        const fetchQuestions = async () => {
            try {
                setIsLoading(true)
                
                if (USE_MOCK_DATA) {
                    // Use mock data in development
                    const questions = await mockApi.getQuestions(moduleId)
                    setData(questions)
                } else {
                    // Use real API calls
                    const moduleData = await apiClient.getPracticeModuleWithQuestions(moduleId)
                    setData(moduleData.questions || [])
                }
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
            
            if (USE_MOCK_DATA) {
                // Use mock data in development
                const result = await mockApi.submitAttempt(request)
                return result
            } else {
                // Use real API calls
                const result = await apiClient.submitPracticeAttempt(request)
                return result
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to submit attempt')
            setError(error)
            console.error('Error submitting practice attempt:', err)
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
                
                if (USE_MOCK_DATA) {
                    // Use mock data in development
                    const stats = await mockApi.getStats()
                    setData(stats)
                } else {
                    // Use real API calls
                    const stats = await apiClient.getPracticeStats()
                    setData(stats)
                }
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

export function usePracticeQuestions(moduleId: string) {
    return useQuery({
        queryKey: ['practice-questions', moduleId],
        queryFn: () => apiClient.client.get(`/api/practice/modules/${moduleId}/questions`),
        enabled: !!moduleId,
        staleTime: 10 * 60 * 1000,
    })
}

export function useSubmitAttempt() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (request: SubmitAttemptRequest) => 
            apiClient.client.post('/api/practice/submit', request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['practice-stats'] })
        },
    })
}
*/