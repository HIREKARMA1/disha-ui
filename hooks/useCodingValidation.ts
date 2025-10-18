import { useState } from 'react'
import { apiClient } from '@/lib/api'

interface TestCaseResult {
    test_case_id: number
    input: string
    expected_output: string
    actual_output: string
    passed: boolean
    points: number
    is_hidden: boolean
}

interface ValidationResponse {
    valid: boolean
    message: string
    test_results: TestCaseResult[]
    total_tests: number
    passed_tests: number
}

export function useCodingValidation() {
    const [isValidating, setIsValidating] = useState(false)
    const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const validateCode = async (questionId: string, code: string, language: string = 'python') => {
        setIsValidating(true)
        setError(null)
        setValidationResult(null)

        try {
            const params = new URLSearchParams({
                question_id: questionId,
                code: code,
                language: language
            })
            
            const response = await apiClient.client.post(`/practice/validate-coding-answer?${params.toString()}`)

            setValidationResult(response.data)
            return response.data
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to validate code'
            setError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setIsValidating(false)
        }
    }

    const clearValidation = () => {
        setValidationResult(null)
        setError(null)
    }

    return {
        isValidating,
        validationResult,
        error,
        validateCode,
        clearValidation
    }
}
