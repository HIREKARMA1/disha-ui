// Student Features Types
// Based on backend schemas from app/schemas/student_features.py

export interface StudentFeature {
  id: string;
  feature_key: string;
  feature_name: string;
  display_name: string;
  description?: string;
  icon?: string;
  route?: string;
  order: number;
  is_active: boolean;
  category?: string;
  requires_auth: boolean;
  settings?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  tenant_id: string;
}

export interface StudentFeatureWithAccess extends StudentFeature {
  is_available: boolean;
  university_status?: {
    access_reason: string;
    custom_message?: string;
    is_enabled_for_university: boolean;
    university_id: string;
  };
}

export interface StudentFeaturesListResponse {
  features: StudentFeatureWithAccess[];
  total_count: number;
  enabled_count: number;
  disabled_count: number;
}

export interface StudentFeatureCreate {
  feature_key: string;
  feature_name: string;
  display_name: string;
  description?: string;
  icon?: string;
  route?: string;
  order: number;
  is_active: boolean;
  category?: string;
  requires_auth: boolean;
  settings?: Record<string, any>;
}

export interface StudentFeatureUpdate {
  feature_name?: string;
  display_name?: string;
  description?: string;
  icon?: string;
  route?: string;
  order?: number;
  is_active?: boolean;
  category?: string;
  requires_auth?: boolean;
  settings?: Record<string, any>;
}

// UI-specific types
export interface StudentFeatureAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: StudentFeatureWithAccess;
}

export interface StudentSidebarProps {
  features: StudentFeatureWithAccess[];
  onFeatureClick: (feature: StudentFeatureWithAccess) => void;
}
