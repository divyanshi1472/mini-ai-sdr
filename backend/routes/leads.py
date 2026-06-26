from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from auth_utils import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.LeadResponse])
def get_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Lead).filter(models.Lead.owner_id == current_user.id)
    
    if status:
        query = query.filter(models.Lead.status == status)
    if search:
        query = query.filter(
            (models.Lead.first_name.ilike(f"%{search}%")) |
            (models.Lead.last_name.ilike(f"%{search}%")) |
            (models.Lead.email.ilike(f"%{search}%")) |
            (models.Lead.company.ilike(f"%{search}%"))
        )
    
    return query.order_by(models.Lead.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_data: schemas.LeadCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lead = models.Lead(**lead_data.model_dump(), owner_id=current_user.id)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

@router.get("/stats")
def get_lead_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    total = db.query(models.Lead).filter(models.Lead.owner_id == current_user.id).count()
    qualified = db.query(models.Lead).filter(
        models.Lead.owner_id == current_user.id,
        models.Lead.status == models.LeadStatus.QUALIFIED
    ).count()
    contacted = db.query(models.Lead).filter(
        models.Lead.owner_id == current_user.id,
        models.Lead.status == models.LeadStatus.CONTACTED
    ).count()
    converted = db.query(models.Lead).filter(
        models.Lead.owner_id == current_user.id,
        models.Lead.status == models.LeadStatus.CONVERTED
    ).count()
    new = db.query(models.Lead).filter(
        models.Lead.owner_id == current_user.id,
        models.Lead.status == models.LeadStatus.NEW
    ).count()
    
    return {
        "total": total,
        "new": new,
        "qualified": qualified,
        "contacted": contacted,
        "converted": converted,
        "conversion_rate": round((converted / total * 100), 1) if total > 0 else 0
    }

@router.get("/{lead_id}", response_model=schemas.LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lead = db.query(models.Lead).filter(
        models.Lead.id == lead_id,
        models.Lead.owner_id == current_user.id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.put("/{lead_id}", response_model=schemas.LeadResponse)
def update_lead(
    lead_id: int,
    lead_data: schemas.LeadUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lead = db.query(models.Lead).filter(
        models.Lead.id == lead_id,
        models.Lead.owner_id == current_user.id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_data = lead_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lead, key, value)
    
    db.commit()
    db.refresh(lead)
    return lead

@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lead = db.query(models.Lead).filter(
        models.Lead.id == lead_id,
        models.Lead.owner_id == current_user.id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db.delete(lead)
    db.commit()
