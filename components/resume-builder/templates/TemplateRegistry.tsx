"use client";

import { ComponentType } from "react";
import { ClassicATSTemplate } from "./ClassicATS";
import { ModernProfessionalTemplate } from "./ModernProfessional";
import { ExecutiveCorporateTemplate } from "./ExecutiveCorporate";
import { MinimalATSTemplate } from "./MinimalATS";
import { CreativePremiumTemplate } from "./CreativePremium";
import { ResumeData } from "./shared/types";

export interface TemplateInfo {
  id: string;
  name: string;
  layout: string;
  font_family: string;
  font_size: string;
  description: string;
  category: string;
  sections: number;
  preview_image?: string;
  accentColor: string;
}

export const TEMPLATE_SLUGS = [
  "classic-ats",
  "modern-professional",
  "executive-corporate",
  "minimal-ats",
  "creative-premium",
] as const;

export type TemplateSlug = (typeof TEMPLATE_SLUGS)[number];

export const TEMPLATES: Record<TemplateSlug, TemplateInfo> = {
  "classic-ats": {
    id: "classic-ats",
    name: "Classic ATS",
    layout: "single-column",
    font_family: "Arial",
    font_size: "11pt",
    description: "Traditional ATS-friendly resume template with clean layout",
    category: "professional",
    sections: 8,
    accentColor: "#1e40af",
  },
  "modern-professional": {
    id: "modern-professional",
    name: "Modern Professional",
    layout: "sidebar",
    font_family: "Segoe UI",
    font_size: "11pt",
    description:
      "Blue-accent sidebar layout with profile photo and skill progress bars",
    category: "professional",
    sections: 9,
    accentColor: "#1e40af",
  },
  "executive-corporate": {
    id: "executive-corporate",
    name: "Executive Corporate",
    layout: "two-column",
    font_family: "Georgia",
    font_size: "11pt",
    description:
      "Elegant executive design with timeline experience and premium spacing",
    category: "executive",
    sections: 9,
    accentColor: "#1a365d",
  },
  "minimal-ats": {
    id: "minimal-ats",
    name: "Minimal ATS",
    layout: "single-column",
    font_family: "Calibri",
    font_size: "11pt",
    description:
      "Black and white ATS-optimized layout focused on maximum readability",
    category: "minimalist",
    sections: 9,
    accentColor: "#000000",
  },
  "creative-premium": {
    id: "creative-premium",
    name: "Creative Premium",
    layout: "modern",
    font_family: "Inter",
    font_size: "11pt",
    description:
      "Stylish header with soft accent colors, icons, and modern dividers",
    category: "creative",
    sections: 9,
    accentColor: "#0d9488",
  },
};

const TEMPLATE_NAME_MAP: Record<string, TemplateSlug> = {
  "classic ats": "classic-ats",
  "modern professional": "modern-professional",
  "executive corporate": "executive-corporate",
  "minimal ats": "minimal-ats",
  "creative premium": "creative-premium",
};

export function getTemplateList(): TemplateInfo[] {
  return TEMPLATE_SLUGS
    .filter((slug) => slug !== "creative-premium")
    .map((slug) => TEMPLATES[slug]);
}

export function isTemplateSlug(id: string): id is TemplateSlug {
  return TEMPLATE_SLUGS.includes(id as TemplateSlug);
}

export function resolveTemplateSlug(
  templateId: string | null | undefined,
  settings?: Record<string, unknown>
): TemplateSlug {
  if (settings?.templateSlug && isTemplateSlug(settings.templateSlug as string)) {
    return settings.templateSlug as TemplateSlug;
  }

  if (templateId && isTemplateSlug(templateId)) {
    return templateId;
  }

  if (templateId) {
    const normalized = templateId.toLowerCase().trim();
    if (TEMPLATE_NAME_MAP[normalized]) {
      return TEMPLATE_NAME_MAP[normalized];
    }
  }

  return "classic-ats";
}

export function getTemplateComponent(
  templateId: string | null | undefined,
  settings?: Record<string, unknown>
): ComponentType<{ resumeData: ResumeData }> {
  const slug = resolveTemplateSlug(templateId, settings);

  switch (slug) {
    case "classic-ats":
      return ClassicATSTemplate;
    case "modern-professional":
      return ModernProfessionalTemplate;
    case "executive-corporate":
      return ExecutiveCorporateTemplate;
    case "minimal-ats":
      return MinimalATSTemplate;
    case "creative-premium":
      return CreativePremiumTemplate;
    default:
      return ClassicATSTemplate;
  }
}

export function getTemplateInfo(
  templateId: string | null | undefined,
  settings?: Record<string, unknown>
): TemplateInfo | null {
  const slug = resolveTemplateSlug(templateId, settings);
  return TEMPLATES[slug] || null;
}
