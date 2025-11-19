export interface CorporateProfile {
  // Basic information
  id: string
  email: string
  name: string
  phone?: string
  status: string
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at?: string
  last_login?: string
  
  // Profile fields
  profile_picture?: string
  bio?: string
  
  // Company information
  company_name: string
  website_url?: string
  industry?: string
  company_size?: string
  founded_year?: number
  
  // Contact information
  contact_person?: string
  contact_designation?: string
  address?: string
  
  // Business details
  description?: string
  company_type?: string
  
  // Documents
  company_logo?: string
  mca_gst_certificate?: string
  
  // Verification
  verified: boolean
  verification_date?: string
}

export interface CorporateProfileUpdateData {
  // Basic information
  name?: string
  phone?: string
  bio?: string
  profile_picture?: string
  
  // Company information
  company_name?: string
  website_url?: string
  industry?: string
  company_size?: string
  founded_year?: number
  
  // Contact information
  contact_person?: string
  contact_designation?: string
  address?: string
  
  // Business details
  description?: string
  company_type?: string
  
  // Documents
  company_logo?: string
  mca_gst_certificate?: string
}

export interface FileUploadResponse {
  success: boolean
  file_url: string
  message: string
}

// Corporate Management Types for Admin Dashboard
export interface CorporateListItem {
  id: string
  company_name: string
  email: string
  phone?: string
  industry?: string
  address?: string
  website_url?: string
  contact_person?: string
  contact_designation?: string
  verified: boolean
  status: string
  company_size?: string
  company_type?: string
  founded_year?: number
  total_jobs?: number
  total_applications?: number
  created_at: string
  updated_at?: string
  last_login?: string
  is_archived: boolean
  email_verified?: boolean
  phone_verified?: boolean
  bio?: string
  profile_picture?: string
  description?: string
}

export interface CorporateListResponse {
  corporates: CorporateListItem[]
  total_corporates: number
  active_corporates: number
  archived_corporates: number
}

export interface CorporateProfile {
  id: string
  email: string
  name: string
  phone?: string
  status: string
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at?: string
  last_login?: string
  profile_picture?: string
  bio?: string
  company_name: string
  website_url?: string
  industry?: string
  company_size?: string
  founded_year?: number
  contact_person?: string
  contact_designation?: string
  address?: string
  description?: string
  company_type?: string
  company_logo?: string
  mca_gst_certificate?: string
  verified: boolean
  verification_date?: string
}

export interface CreateCorporateRequest {
  company_name: string
  email: string
  phone: string
  industry?: string
  address?: string
  website_url?: string
  contact_person?: string
  contact_designation?: string
  company_size?: string
  company_type?: string
  founded_year?: number
  description?: string
}

export interface CreateCorporateResponse {
  message: string
  corporate_id: string
  email: string
  temporary_password: string
}

export interface UpdateCorporateRequest {
  company_name?: string
  email?: string
  phone?: string
  industry?: string
  address?: string
  website_url?: string
  contact_person?: string
  contact_designation?: string
  company_size?: string
  company_type?: string
  founded_year?: number
  description?: string
  status?: string
}

export interface ArchiveCorporateRequest {
  is_archived: boolean
}