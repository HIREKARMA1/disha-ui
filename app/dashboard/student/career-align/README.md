# Career Align - Student Dashboard

## Overview

The Career Align section provides students with AI-powered resume analysis and personalized job recommendations. Students can upload their resumes in PDF format and receive comprehensive career insights including job matches, skill gaps, and improvement suggestions.

## Features

### 🎯 Resume Analysis

- **PDF Upload**: Support for PDF resume files (max 10MB)
- **AI-Powered Analysis**: Uses NLP and machine learning to extract skills and analyze content
- **ATS Optimization**: Checks resume format for Applicant Tracking System compatibility
- **Keyword Extraction**: Identifies relevant skills and keywords from resume content

### 📊 Analysis Results

- **Overall Match Score**: Percentage indicating how well the resume matches available jobs
- **Resume Score**: Quality assessment of the resume with improvement suggestions
- **Skills Found**: Number of skills identified from the resume
- **Job Recommendations**: Personalized job suggestions based on skills and experience

### 🔍 Skill Gap Analysis

- **Missing Skills**: Identifies skills needed for target job roles
- **Priority Levels**: Categorizes skill gaps as Critical, High, or Medium priority
- **Learning Recommendations**: Suggests skills to develop for career advancement

### 💼 Job Recommendations

- **Match Scores**: Each recommended job shows a percentage match score
- **Consistent Design**: Uses the same job card design as the main jobs page
- **Apply Functionality**: Students can directly apply to recommended jobs
- **Job Details**: Full job descriptions and requirements available

## Technical Implementation

### Backend Integration

- **API Endpoint**: `/api/v1/careeralign/analyze`
- **File Upload**: Multipart form data with PDF file
- **Authentication**: Requires valid user token
- **Response Format**: JSON with analysis results

### Frontend Components

- **File Upload**: Drag-and-drop interface with file validation
- **Analysis Display**: Real-time progress indicators and results
- **Job Cards**: Reuses existing JobCard component with match score badges
- **Modals**: Job description and application modals

### Data Flow

1. User uploads PDF resume
2. Frontend validates file type and size
3. File sent to backend for analysis
4. Backend extracts text and analyzes skills
5. Backend matches skills against job database
6. Results returned to frontend
7. Frontend displays analysis and job recommendations

## UI/UX Design

### Consistent Design Language

- **Color Scheme**: Matches existing student dashboard theme
- **Typography**: Same font family and sizing as other sections
- **Components**: Reuses existing UI components (buttons, cards, modals)
- **Layout**: Responsive grid layout with proper spacing

### Visual Elements

- **Icons**: Lucide React icons for consistent visual language
- **Animations**: Framer Motion for smooth transitions
- **Color Coding**: Score-based color coding for easy interpretation
- **Badges**: Match score badges on job cards

### Responsive Design

- **Mobile**: Optimized for mobile devices
- **Tablet**: Responsive grid layouts
- **Desktop**: Full-featured desktop experience

## Error Handling

### File Validation

- **File Type**: Only PDF files accepted
- **File Size**: Maximum 10MB limit
- **User Feedback**: Clear error messages for invalid files

### API Error Handling

- **Network Errors**: Graceful handling of connection issues
- **Server Errors**: User-friendly error messages
- **Loading States**: Progress indicators during analysis

## Future Enhancements

### Planned Features

- **Skill Input**: Manual skill entry as alternative to resume upload
- **Video Recommendations**: Educational videos for skill development
- **Career Path Suggestions**: Long-term career planning guidance
- **Analysis History**: Track previous analyses and improvements

### Technical Improvements

- **Caching**: Cache analysis results for better performance
- **Batch Processing**: Support for multiple resume analysis
- **Export Options**: PDF reports of analysis results
- **Integration**: Connect with learning platforms for skill development

## Usage Instructions

1. **Navigate to Career Align**: Click on "Career Align" in the student sidebar
2. **Upload Resume**: Click "Choose File" and select a PDF resume
3. **Analyze**: Click "Analyze Resume" to start the analysis
4. **Review Results**: View match scores, skill gaps, and job recommendations
5. **Apply to Jobs**: Click on recommended jobs to view details and apply

## Dependencies

### Frontend

- React with TypeScript
- Framer Motion for animations
- Lucide React for icons
- React Hook Form for form handling
- React Hot Toast for notifications

### Backend

- FastAPI with Python
- PyMuPDF for PDF text extraction
- spaCy for NLP processing
- SQLAlchemy for database operations

## API Documentation

### Request Format

```javascript
POST /api/v1/careeralign/analyze
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- resume: PDF file
```

### Response Format

```javascript
{
  "job_match_score": 85.5,
  "top_recommended_jobs": [
    {
      "id": "job-123",
      "title": "Software Engineer",
      "location": "Remote",
      "job_type": "full_time",
      "required_skills": ["Python", "React", "SQL"],
      "match_score": 92.3
    }
  ],
  "resume_score": {
    "needs_ats_formatting": false,
    "keywords": ["Python", "React", "Node.js"],
    "overall_score": 78.5,
    "suggestions": ["Add more quantifiable achievements"]
  },
  "skill_gap": {
    "skills": ["Docker", "Kubernetes"],
    "message": "Consider learning containerization technologies",
    "priority": "High"
  },
  "analysis_date": "2024-01-15T10:30:00Z",
  "user_id": "user-123"
}
```

