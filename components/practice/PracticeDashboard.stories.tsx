import type { Meta, StoryObj } from '@storybook/react'
import { PracticeDashboard } from './PracticeDashboard'

// Mock the hooks
jest.mock('@/hooks/usePractice', () => ({
    usePracticeModules: () => ({
        data: [
            {
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
            },
            {
                id: 'mod-apt-1',
                title: 'Aptitude Quick Test',
                role: 'General',
                duration_seconds: 1800,
                questions_count: 2,
                question_ids: ['q4', 'q5'],
                is_archived: false,
                description: 'Quick aptitude test',
                difficulty: 'easy',
                tags: ['aptitude', 'logical-reasoning']
            }
        ],
        isLoading: false,
        error: null
    })
}))

const meta: Meta<typeof PracticeDashboard> = {
    title: 'Practice/PracticeDashboard',
    component: PracticeDashboard,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
    parameters: {
        mockData: {
            usePracticeModules: () => ({
                data: [],
                isLoading: true,
                error: null
            })
        }
    }
}

export const Error: Story = {
    parameters: {
        mockData: {
            usePracticeModules: () => ({
                data: [],
                isLoading: false,
                error: new Error('Failed to load practice modules')
            })
        }
    }
}

export const Empty: Story = {
    parameters: {
        mockData: {
            usePracticeModules: () => ({
                data: [],
                isLoading: false,
                error: null
            })
        }
    }
}
