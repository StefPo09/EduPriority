import json
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import create_access_token, get_current_user
from app.models.user import User
from app.models.school_class import SchoolClass, ScheduleSlot
from app.schemas.auth import UserSignup, UserLogin, UserOut, UserProfileUpdate, LoginResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    name = data.name.strip()
    email = data.email.strip().lower()

    if not name or not email or not data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completează toate câmpurile.",
        )
    if len(data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parola trebuie să aibă cel puțin 8 caractere.",
        )
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Există deja un cont cu acest email.",
        )

    student_class = None
    if data.role == "student":
        available_classes = db.query(SchoolClass).order_by(SchoolClass.name).all()
        if available_classes:
            requested_class = data.class_name.strip() if data.class_name else ""
            if requested_class:
                matching_class = next(
                    (
                        school_class
                        for school_class in available_classes
                        if school_class.name.casefold() == requested_class.casefold()
                    ),
                    None,
                )
                if not matching_class:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Clasa introdusă nu există.",
                    )
                student_class = matching_class.name
            else:
                student_class = random.choice(available_classes).name

    user = User(
        name=name,
        email=email,
        role=data.role,
        school=data.school.strip() if data.school else None,
        class_name=student_class,
        subjects_json=json.dumps(
            [subject.strip() for subject in data.subjects if subject.strip()]
        ),
    )
    user.set_password(data.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    if user.role == "teacher":
        taught_subjects = set(json.loads(user.subjects_json or "[]"))
        for school_class in db.query(SchoolClass).all():
            class_subjects = {
                subject
                for slot in db.query(ScheduleSlot)
                .filter(ScheduleSlot.class_name == school_class.name)
                .all()
                for subject in json.loads(slot.subjects_json or "[]")
            }
            assigned_teachers = json.loads(school_class.teacher_ids_json or "[]")
            if taught_subjects.intersection(class_subjects) and user.id not in assigned_teachers:
                assigned_teachers.append(user.id)
                school_class.teacher_ids_json = json.dumps(assigned_teachers)
        db.commit()
    return user

@router.post("/login", response_model=LoginResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    if not email or not data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completează emailul și parola.",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.check_password(data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email sau parolă incorectă.",
        )

    if user.role != data.role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Acest cont nu este înregistrat ca {data.role}.",
        )

    return {**UserOut.model_validate(user).model_dump(), "access_token": create_access_token(user)}

@router.patch("/profile", response_model=UserOut)
def update_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.id and data.id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Poți modifica doar propriul cont.")
    user = current_user
    if user.role == "teacher":
        user.school = data.school.strip() if data.school else user.school
        user.subjects_json = json.dumps(
            sorted({subject.strip() for subject in data.subjects if subject.strip()})
        )
    elif data.class_name:
        selected_class = (
            db.query(SchoolClass)
            .filter(SchoolClass.name == data.class_name.strip())
            .first()
        )
        if not selected_class:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Clasa selectată nu există.",
            )
        user.class_name = selected_class.name
    db.commit()
    db.refresh(user)
    return user
