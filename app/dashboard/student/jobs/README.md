# Job Opportunities Page

This page allows students to browse, search, filter, and apply for job opportunities posted by corporate users.

## Features

### 🎯 **Job Discovery**

- Browse all available job postings in a responsive card layout
- View job details including title, company, location, salary, and requirements
- See application deadlines and current application counts

### 🔍 **Search & Filtering**

- **Search Bar**: Search jobs by title, skills, or company name
- **Advanced Filters**:
  - Location (city, state)
  - Industry (Technology, Finance, Healthcare, etc.)
  - Job Type (Full Time, Part Time, Contract, Internship, Freelance)
  - Remote Work availability
  - Experience level (min/max years)
  - Salary range (min/max INR)
  - Date posted

### 📱 **Responsive Design**

- Mobile-first approach with responsive grid layout
- Optimized for all device sizes (mobile, tablet, desktop)
- Touch-friendly interface with proper spacing

### 🎨 **UI Components**

- **Job Cards**: Clean, informative cards with hover effects
- **Modal**: Detailed job description view with all information
- **Pagination**: Efficient navigation through large job lists
- **Loading States**: Skeleton loaders and loading indicators
- **Status Indicators**: Visual feedback for application status

### ⚡ **Interactive Features**

- **Apply Button**: One-click job application with loading states
- **View JD Button**: Opens detailed job description modal
- **Real-time Updates**: Application status updates immediately
- **Toast Notifications**: Success/error feedback for user actions

## Technical Implementation

### **Components**

- `JobOpportunitiesPage`: Main page component with search, filters, and job grid
- `JobCard`: Individual job display card with apply/view actions
- `JobDescriptionModal`: Detailed job information modal

### **API Integration**

- Fetches jobs from `/api/v1/jobs/` endpoint
- Supports search parameters and pagination
- Submits applications via `/api/v1/applications/apply/{job_id}`

### **State Management**

- Local state for search terms, filters, and pagination
- Loading states for API calls
- Application status tracking

### **Responsive Breakpoints**

- **Mobile**: Single column layout, bottom navigation
- **Tablet**: Two column grid, expanded filters
- **Desktop**: Three column grid, full filter panel

## Usage

### **For Students**

1. Navigate to `/dashboard/student/jobs`
2. Use search bar to find specific jobs
3. Apply filters to narrow down opportunities
4. Click "View JD" to see full job details
5. Click "Apply Now" to submit application
6. Monitor application status and deadlines

### **For Developers**

1. The page automatically fetches jobs on load
2. All API calls include proper error handling
3. Components are fully typed with TypeScript
4. Follows the project's design system and color scheme
5. Uses Framer Motion for smooth animations

## Design System Compliance

- **Colors**: Uses project's primary/secondary color palette
- **Typography**: Consistent with dashboard standards
- **Spacing**: Follows established spacing scale
- **Shadows**: Consistent elevation system
- **Dark Mode**: Full dark mode support
- **Accessibility**: Proper contrast ratios and focus states

## Future Enhancements

- [ ] Save favorite jobs
- [ ] Job recommendations based on profile
- [ ] Application tracking dashboard
- [ ] Email notifications for new jobs
- [ ] Advanced analytics and insights
- [ ] Bulk application features

