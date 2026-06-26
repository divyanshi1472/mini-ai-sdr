from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth_utils import get_current_user
import google.generativeai as genai
import openai
import os
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configure AI clients
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

if OPENAI_API_KEY:
    openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

def qualify_lead_with_openai(lead: models.Lead) -> dict:
    """Use OpenAI to qualify a lead."""
    prompt = f"""
    You are an expert sales qualification specialist. Analyze the following lead and provide a qualification score.
    
    Lead Information:
    - Name: {lead.first_name} {lead.last_name}
    - Email: {lead.email}
    - Company: {lead.company or 'Unknown'}
    - Job Title: {lead.job_title or 'Unknown'}
    - Industry: {lead.industry or 'Unknown'}
    - Company Size: {lead.company_size or 'Unknown'}
    - Notes: {lead.notes or 'None'}
    
    Provide a JSON response with:
    1. score (0-100): Lead qualification score
    2. status: "qualified", "unqualified", or "needs_nurturing"  
    3. reason: Brief explanation (2-3 sentences)
    4. key_factors: List of 3 key factors that influenced the score
    
    Return ONLY valid JSON, no markdown.
    """
    
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    
    return json.loads(response.choices[0].message.content)

def qualify_lead_with_gemini(lead: models.Lead) -> dict:
    """Use Google Gemini to qualify a lead."""
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    You are an expert sales qualification specialist. Analyze this lead and return ONLY a JSON object.
    
    Lead:
    - Name: {lead.first_name} {lead.last_name}
    - Email: {lead.email}
    - Company: {lead.company or 'Unknown'}
    - Job Title: {lead.job_title or 'Unknown'}
    - Industry: {lead.industry or 'Unknown'}
    - Company Size: {lead.company_size or 'Unknown'}
    - Notes: {lead.notes or 'None'}
    
    Return this exact JSON structure (no markdown, no explanation):
    {{"score": 0-100, "status": "qualified|unqualified|needs_nurturing", "reason": "brief explanation", "key_factors": ["factor1", "factor2", "factor3"]}}
    """
    
    response = model.generate_content(prompt)
    text = response.text.strip()
    # Remove markdown code blocks if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())

def generate_email_with_gemini(lead: models.Lead, tone: str, focus: str) -> dict:
    """Use Google Gemini to generate personalized email."""
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    focus_context = f"Focus on: {focus}" if focus else "Focus on the value proposition relevant to their industry"
    
    prompt = f"""
    You are an expert B2B sales copywriter. Generate a personalized outreach email for this lead.
    
    Lead Details:
    - Name: {lead.first_name} {lead.last_name}
    - Company: {lead.company or 'their company'}
    - Job Title: {lead.job_title or 'their role'}
    - Industry: {lead.industry or 'their industry'}
    - Company Size: {lead.company_size or 'unknown size'}
    - Notes: {lead.notes or 'None'}
    
    Email Requirements:
    - Tone: {tone}
    - {focus_context}
    - Keep it concise (150-200 words for body)
    - Include a clear, soft CTA
    - Make it feel personal, not templated
    
    Return ONLY this JSON structure (no markdown):
    {{"subject": "email subject line", "body": "full email body with greeting and signature placeholder"}}
    """
    
    response = model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())

@router.post("/qualify", response_model=schemas.QualifyLeadResponse)
async def qualify_lead(
    request: schemas.QualifyLeadRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lead = db.query(models.Lead).filter(
        models.Lead.id == request.lead_id,
        models.Lead.owner_id == current_user.id
    ).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    try:
        # Try OpenAI first, fallback to Gemini
        if OPENAI_API_KEY:
            result = qualify_lead_with_openai(lead)
        elif GEMINI_API_KEY:
            result = qualify_lead_with_gemini(lead)
        else:
            raise HTTPException(status_code=500, detail="No AI API key configured")
        
        # Map status
        status_map = {
            "qualified": models.LeadStatus.QUALIFIED,
            "unqualified": models.LeadStatus.UNQUALIFIED,
            "needs_nurturing": models.LeadStatus.NEW
        }
        
        lead.qualification_score = result.get("score", 50)
        lead.qualification_reason = result.get("reason", "")
        lead.status = status_map.get(result.get("status", "new"), models.LeadStatus.NEW)
        
        db.commit()
        db.refresh(lead)
        
        return {
            "lead_id": lead.id,
            "score": lead.qualification_score,
            "status": lead.status,
            "reason": lead.qualification_reason
        }
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI response parsing error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI qualification failed: {str(e)}")

@router.post("/generate-email", response_model=schemas.GenerateEmailResponse)
async def generate_email(
    request: schemas.GenerateEmailRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lead = db.query(models.Lead).filter(
        models.Lead.id == request.lead_id,
        models.Lead.owner_id == current_user.id
    ).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        result = generate_email_with_gemini(lead, request.tone, request.focus)
        
        lead.generated_email_subject = result.get("subject", "")
        lead.generated_email_body = result.get("body", "")
        lead.status = models.LeadStatus.CONTACTED
        
        db.commit()
        db.refresh(lead)
        
        return {
            "lead_id": lead.id,
            "subject": lead.generated_email_subject,
            "body": lead.generated_email_body
        }
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI response parsing error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email generation failed: {str(e)}")
