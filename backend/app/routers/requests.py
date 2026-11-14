import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.request import StudentRequest
from app.models.user import User
from app.schemas.request import StudentRequestCreate, StudentRequestOut, StudentRequestUpdate
from app.services.ai_classifier import analyze_student_request

router = APIRouter(prefix="/requests", tags=["Requests"])

@router.get("", response_model=List[StudentRequestOut], response_model_by_alias=True)
def list_requests(
    teacher_id: Optional[str] = Query(None, alias="teacherId"),
    student: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(StudentRequest)
    if current_user.role == "student":
        query = query.filter(StudentRequest.student_id == current_user.id)
    elif teacher_id and teacher_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nu poți accesa cererile altui profesor.")
    elif current_user.role == "teacher":
        query = query.filter(StudentRequest.teacher_id == current_user.id)
    if teacher_id:
        query = query.filter(StudentRequest.teacher_id == teacher_id)
    if student and current_user.role == "teacher":
        query = query.filter(StudentRequest.student.ilike(f"%{student}%"))
    if status_filter:
        query = query.filter(StudentRequest.status == status_filter)

    # Order by priority descending, then created_at descending
    return query.order_by(StudentRequest.priority.desc(), StudentRequest.created_at.desc()).all()

@router.post("", response_model=StudentRequestOut, status_code=status.HTTP_201_CREATED, response_model_by_alias=True)
def create_request(
    data: StudentRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student_name = data.student.strip()
    text = data.text.strip()
    if not student_name or not data.deadline or not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Câmpuri obligatorii lipsă.",
        )

    teacher = None
    teacher_name = data.teacher
    if current_user.role == "student":
        student_name = current_user.name
    elif data.teacherId and data.teacherId != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Poți crea cereri doar pentru propria clasă.")
    elif not data.teacherId:
        data.teacherId = current_user.id
    if data.teacherId:
        teacher = db.query(User).filter(User.id == data.teacherId, User.role == "teacher").first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selectează un profesor valid.",
            )
        teacher_name = teacher.name

    # Run AI Classification Pipeline
    ai_result = analyze_student_request(
        student_name=student_name,
        text=text,
        request_type=data.type,
        deadline_str=data.deadline,
        current_subject=data.subject,
        current_priority=data.priority,
    )

    request_id = str(uuid.uuid4())
    new_request = StudentRequest(
        id=request_id,
        student=student_name,
        type=data.type,
        deadline=data.deadline,
        text=text,
        subject=ai_result["subject"],
        priority=ai_result["priority"],
        teacher_id=teacher.id if teacher else None,
        student_id=current_user.id if current_user.role == "student" else None,
        teacher=teacher_name,
        status="pending",
        estimated_time=ai_result["estimated_time"],
        suggested_action=ai_result["suggested_action"],
        ai_summary=ai_result["ai_summary"],
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/{id}", response_model=StudentRequestOut, response_model_by_alias=True)
def get_request(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.query(StudentRequest).filter(StudentRequest.id == id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cererea nu a fost găsită.",
        )
    if not _can_access(req, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nu ai permisiunea necesară.")
    return req

@router.patch("/{id}", response_model=StudentRequestOut, response_model_by_alias=True)
def update_request(
    id: str,
    data: StudentRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = db.query(StudentRequest).filter(StudentRequest.id == id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cererea nu a fost găsită.",
        )
    if not _can_access(req, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nu ai permisiunea necesară.")
    if current_user.role == "student" and any(
        value is not None for value in (data.status, data.priority, data.subject)
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Elevii pot modifica doar textul propriei cereri.")

    if data.status is not None:
        req.status = data.status
        if data.status == "resolved":
            req.resolved_at = datetime.now(timezone.utc).isoformat()
        else:
            req.resolved_at = None

    if data.priority is not None:
        if 1 <= data.priority <= 5:
            req.priority = data.priority

    if data.subject is not None:
        req.subject = data.subject

    if data.text is not None:
        req.text = data.text

    db.commit()
    db.refresh(req)
    return req

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.query(StudentRequest).filter(StudentRequest.id == id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cererea nu a fost găsită.",
        )
    if not _can_access(req, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nu ai permisiunea necesară.")
    db.delete(req)
    db.commit()
    return None


def _can_access(req: StudentRequest, user: User) -> bool:
    return (
        (user.role == "student" and req.student_id == user.id)
        or (user.role == "teacher" and req.teacher_id == user.id)
    )
