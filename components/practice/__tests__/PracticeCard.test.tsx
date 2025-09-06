import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PracticeCard } from '../PracticeCard'
import { PracticeModule } from '@/types/practice'

const mockModule: PracticeModule = {
    id: 'mod-dev-1',
    title: 'Full-length Mock - Developer',
    role: 'Developer',
    duration_seconds: 3600,
    questions_count: 3,
    question_ids: ['q1', 'q2', 'q3'],
    is_archived: false,
    description: 'Comprehensive developer assessment',
    difficulty: 'medium',
    tags: ['programming', 'algorithms']
}

describe('PracticeCard', () => {
    const mockOnStart = jest.fn()

    beforeEach(() => {
        mockOnStart.mockClear()
    })

    it('renders module information correctly', () => {
        render(<PracticeCard module={mockModule} onStart={mockOnStart} />)
        
        expect(screen.getByText('Full-length Mock - Developer')).toBeInTheDocument()
        expect(screen.getByText('Developer')).toBeInTheDocument()
        expect(screen.getByText('3 questions')).toBeInTheDocument()
        expect(screen.getByText('1h 0m')).toBeInTheDocument()
        expect(screen.getByText('Comprehensive developer assessment')).toBeInTheDocument()
    })

    it('displays difficulty and role tags', () => {
        render(<PracticeCard module={mockModule} onStart={mockOnStart} />)
        
        expect(screen.getByText('medium')).toBeInTheDocument()
        expect(screen.getByText('Developer')).toBeInTheDocument()
    })

    it('displays tags when provided', () => {
        render(<PracticeCard module={mockModule} onStart={mockOnStart} />)
        
        expect(screen.getByText('programming')).toBeInTheDocument()
        expect(screen.getByText('algorithms')).toBeInTheDocument()
    })

    it('calls onStart when Start Practice button is clicked', () => {
        render(<PracticeCard module={mockModule} onStart={mockOnStart} />)
        
        const startButton = screen.getByText('Start Practice')
        fireEvent.click(startButton)
        
        expect(mockOnStart).toHaveBeenCalledTimes(1)
    })

    it('formats duration correctly for hours and minutes', () => {
        const moduleWithHours: PracticeModule = {
            ...mockModule,
            duration_seconds: 5400 // 1.5 hours
        }
        
        render(<PracticeCard module={moduleWithHours} onStart={mockOnStart} />)
        
        expect(screen.getByText('1h 30m')).toBeInTheDocument()
    })

    it('formats duration correctly for minutes only', () => {
        const moduleMinutesOnly: PracticeModule = {
            ...mockModule,
            duration_seconds: 1800 // 30 minutes
        }
        
        render(<PracticeCard module={moduleMinutesOnly} onStart={mockOnStart} />)
        
        expect(screen.getByText('30m')).toBeInTheDocument()
    })

    it('handles missing description gracefully', () => {
        const moduleWithoutDescription: PracticeModule = {
            ...mockModule,
            description: undefined
        }
        
        render(<PracticeCard module={moduleWithoutDescription} onStart={mockOnStart} />)
        
        expect(screen.getByText('Full-length Mock - Developer')).toBeInTheDocument()
        expect(screen.getByText('Start Practice')).toBeInTheDocument()
    })

    it('handles missing tags gracefully', () => {
        const moduleWithoutTags: PracticeModule = {
            ...mockModule,
            tags: undefined
        }
        
        render(<PracticeCard module={moduleWithoutTags} onStart={mockOnStart} />)
        
        expect(screen.getByText('Full-length Mock - Developer')).toBeInTheDocument()
        expect(screen.getByText('Start Practice')).toBeInTheDocument()
    })
})
