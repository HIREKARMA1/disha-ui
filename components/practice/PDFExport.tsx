"use client"

import { SubmitAttemptResponse, PracticeModule } from '@/types/practice'
import { exportAttemptReport } from '@/utils/exportReport'

export class PDFExport {
    static async exportReport(result: SubmitAttemptResponse, module: PracticeModule) {
        try {
            // Use the improved jsPDF export function
            const reportData = {
                moduleTitle: module.title,
                studentName: 'Current Student', // TODO: Get from auth context
                score_percent: result.score_percent,
                time_taken_seconds: result.time_taken_seconds,
                weak_areas: result.weak_areas,
                question_results: result.question_results
            }
            
            const filename = `practice-report-${module.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
            exportAttemptReport(reportData, filename)
        } catch (error) {
            console.error('PDF export failed, falling back to print method:', error)
            
            // Fallback to the original print method
            const printWindow = window.open('', '_blank')
            if (!printWindow) {
                throw new Error('Unable to open print window')
            }

            const formatTime = (seconds: number) => {
                const hours = Math.floor(seconds / 3600)
                const minutes = Math.floor((seconds % 3600) / 60)
                const secs = seconds % 60

                if (hours > 0) {
                    return `${hours}h ${minutes}m ${secs}s`
                }
                return `${minutes}m ${secs}s`
            }

            const getScoreColor = (score: number) => {
                if (score >= 80) return '#10b981'
                if (score >= 60) return '#f59e0b'
                return '#ef4444'
            }

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Practice Test Report - ${module.title}</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 2px solid #e5e7eb;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                        }
                        .score-overview {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 20px;
                            margin-bottom: 30px;
                        }
                        .score-card {
                            background: #f9fafb;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                        }
                        .score-value {
                            font-size: 2rem;
                            font-weight: bold;
                            margin: 10px 0;
                        }
                        .weak-areas {
                            margin-bottom: 30px;
                        }
                        .weak-area-item {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 10px;
                            background: #f9fafb;
                            border-radius: 6px;
                            margin-bottom: 10px;
                        }
                        .progress-bar {
                            width: 100px;
                            height: 8px;
                            background: #e5e7eb;
                            border-radius: 4px;
                            overflow: hidden;
                        }
                        .progress-fill {
                            height: 100%;
                            border-radius: 4px;
                        }
                        .question-review {
                            margin-top: 30px;
                        }
                        .question-item {
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            padding: 15px;
                            margin-bottom: 15px;
                        }
                        .question-header {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            margin-bottom: 10px;
                        }
                        .status-badge {
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 0.875rem;
                            font-weight: 500;
                        }
                        .correct {
                            background: #dcfce7;
                            color: #166534;
                        }
                        .incorrect {
                            background: #fef2f2;
                            color: #991b1b;
                        }
                        .explanation {
                            background: #f9fafb;
                            padding: 10px;
                            border-radius: 6px;
                            margin-top: 10px;
                        }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Practice Test Report</h1>
                        <h2>${module.title}</h2>
                        <p>Generated on ${new Date().toLocaleDateString()}</p>
                    </div>

                    <div class="score-overview">
                        <div class="score-card">
                            <h3>Overall Score</h3>
                            <div class="score-value" style="color: ${getScoreColor(result.score_percent)}">
                                ${result.score_percent.toFixed(1)}%
                            </div>
                        </div>
                        <div class="score-card">
                            <h3>Time Taken</h3>
                            <div class="score-value">${formatTime(result.time_taken_seconds)}</div>
                        </div>
                        <div class="score-card">
                            <h3>Role Fit Score</h3>
                            <div class="score-value">${result.role_fit_score.toFixed(1)}%</div>
                        </div>
                        <div class="score-card">
                            <h3>Correct Answers</h3>
                            <div class="score-value">
                                ${result.question_results.filter(r => r.is_correct).length}/${result.question_results.length}
                            </div>
                        </div>
                    </div>

                    ${result.weak_areas && result.weak_areas.length > 0 ? `
                    <div class="weak-areas">
                        <h3>Areas for Improvement</h3>
                        ${result.weak_areas.map(area => `
                            <div class="weak-area-item">
                                <span>${area.tag}</span>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span>${area.accuracy.toFixed(1)}%</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${area.accuracy}%; background: ${getScoreColor(area.accuracy)}"></div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}

                    <div class="question-review">
                        <h3>Question Review</h3>
                        ${result.question_results.map((questionResult, index) => `
                            <div class="question-item">
                                <div class="question-header">
                                    <span>Question ${index + 1}</span>
                                    <span class="status-badge ${questionResult.is_correct ? 'correct' : 'incorrect'}">
                                        ${questionResult.is_correct ? 'Correct' : 'Incorrect'}
                                    </span>
                                </div>
                                ${questionResult.explanation ? `
                                    <div class="explanation">
                                        <strong>Explanation:</strong><br>
                                        ${questionResult.explanation}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>

                    <div class="no-print" style="text-align: center; margin-top: 30px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            Print Report
                        </button>
                    </div>
                </body>
                </html>
            `

            printWindow.document.write(html)
            printWindow.document.close()
            
            // Auto-print after a short delay
            setTimeout(() => {
                printWindow.print()
            }, 500)
        }
    }
}
