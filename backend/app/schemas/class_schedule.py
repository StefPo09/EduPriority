from pydantic import BaseModel
from typing import List

class TopicCount(BaseModel):
    name: str
    count: int

class ClassSummaryOut(BaseModel):
    className: str
    totalRequests: int
    averageTime: str
    resolutionRate: int
    topics: List[TopicCount]

class ScheduleSlotOut(BaseModel):
    time: str
    subjects: List[str]
    taughtSubjects: List[bool] = []

class CurriculumItemOut(BaseModel):
    title: str
    status: str
    subject: str

class ScheduleOut(BaseModel):
    className: str
    slots: List[ScheduleSlotOut]
    curriculum: List[CurriculumItemOut]
