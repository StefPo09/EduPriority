from pydantic import BaseModel, ConfigDict
from typing import Literal

class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    role: Literal["teacher", "student"]

class UserLogin(BaseModel):
    email: str
    password: str
    role: Literal["teacher", "student"]

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    role: str

class TeacherOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
