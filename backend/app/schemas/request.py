from pydantic import BaseModel, Field, AliasChoices, ConfigDict
from typing import Optional, Literal

class StudentRequestCreate(BaseModel):
    student: str
    type: Literal["Întrebare", "Temă", "Recuperare"]
    deadline: str
    text: str
    subject: Optional[str] = "Nespecificată"
    priority: Optional[int] = 3
    teacherId: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("teacherId", "teacher_id"),
    )
    teacher: Optional[str] = None

class StudentRequestUpdate(BaseModel):
    status: Optional[str] = None  # "pending" | "resolved"
    priority: Optional[int] = None
    subject: Optional[str] = None
    text: Optional[str] = None

class StudentRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    student: str
    type: str
    deadline: str
    text: str
    createdAt: str = Field(
        ...,
        validation_alias=AliasChoices("createdAt", "created_at"),
        serialization_alias="createdAt",
    )
    subject: str
    priority: int
    teacherId: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("teacherId", "teacher_id"),
        serialization_alias="teacherId",
    )
    teacher: Optional[str] = None
    status: Optional[str] = "pending"
    estimatedTime: Optional[str] = Field(
        default="—",
        validation_alias=AliasChoices("estimatedTime", "estimated_time"),
        serialization_alias="estimatedTime",
    )
    suggestedAction: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("suggestedAction", "suggested_action"),
        serialization_alias="suggestedAction",
    )
    aiSummary: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("aiSummary", "ai_summary"),
        serialization_alias="aiSummary",
    )
