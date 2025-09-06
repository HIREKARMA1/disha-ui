export type UserType = 'student' | 'corporate' | 'university' | 'admin';

export interface StudentRegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  institution?: string;
  degree?: string;
  graduation_year?: number;
  branch?: string;
  tenth_grade_percentage?: number;
  twelfth_grade_percentage?: number;
  btech_cgpa?: number;
  major?: string;
  technical_skills?: string;
  preferred_industry?: string;
  job_roles_of_interest?: string;
}

export interface CorporateRegisterRequest {
  company_name: string;
  email: string;
  password: string;
  website_url?: string;
  industry?: string;
  company_size?: string;
  founded_year?: number;
  contact_person?: string;
  contact_designation?: string;
  phone?: string;
  address?: string;
  description?: string;
  company_type?: string;
}

export interface UniversityRegisterRequest {
  university_name: string;
  email: string;
  password: string;
  website_url?: string;
  institute_type?: string;
  established_year?: number;
  contact_person_name?: string;
  contact_designation?: string;
  phone?: string;
  address?: string;
  courses_offered?: string;
  branch?: string;
}

export interface AdminRegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  user_type: UserType;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_type?: UserType;
  user_id?: string;
  name?: string;
}

export interface ForgotPasswordRequest {
  email: string;
  user_type: UserType;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  otp: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  user_type: UserType;
  status: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  last_login?: string;
  profile_completion_percentage?: number;
}
