export { ClassicATSTemplate } from "./ClassicATS";
export { ModernProfessionalTemplate } from "./ModernProfessional";
export { ExecutiveCorporateTemplate } from "./ExecutiveCorporate";
export { MinimalATSTemplate } from "./MinimalATS";
export { CreativePremiumTemplate } from "./CreativePremium";
export {
  TEMPLATES,
  TEMPLATE_SLUGS,
  getTemplateList,
  getTemplateComponent,
  getTemplateInfo,
  resolveTemplateSlug,
  isTemplateSlug,
} from "./TemplateRegistry";
export type { TemplateInfo, TemplateSlug } from "./TemplateRegistry";
export type { ResumeData, ResumeTemplateProps } from "./shared/types";
