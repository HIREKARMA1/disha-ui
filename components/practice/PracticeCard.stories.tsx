import type { Meta, StoryObj } from '@storybook/react'
import { PracticeCard } from './PracticeCard'
import { PracticeModule } from '@/types/practice'

const meta: Meta<typeof PracticeCard> = {
    title: 'Practice/PracticeCard',
    component: PracticeCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        onStart: { action: 'started' },
    },
}

export default meta
type Story = StoryObj<typeof meta>

const baseModule: PracticeModule = {
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
}

export const Default: Story = {
    args: {
        module: baseModule,
        onStart: () => console.log('Practice started'),
    },
}

export const EasyDifficulty: Story = {
    args: {
        module: {
            ...baseModule,
            title: 'Aptitude Quick Test',
            role: 'General',
            difficulty: 'easy',
            duration_seconds: 1800,
            questions_count: 2,
            description: 'Quick aptitude test covering logical reasoning and quantitative analysis.',
            tags: ['aptitude', 'logical-reasoning']
        },
        onStart: () => console.log('Practice started'),
    },
}

export const HardDifficulty: Story = {
    args: {
        module: {
            ...baseModule,
            title: '100-Day Coding Sprint',
            difficulty: 'hard',
            duration_seconds: 5400,
            questions_count: 1,
            description: 'Intensive coding challenge with complex algorithmic problems and system design questions.',
            tags: ['coding', 'algorithms', 'data-structures', 'system-design']
        },
        onStart: () => console.log('Practice started'),
    },
}

export const LongTitle: Story = {
    args: {
        module: {
            ...baseModule,
            title: 'Advanced Machine Learning and Artificial Intelligence Comprehensive Assessment for Senior Data Scientists',
            description: 'This is a very long description that should be truncated properly in the card layout to maintain good visual hierarchy and readability.',
            tags: ['machine-learning', 'artificial-intelligence', 'data-science', 'python', 'tensorflow', 'pytorch']
        },
        onStart: () => console.log('Practice started'),
    },
}

export const MinimalInfo: Story = {
    args: {
        module: {
            id: 'mod-minimal',
            title: 'Basic Test',
            role: 'General',
            duration_seconds: 1200,
            questions_count: 1,
            question_ids: ['q1'],
            is_archived: false,
        },
        onStart: () => console.log('Practice started'),
    },
}

export const ManyTags: Story = {
    args: {
        module: {
            ...baseModule,
            title: 'Full-Stack Development Assessment',
            role: 'Full-Stack Developer',
            tags: ['react', 'nodejs', 'typescript', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'aws', 'ci-cd']
        },
        onStart: () => console.log('Practice started'),
    },
}
