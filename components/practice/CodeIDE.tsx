"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Square, Download, Upload, RotateCcw, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { codeExecutionService } from '@/lib/codeExecution'

interface CodeIDEProps {
    code: string
    onCodeChange: (code: string) => void
    onOutputSubmit: (output: string) => void
    language?: string
    onLanguageChange?: (language: string) => void
    isExecuting?: boolean
    output?: string
    error?: string
    className?: string
}

const SUPPORTED_LANGUAGES = [
    { value: 'javascript', label: 'JavaScript', extension: 'js' },
    { value: 'python', label: 'Python', extension: 'py' },
    { value: 'java', label: 'Java', extension: 'java' },
    { value: 'cpp', label: 'C++', extension: 'cpp' },
    { value: 'c', label: 'C', extension: 'c' },
    { value: 'csharp', label: 'C#', extension: 'cs' },
    { value: 'go', label: 'Go', extension: 'go' },
    { value: 'rust', label: 'Rust', extension: 'rs' },
    { value: 'php', label: 'PHP', extension: 'php' },
    { value: 'ruby', label: 'Ruby', extension: 'rb' },
    { value: 'swift', label: 'Swift', extension: 'swift' },
    { value: 'kotlin', label: 'Kotlin', extension: 'kt' },
    { value: 'typescript', label: 'TypeScript', extension: 'ts' },
    { value: 'scala', label: 'Scala', extension: 'scala' },
    { value: 'r', label: 'R', extension: 'r' },
    { value: 'sql', label: 'SQL', extension: 'sql' }
]

const LANGUAGE_TEMPLATES: Record<string, string> = {
    javascript: `// Write your JavaScript code here
function solution() {
    // Your solution goes here
    return "Hello World";
}

// Test your solution
console.log(solution());`,
    python: `# Write your Python code here
def solution():
    # Your solution goes here
    return "Hello World"

# Test your solution
print(solution())`,
    java: `// Write your Java code here
public class Solution {
    public static void main(String[] args) {
        // Your solution goes here
        System.out.println("Hello World");
    }
}`,
    cpp: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    // Your solution goes here
    cout << "Hello World" << endl;
    return 0;
}`,
    c: `// Write your C code here
#include <stdio.h>

int main() {
    // Your solution goes here
    printf("Hello World\\n");
    return 0;
}`,
    csharp: `// Write your C# code here
using System;

class Program {
    static void Main() {
        // Your solution goes here
        Console.WriteLine("Hello World");
    }
}`,
    go: `// Write your Go code here
package main

import "fmt"

func main() {
    // Your solution goes here
    fmt.Println("Hello World")
}`,
    rust: `// Write your Rust code here
fn main() {
    // Your solution goes here
    println!("Hello World");
}`,
    php: `<?php
// Write your PHP code here
function solution() {
    // Your solution goes here
    return "Hello World";
}

// Test your solution
echo solution();
?>`,
    ruby: `# Write your Ruby code here
def solution
    # Your solution goes here
    "Hello World"
end

# Test your solution
puts solution`,
    swift: `// Write your Swift code here
import Foundation

func solution() -> String {
    // Your solution goes here
    return "Hello World"
}

// Test your solution
print(solution())`,
    kotlin: `// Write your Kotlin code here
fun main() {
    // Your solution goes here
    println("Hello World")
}`,
    typescript: `// Write your TypeScript code here
function solution(): string {
    // Your solution goes here
    return "Hello World";
}

// Test your solution
console.log(solution());`,
    scala: `// Write your Scala code here
object Solution {
    def main(args: Array[String]): Unit = {
        // Your solution goes here
        println("Hello World")
    }
}`,
    r: `# Write your R code here
solution <- function() {
    # Your solution goes here
    return("Hello World")
}

# Test your solution
print(solution())`,
    sql: `-- Write your SQL code here
SELECT 'Hello World' AS result;`
}

export function CodeIDE({
    code,
    onCodeChange,
    onOutputSubmit,
    language = 'javascript',
    onLanguageChange,
    isExecuting = false,
    output = '',
    error = '',
    className = ''
}: CodeIDEProps) {
    const [selectedLanguage, setSelectedLanguage] = useState(language)
    const [localCode, setLocalCode] = useState(code)
    const [localOutput, setLocalOutput] = useState(output)
    const [localError, setLocalError] = useState(error)
    const [isRunning, setIsRunning] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)


    // Auto-resize textarea based on content
    const autoResize = () => {
        const textarea = textareaRef.current
        if (textarea) {
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto'
            
            // Calculate the new height based on content
            const newHeight = Math.max(textarea.scrollHeight, 384) // min 24rem
            
            // Set the new height
            textarea.style.height = `${newHeight}px`
            
            // Update the parent container height
            const container = textarea.closest('.relative.flex') as HTMLElement
            if (container) {
                container.style.height = `${newHeight}px`
            }
            
            // Ensure no scrollbars
            textarea.style.overflow = 'hidden'
        }
    }

    // Auto-resize when content changes
    useEffect(() => {
        autoResize()
    }, [localCode])

    // Update local state when props change
    useEffect(() => {
        setLocalCode(code)
    }, [code])

    useEffect(() => {
        setLocalOutput(output)
    }, [output])

    useEffect(() => {
        setLocalError(error)
    }, [error])

    useEffect(() => {
        setSelectedLanguage(language)
    }, [language])

    const handleCodeChange = (newCode: string) => {
        setLocalCode(newCode)
        onCodeChange(newCode)
    }

    const handleLanguageChange = (newLanguage: string) => {
        setSelectedLanguage(newLanguage)
        onLanguageChange?.(newLanguage)
        
        // Clear output and error when changing language
        setLocalOutput('')
        setLocalError('')
        
        // Load template for new language
        const template = LANGUAGE_TEMPLATES[newLanguage] || ''
        setLocalCode(template)
        onCodeChange(template)
    }

    const handleRunCode = async () => {
        if (!localCode.trim()) {
            toast.error('Please write some code before running')
            return
        }

        setIsRunning(true)
        setLocalError('')
        setLocalOutput('')

        try {
            const result = await codeExecutionService.executeCode({
                code: localCode,
                language: selectedLanguage
            })

            if (result.success) {
                setLocalOutput(result.output || '')
                setLocalError('')
                toast.success('Code executed successfully')
            } else {
                setLocalError(result.error || 'Execution failed')
                setLocalOutput('')
                toast.error('Code execution failed')
            }
        } catch (err) {
            const errorMessage = 'Failed to execute code. Please try again.'
            setLocalError(errorMessage)
            setLocalOutput('')
            toast.error(errorMessage)
        } finally {
            setIsRunning(false)
        }
    }

    const handleSubmitOutput = () => {
        if (!localOutput.trim()) {
            toast.error('Please run your code and get output before submitting')
            return
        }
        onOutputSubmit(localOutput)
        toast.success('Output submitted successfully')
    }

    const handleReset = () => {
        const template = LANGUAGE_TEMPLATES[selectedLanguage] || ''
        setLocalCode(template)
        onCodeChange(template)
        setLocalOutput('')
        setLocalError('')
    }

    const handleClearOutput = () => {
        setLocalOutput('')
        setLocalError('')
    }

    const handleDownloadCode = () => {
        const blob = new Blob([localCode], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `solution.${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.extension || 'txt'}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleUploadCode = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.js,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.swift,.kt,.ts,.scala,.r,.sql,.txt'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const content = e.target?.result as string
                    setLocalCode(content)
                    onCodeChange(content)
                }
                reader.readAsText(file)
            }
        }
        input.click()
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header with Language Selection and Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleUploadCode}
                        variant="outline"
                        size="sm"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                    </Button>
                    <Button
                        onClick={handleDownloadCode}
                        variant="outline"
                        size="sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        size="sm"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Code Editor */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label} - Code Editor
                    </span>
                </div>
                <div className="relative flex min-h-96">
                    {/* Line Numbers */}
                    <div className="bg-gray-50 dark:bg-gray-800 px-3 py-4 text-xs text-gray-500 dark:text-gray-400 font-mono select-none border-r border-gray-200 dark:border-gray-600 min-h-96 flex flex-col">
                        {localCode.split('\n').map((_, index) => (
                            <div key={index} className="leading-6 text-right h-6 flex items-center justify-end">
                                {index + 1}
                            </div>
                        ))}
                    </div>
                    
                    {/* Code Editor */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={localCode}
                            onChange={(e) => {
                                handleCodeChange(e.target.value)
                                autoResize()
                            }}
                            placeholder={`Write your ${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label} code here...`}
                            className="w-full min-h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none leading-6 whitespace-pre-wrap [&::-webkit-scrollbar]:hidden"
                            style={{ 
                                height: 'auto',
                                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                lineHeight: '1.5',
                                tabSize: 4,
                                overflow: 'hidden',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>

            {/* Run Button */}
            <div className="flex items-center justify-between">
                <Button
                    onClick={handleRunCode}
                    disabled={isRunning || !localCode.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    {isRunning ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Play className="w-4 h-4 mr-2" />
                    )}
                    {isRunning ? 'Running...' : 'Run Code'}
                </Button>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Press Ctrl+Enter to run code
                </div>
            </div>

            {/* Output Section */}
            {(localOutput || localError) && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Output
                        </h4>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleClearOutput}
                                variant="outline"
                                size="sm"
                            >
                                <Square className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                            {localOutput && !localError && (
                                <Button
                                    onClick={handleSubmitOutput}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    size="sm"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Submit Output
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                {localError ? (
                                    <>
                                        <XCircle className="w-4 h-4 text-red-500" />
                                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                            Error Output
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                            Execution Output
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900">
                            <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed" style={{
                                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                lineHeight: '1.5'
                            }}>
                                {localError || localOutput}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Instructions
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Write your code solution in the editor above</li>
                    <li>• Select the appropriate programming language</li>
                    <li>• Click "Run Code" to execute and see the output</li>
                    <li>• Once you get the correct output, click "Submit Output" to submit your answer</li>
                    <li>• You can upload/download code files for convenience</li>
                </ul>
            </div>
        </div>
    )
}