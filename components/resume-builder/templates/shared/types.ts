export interface ResumeData {
  header: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    profilePhoto?: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa: string;
    achievements: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link: string;
    github: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link: string;
  }>;
}

export interface ResumeTemplateProps {
  resumeData: ResumeData;
}
