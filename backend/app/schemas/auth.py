from pydantic import BaseModel, ConfigDict, Field
from typing import Literal, List

class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    role: Literal["teacher", "student"]
    school: str | None = None
    class_name: str | None = None
    subjects: List[str] = Field(default_factory=list)

class UserLogin(BaseModel):
    email: str
    password: str
    role: Literal["teacher", "student"]

class UserProfileUpdate(BaseModel):
    id: str | None = None
    school: str | None = None
    class_name: str | None = None
    subjects: List[str] = Field(default_factory=list)

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    role: str
    school: str | None = None
    class_name: str | None = None
    subjects: List[str] = Field(default_factory=list)

class LoginResponse(UserOut):
    access_token: str
    token_type: str = "bearer"

class TeacherOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    school: str | None = None
    subjects: List[str] = Field(default_factory=list)
