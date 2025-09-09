import { CodeExecutionRequest, CodeExecutionResponse, SupportedLanguage } from '@/types/practice'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class CodeExecutionService {
  private static instance: CodeExecutionService
  private baseUrl: string

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/v1`
  }

  static getInstance(): CodeExecutionService {
    if (!CodeExecutionService.instance) {
      CodeExecutionService.instance = new CodeExecutionService()
    }
    return CodeExecutionService.instance
  }

  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/execute-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result: CodeExecutionResponse = await response.json()
      return result
    } catch (error) {
      console.error('Code execution error:', error)
      throw error
    }
  }

  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/supported-languages`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.languages.map((lang: string) => ({
        value: lang,
        label: this.getLanguageLabel(lang),
        extension: this.getLanguageExtension(lang)
      }))
    } catch (error) {
      console.error('Failed to fetch supported languages:', error)
      return []
    }
  }

  private getLanguageLabel(language: string): string {
    const labels: Record<string, string> = {
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'go': 'Go',
      'rust': 'Rust',
      'php': 'PHP',
      'ruby': 'Ruby',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'typescript': 'TypeScript',
      'scala': 'Scala',
      'r': 'R',
      'sql': 'SQL'
    }
    return labels[language] || language
  }

  private getLanguageExtension(language: string): string {
    const extensions: Record<string, string> = {
      'javascript': 'js',
      'python': 'py',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'cs',
      'go': 'go',
      'rust': 'rs',
      'php': 'php',
      'ruby': 'rb',
      'swift': 'swift',
      'kotlin': 'kt',
      'typescript': 'ts',
      'scala': 'scala',
      'r': 'r',
      'sql': 'sql'
    }
    return extensions[language] || 'txt'
  }
}

export const codeExecutionService = CodeExecutionService.getInstance()