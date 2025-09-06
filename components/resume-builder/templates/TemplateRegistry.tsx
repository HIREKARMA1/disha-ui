"use client";

import { ClassicATSTemplate } from "./index";

export interface TemplateInfo {
  id: string;
  name: string;
  layout: string;
  font_family: string;
  font_size: string;
  description: string;
  category: string;
  sections: number;
  preview_image: string;
}

export const TEMPLATES: Record<string, TemplateInfo> = {
  "classic-ats": {
    id: "classic-ats",
    name: "Classic ATS",
    layout: "single-column",
    font_family: "Arial",
    font_size: "11pt",
    description: "Traditional ATS-friendly resume template with clean layout",
    category: "professional",
    sections: 5,
    preview_image:
      "https://your-resume-templates.s3.us-east-1.amazonaws.com/modern-profile.png",
  },
  // Future templates will be added here
  // 'professional-resume': {
  //     id: 'professional-resume',
  //     name: 'Professional Resume',
  //     layout: 'two-column',
  //     font_family: 'Calibri',
  //     font_size: '11pt',
  //     description: 'Modern professional template with balanced sections',
  //     category: 'professional',
  //     sections: 6,
  //     preview_image: 'https://your-resume-templates.s3.us-east-1.amazonaws.com/professional-resume.png'
  // },
  // 'modern-profile': {
  //     id: 'modern-profile',
  //     name: 'Modern Profile',
  //     layout: 'modern',
  //     font_family: 'Segoe UI',
  //     font_size: '11pt',
  //     description: 'Contemporary design with visual appeal',
  //     category: 'creative',
  //     sections: 6,
  //     preview_image: 'https://your-resume-templates.s3.us-east-1.amazonaws.com/modern-profile.png'
  // }
};

export const getTemplateComponent = (templateId: string) => {
  switch (templateId) {
    case "classic-ats":
      return ClassicATSTemplate;
    // Future cases will be added here
    // case 'professional-resume':
    //     return ProfessionalResumeTemplate
    // case 'modern-profile':
    //     return ModernProfileTemplate
    default:
      return ClassicATSTemplate; // fallback to Classic ATS
  }
};

export const getTemplateInfo = (templateId: string): TemplateInfo | null => {
  return TEMPLATES[templateId] || null;
};
