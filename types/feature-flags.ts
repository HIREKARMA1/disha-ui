// Feature Flag Types for Admin Panel
// Based on backend schemas from app/schemas/feature_flags.py

export interface FeatureFlag {
  id: string;
  feature_name: string;
  feature_category: 'career' | 'analytics' | 'practice' | 'video_search' | 'library' | 'resume' | 'sadhana' | 'sangha';
  feature_key: string;
  display_name: string;
  description: string;
  icon: string;
  order: number;
  is_global: boolean;
  is_active: boolean;
  requires_auth: boolean;
  settings: Record<string, any>;
  maintenance_message?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  tenant_id: string;
  // Computed property for frontend compatibility
  default_enabled?: boolean;
}

export interface UniversityFeatureFlag {
  id: string;
  university_id: string;
  feature_flag_id: string;
  is_enabled: boolean;
  enabled_at?: string;
  disabled_at?: string;
  enabled_by: string;
  disabled_by?: string;
  reason?: string;
  custom_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
  feature_flag?: FeatureFlag;
}

export interface FeatureFlagCreate {
  feature_name: string;
  feature_category: 'career' | 'analytics' | 'practice' | 'video_search' | 'library' | 'resume' | 'sadhana' | 'sangha';
  feature_key: string;
  display_name: string;
  description: string;
  icon: string;
  order: number;
  is_global: boolean;
  is_active: boolean;
  requires_auth: boolean;
  settings: Record<string, any>;
  maintenance_message?: string;
}

export interface FeatureFlagUpdate {
  feature_name?: string;
  description?: string;
  feature_category?: 'career' | 'analytics' | 'practice' | 'video_search' | 'library' | 'resume' | 'sadhana' | 'sangha';
  is_active?: boolean;
  is_global?: boolean;
  default_enabled?: boolean;
  user_types?: string[];
  required_roles?: string[];
}

export interface UniversityFeatureUpdate {
  university_id: string;
  feature_flag_id: string;
  feature_key: string; // Added to support backend API
  is_enabled: boolean;
  reason?: string;
  custom_config?: Record<string, any>;
}

export interface BulkUniversityFeatureUpdate {
  university_id: string;
  feature_updates: Array<{
    feature_flag_id: string;
    feature_key: string; // Added to support backend API
    is_enabled: boolean;
    reason?: string;
    custom_config?: Record<string, any>;
  }>;
  reason?: string;
}

export interface FeatureAccessRequest {
  feature_key: string;
  university_id?: string;
  user_type?: string;
  user_roles?: string[];
}

export interface FeatureAccessResponse {
  feature_key: string;
  is_available: boolean;
  reason?: string;
  message?: string;
  maintenance_message?: string;
  custom_message?: string;
  maintenance_mode?: boolean;
  university_id?: string;
  user_type?: string;
  user_roles?: string[];
}

export interface FeatureFlagHealthResponse {
  status: string;
  total_features: number;
  active_features: number;
  global_features: number;
  university_features: number;
  last_updated?: string;
  errors: string[];
}

export interface FeatureUsageStatsResponse {
  feature_key: string;
  feature_name: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  university_usage: Array<{
    university_id: string;
    university_name: string;
    request_count: number;
    success_rate: number;
  }>;
  last_accessed?: string;
}

export interface UniversityFeatureSummaryResponse {
  university_id: string;
  university_name: string;
  total_features: number;
  enabled_features: number;
  disabled_features: number;
  features: Array<{
    feature_key: string;
    feature_name: string;
    is_enabled: boolean;
    enabled_at?: string;
    disabled_at?: string;
  }>;
  last_updated: string;
}

export interface BulkUpdateResponse {
  success_count: number;
  error_count: number;
  errors: string[];
  message: string;
}

// UI-specific types
export interface FeatureFlagCardProps {
  feature: FeatureFlag;
  universityFlags?: UniversityFeatureFlag[];
  onToggle?: (featureId: string, enabled: boolean) => void;
  onEdit?: (feature: FeatureFlag) => void;
  onDelete?: (featureId: string) => void;
  loading?: boolean;
}

export interface UniversityFeatureManagerProps {
  universityId: string;
  universityName: string;
  features: FeatureFlag[];
  universityFlags: UniversityFeatureFlag[];
  onUpdate?: (updates: UniversityFeatureUpdate[]) => void;
  loading?: boolean;
}

export interface FeatureFlagDashboardProps {
  features: FeatureFlag[];
  universityFlags: UniversityFeatureFlag[];
  universities: Array<{ id: string; name: string }>;
  onFeatureToggle?: (featureId: string, universityId: string, enabled: boolean) => void;
  onBulkUpdate?: (updates: BulkUniversityFeatureUpdate) => void;
  loading?: boolean;
}

// Feature categories with icons and colors
export const FEATURE_CATEGORIES = {
  career: {
    label: 'Career Development',
    icon: 'Briefcase',
    color: 'blue',
    description: 'Career guidance and job matching features'
  },
  analytics: {
    label: 'Analytics',
    icon: 'BarChart3',
    color: 'green',
    description: 'Data analytics and reporting features'
  },
  practice: {
    label: 'Practice Tests',
    icon: 'BookOpen',
    color: 'purple',
    description: 'Practice exams and skill assessments'
  },
  video_search: {
    label: 'Video Search',
    icon: 'Video',
    color: 'red',
    description: 'Educational video search and streaming'
  },
  library: {
    label: 'Library',
    icon: 'Library',
    color: 'indigo',
    description: 'Digital library and resource management'
  },
  resume: {
    label: 'Resume Builder',
    icon: 'FileText',
    color: 'orange',
    description: 'Resume creation and optimization tools'
  },
  sadhana: {
    label: 'Sadhana',
    icon: 'Sun',
    color: 'yellow',
    description: 'Sadhana spiritual practice features'
  },
  sangha: {
    label: 'Sangha',
    icon: 'Users',
    color: 'teal',
    description: 'Sangha community features'
  }
} as const;

export type FeatureCategory = keyof typeof FEATURE_CATEGORIES;

// New response type for the save university features endpoint
export interface UniversityFeatureSaveResponse {
  universityId: string;
  totalFeatures: number;
  enabledCount: number;
  disabledCount: number;
  enabledFeatures: string[];
}