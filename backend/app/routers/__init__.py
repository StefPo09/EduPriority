from app.routers.auth import router as auth_router
from app.routers.teachers import router as teachers_router
from app.routers.requests import router as requests_router
from app.routers.overview import router as overview_router
from app.routers.classes import router as classes_router
from app.routers.schedules import router as schedules_router
from app.routers.materials import router as materials_router
from app.routers.export import router as export_router

__all__ = [
    "auth_router",
    "teachers_router",
    "requests_router",
    "overview_router",
    "classes_router",
    "schedules_router",
    "materials_router",
    "export_router",
]
