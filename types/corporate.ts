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
