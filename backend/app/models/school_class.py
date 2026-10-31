from sqlalchemy import Column, Integer, String
from app.database import Base

class SchoolClass(Base):
    __tablename__ = "school_classes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)

class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    class_name = Column(String(100), nullable=False, index=True)
    time = Column(String(50), nullable=False)
    subjects_json = Column(String(500), nullable=False, default="[]")

class CurriculumItem(Base):
    __tablename__ = "curriculum_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    class_name = Column(String(100), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    status = Column(String(50), nullable=False, default="În desfășurare")
