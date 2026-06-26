export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  linkedin_url?: string;
  notes?: string;
  status: LeadStatus;
  qualification_score?: number;
  qualification_reason?: string;
  generated_email_subject?: string;
  generated_email_body?: string;
  owner_id: number;
  created_at: string;
  updated_at?: string;
}

export type LeadStatus = 'new' | 'qualified' | 'unqualified' | 'contacted' | 'converted';

export interface LeadStats {
  total: number;
  new: number;
  qualified: number;
  contacted: number;
  converted: number;
  conversion_rate: number;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CreateLeadData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  linkedin_url?: string;
  notes?: string;
}

export interface QualifyResponse {
  lead_id: number;
  score: number;
  status: string;
  reason: string;
}

export interface GenerateEmailResponse {
  lead_id: number;
  subject: string;
  body: string;
}
