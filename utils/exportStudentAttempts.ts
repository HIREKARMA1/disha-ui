// utils/exportStudentAttempts.ts
import { StudentAttempt } from '@/types/practice'

export const exportStudentAttemptsToCSV = (
    attempts: StudentAttempt[],
    moduleTitle: string
) => {
    // Prepare CSV headers
    const headers = [
        'Student',
        'Score',
        'Time Taken',
        'Started'
    ]

    // Prepare CSV data
    const csvData = attempts.map(attempt => [
        attempt.student_name || 'Unknown',
        `${attempt.score_percent.toFixed(1)}%`,
        formatTime(attempt.time_taken_seconds),
        formatDate(attempt.started_at)
    ])

    // Convert to CSV string
    const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `Student_Attempts_${moduleTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.csv`
    link.setAttribute('download', filename)
    
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// Helper function to format time
const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
}

// Helper function to format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
