import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text
from app.database import Base

class StudentRequest(Base):
    __tablename__ = "requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student = Column(String(120), nullable=False)
    student_id = Column(String(36), nullable=True)
    type = Column(String(30), nullable=False)  # "Întrebare" | "Temă" | "Recuperare"
    deadline = Column(String(10), nullable=False)  # YYYY-MM-DD
    text = Column(Text, nullable=False)
    subject = Column(String(100), default="Nespecificată", nullable=False)
    priority = Column(Integer, default=3, nullable=False)  # 1 to 5
    teacher_id = Column(String(36), nullable=True)
    teacher = Column(String(120), nullable=True)
    status = Column(String(20), default="pending", nullable=False)  # "pending" | "resolved"
    estimated_time = Column(String(50), default="—", nullable=True)
    suggested_action = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(
        String(40),
        default=lambda: datetime.now(timezone.utc).isoformat(),
        nullable=False,
    )
    resolved_at = Column(String(40), nullable=True)
