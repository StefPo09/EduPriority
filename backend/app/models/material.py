import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String
from app.database import Base

class Material(Base):
    __tablename__ = "materials"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    subject = Column(String(100), default="Nespecificată", nullable=False)
    class_name = Column(String(100), default="Nespecificată", nullable=False)
    type = Column(String(50), default="Fișier", nullable=False)
    size = Column(String(50), nullable=False)
    icon = Column(String(10), default="📄", nullable=False)
    file_path = Column(String(500), nullable=True)
    uploaded_at = Column(
        String(40),
        default=lambda: datetime.now(timezone.utc).isoformat(),
        nullable=False,
    )
