# Practice Module Documentation

## Overview

The Practice Module is a comprehensive assessment system that allows students to take practice tests and mock exams, while providing administrators with tools to manage questions and view student performance. The module is fully integrated into the existing student dashboard and includes both student-facing and admin-facing components.

## Features

### Student Features

- **Practice Dashboard**: Browse available practice tests and assessments
- **Exam Interface**: Full-featured exam UI with question navigation, timer, and autosave
- **Result Reports**: Detailed analytics with score breakdown, weak areas, and explanations
- **PDF Export**: Download exam results as PDF reports
- **Offline Support**: Autosave progress and resume exams after page reload

### Admin Features

- **Question Management**: Create, edit, and delete individual questions
- **Bulk Upload**: Upload multiple questions via CSV/Excel files
- **Student Attempts**: View detailed student performance and attempt logs
- **Module Management**: Create and manage practice test modules

## Architecture

### Component Structure

```
components/
├── practice/
│   ├── PracticeDashboard.tsx          # Main dashboard with module grid
│   ├── PracticeCard.tsx               # Individual module cards
│   ├── PracticeExam.tsx               # Main exam interface
│   ├── QuestionTabsBar.tsx            # Question navigation tabs
│   ├── QuestionPanel.tsx              # Question display panel
│   ├── OptionsPanel.tsx               # Answer options panel
│   ├── ExamTimer.tsx                  # Countdown timer
│   ├── ResultReport.tsx               # Results and analytics
│   ├── PDFExport.tsx                  # PDF generation utility
│   └── __tests__/
│       └── PracticeCard.test.tsx      # Unit tests
├── admin/
│   ├── AdminPracticeManager.tsx       # Admin dashboard
│   ├── AdminQuestionEditor.tsx        # Question CRUD interface
│   ├── AdminBulkUploader.tsx          # Bulk upload interface
│   └── AdminAttemptViewer.tsx         # Student attempts viewer
```

### Data Types

```typescript
// Core types defined in types/practice.ts
interface Question {
  id: string
  statement: string // HTML allowed
  type: 'mcq_single' | 'mcq_multi' | 'descriptive' | 'coding'
  options?: Array<{ id: string; text: string }>
  correct_options?: string[]
  explanation?: string
  tags: string[]
  role: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit_seconds?: number
}

interface PracticeModule {
  id: string
  title: string
  role: string
  duration_seconds: number
  questions_count: number
  question_ids: string[]
  is_archived: boolean
  description?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
}
```

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- Next.js 14+
- TypeScript
- Tailwind CSS

### Dependencies

The Practice Module uses the following key dependencies:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "14.0.4",
    "typescript": "^5.3.3",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.303.0",
    "react-hot-toast": "^2.4.1",
    "html2pdf.js": "^0.11.2"
  }
}
```

### Setup Steps

1. **Add Practice Route to Sidebar**
   ```typescript
   // In components/dashboard/StudentSidebar.tsx
   {
     label: 'Practice',
     href: '/dashboard/student/practice',
     icon: Brain,
     description: 'Practice tests and assessments',
     color: 'from-rose-500 to-pink-600'
   }
   ```

2. **Create Practice Page**
   ```typescript
   // app/dashboard/student/practice/page.tsx
   "use client"
   import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
   import { PracticeDashboard } from '@/components/practice/PracticeDashboard'

   export default function PracticePage() {
     return (
       <StudentDashboardLayout>
         <PracticeDashboard />
       </StudentDashboardLayout>
     )
   }
   ```

3. **Add Admin Practice Route**
   ```typescript
   // app/dashboard/admin/practice/page.tsx
   "use client"
   import { AdminPracticeManager } from '@/components/admin/AdminPracticeManager'

   export default function AdminPracticePage() {
     return (
       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
         <div className="container mx-auto px-4 py-8 pt-24">
           <AdminPracticeManager />
         </div>
       </div>
     )
   }
   ```

## Usage

### Student Workflow

1. **Access Practice Module**
   - Navigate to Dashboard → Practice
   - View available practice tests in grid layout

2. **Start Practice Test**
   - Click "Start Practice" on any module card
   - Exam interface opens with question navigation

3. **Take Exam**
   - Use question tabs to navigate between questions
   - Answer questions using provided options or text input
   - Flag questions for review using "Mark for Review" button
   - Use keyboard shortcuts: N (Next), P (Previous), 1-9 (Jump to question)

4. **Submit and Review**
   - Click "Submit Exam" when finished
   - View detailed results with score breakdown
   - Download PDF report
   - Review individual question explanations

### Admin Workflow

1. **Access Admin Panel**
   - Navigate to Admin Dashboard → Practice Management
   - View overview statistics and module list

2. **Manage Questions**
   - Create individual questions using the question editor
   - Upload multiple questions via CSV/Excel bulk upload
   - Edit existing questions and manage question properties

3. **View Student Attempts**
   - Click "View Attempts" on any module
   - Review individual student performance
   - Analyze question-level results and time spent

## API Integration

### Current Implementation

The module currently uses mock data for development. The API integration points are clearly marked with TODO comments:

```typescript
// In hooks/usePractice.ts
// TODO: Replace with real API calls when backend is available
/*
export function usePracticeModules() {
    return useQuery({
        queryKey: ['practice-modules'],
        queryFn: () => apiClient.get('/api/practice/modules'),
        staleTime: 5 * 60 * 1000,
    })
}
*/
```

### Required Backend Endpoints

```typescript
// Student endpoints
GET /api/practice/modules                    // List available modules
GET /api/practice/modules/{id}/questions     // Get module questions
POST /api/practice/submit                    // Submit exam attempt
GET /api/practice/stats                      // Get student statistics

// Admin endpoints
GET /api/admin/practice/modules              // List all modules
POST /api/admin/practice/modules             // Create module
PUT /api/admin/practice/modules/{id}         // Update module
DELETE /api/admin/practice/modules/{id}      // Delete module
GET /api/admin/practice/questions            // List questions
POST /api/admin/practice/questions           // Create question
PUT /api/admin/practice/questions/{id}       // Update question
DELETE /api/admin/practice/questions/{id}    // Delete question
POST /api/admin/practice/questions/bulk      // Bulk upload questions
GET /api/admin/practice/attempts             // List student attempts
GET /api/admin/practice/attempts/{id}        // Get attempt details
```

### API Request/Response Formats

```typescript
// Submit attempt request
interface SubmitAttemptRequest {
  module_id: string
  student_id: string
  attempt_id: string
  answers: QuestionAnswer[]
  started_at: string
  ended_at: string
}

// Submit attempt response
interface SubmitAttemptResponse {
  attempt_id: string
  module_id: string
  score_percent: number
  time_taken_seconds: number
  weak_areas: WeakArea[]
  role_fit_score: number
  question_results: QuestionResult[]
}
```

## Testing

### Unit Tests

Run unit tests for individual components:

```bash
# Run all tests
npm test

# Run specific test file
npm test PracticeCard.test.tsx

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

Current test coverage includes:
- PracticeCard component rendering and interactions
- Form validation and error handling
- Mock data integration

### Adding New Tests

```typescript
// Example test structure
import { render, screen, fireEvent } from '@testing-library/react'
import { PracticeCard } from '../PracticeCard'

describe('PracticeCard', () => {
  it('renders module information correctly', () => {
    render(<PracticeCard module={mockModule} onStart={mockOnStart} />)
    expect(screen.getByText('Module Title')).toBeInTheDocument()
  })
})
```

## Storybook

### Viewing Stories

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

### Available Stories

- **PracticeCard**: Various module configurations and states
- **PracticeDashboard**: Loading, error, and empty states
- **AdminQuestionEditor**: Form validation and question types

### Adding New Stories

```typescript
// Example story structure
export default {
  title: 'Practice/PracticeCard',
  component: PracticeCard,
  parameters: {
    layout: 'centered',
  },
} as Meta

export const Default: Story = {
  args: {
    module: mockModule,
    onStart: () => console.log('Practice started'),
  },
}
```

## Styling & Theming

### Design System Integration

The Practice Module fully integrates with the existing design system:

- **Colors**: Uses existing Tailwind color tokens (primary, secondary, accent colors)
- **Typography**: Consistent with existing font families and sizing
- **Components**: Reuses existing Button, Card, and form components
- **Spacing**: Follows established spacing patterns
- **Dark Mode**: Full dark mode support

### Custom Styling

```css
/* Example custom styles */
.practice-card {
  @apply bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300;
}

.exam-timer {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300;
}
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Components load as needed
2. **Memoization**: React.memo for expensive components
3. **Local Storage**: Efficient exam session persistence
4. **Debounced Autosave**: Prevents excessive API calls

### Bundle Size

- Core components: ~50KB gzipped
- Admin components: ~30KB gzipped
- Total module size: ~80KB gzipped

## Accessibility

### WCAG Compliance

- **Keyboard Navigation**: Full keyboard support for exam interface
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meets WCAG AA standards
- **Focus Management**: Clear focus indicators and logical tab order

### Accessibility Features

```typescript
// Example accessibility implementation
<button
  aria-label={`Start ${module.title} practice test`}
  aria-describedby={`module-${module.id}-description`}
  onClick={onStart}
>
  Start Practice
</button>
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES2020, CSS Grid, Flexbox, Local Storage

## Troubleshooting

### Common Issues

1. **Exam Progress Not Saving**
   - Check browser localStorage permissions
   - Verify exam session hook is properly initialized

2. **PDF Export Not Working**
   - Ensure html2pdf.js is properly loaded
   - Check browser popup blockers

3. **Questions Not Loading**
   - Verify API endpoints are accessible
   - Check network connectivity and CORS settings

### Debug Mode

Enable debug logging:

```typescript
// In development
localStorage.setItem('debug', 'practice:*')
```

## Migration Guide

### From Mock to Real API

1. **Update API Client**
   ```typescript
   // Replace mock functions in hooks/usePractice.ts
   const modules = await apiClient.get('/api/practice/modules')
   ```

2. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

3. **Remove Mock Data**
   - Delete mock data objects
   - Update error handling for real API responses

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make changes following the existing code style
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Use Tailwind CSS for styling
- Write tests for new components
- Update Storybook stories

## License

This module is part of the HireKarma platform and follows the same licensing terms.

## Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Maintainer**: Development Team
