from app.schemas.auth import UserSignup, UserLogin, UserOut, TeacherOut
from app.schemas.request import StudentRequestCreate, StudentRequestUpdate, StudentRequestOut
from app.schemas.material import MaterialOut
from app.schemas.class_schedule import ClassSummaryOut, ScheduleOut, TopicCount, ScheduleSlotOut, CurriculumItemOut
from app.schemas.overview import OverviewOut, UrgentOverview, WeekOverview

__all__ = [
    "UserSignup",
    "UserLogin",
    "UserOut",
    "TeacherOut",
    "StudentRequestCreate",
    "StudentRequestUpdate",
    "StudentRequestOut",
    "MaterialOut",
    "ClassSummaryOut",
    "ScheduleOut",
    "TopicCount",
    "ScheduleSlotOut",
    "CurriculumItemOut",
    "OverviewOut",
    "UrgentOverview",
    "WeekOverview",
]
