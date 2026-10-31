from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import TeacherOut

router = APIRouter(prefix="/teachers", tags=["Teachers"])

@router.get("", response_model=List[TeacherOut])
def list_teachers(db: Session = Depends(get_db)):
    teachers = db.query(User).filter(User.role == "teacher").order_by(User.name.asc()).all()
    return teachers
