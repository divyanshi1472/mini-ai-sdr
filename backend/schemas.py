from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from models import LeadStatus

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Lead Schemas
class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    notes: Optional[str] = None

class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[LeadStatus] = None

class LeadResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    company: Optional[str]
    job_title: Optional[str]
    industry: Optional[str]
    company_size: Optional[str]
    website: Optional[str]
    linkedin_url: Optional[str]
    notes: Optional[str]
    status: LeadStatus
    qualification_score: Optional[int]
    qualification_reason: Optional[str]
    generated_email_subject: Optional[str]
    generated_email_body: Optional[str]
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# AI Schemas
class QualifyLeadRequest(BaseModel):
    lead_id: int

class GenerateEmailRequest(BaseModel):
    lead_id: int
    tone: Optional[str] = "professional"
    focus: Optional[str] = None

class QualifyLeadResponse(BaseModel):
    lead_id: int
    score: int
    status: str
    reason: str

class GenerateEmailResponse(BaseModel):
    lead_id: int
    subject: str
    body: str
