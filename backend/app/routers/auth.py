from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserSignup, UserLogin, UserOut

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

    user = User(
        name=name,
        email=email,
        role=data.role,
    )
    user.set_password(data.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=UserOut)
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

    return user
