from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS, CORS_ORIGIN_REGEX
from app.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
from sqlalchemy import inspect, text
from app.routers import (
    auth_router,
    teachers_router,
    requests_router,
    overview_router,
    classes_router,
    schedules_router,
    materials_router,
    export_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        columns = {
            column["name"]
            for column in inspect(connection).get_columns("users")
        }
        if "subjects_json" not in columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN subjects_json VARCHAR(1000) DEFAULT '[]' NOT NULL")
            )
        if "class_name" not in columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN class_name VARCHAR(100)")
            )
        class_columns = {
            column["name"]
            for column in inspect(connection).get_columns("school_classes")
        }
        if "teacher_ids_json" not in class_columns:
            connection.execute(
                text("ALTER TABLE school_classes ADD COLUMN teacher_ids_json VARCHAR(1000) DEFAULT '[]' NOT NULL")
            )
        curriculum_columns = {
            column["name"]
            for column in inspect(connection).get_columns("curriculum_items")
        }
        if "subject" not in curriculum_columns:
            connection.execute(
                text("ALTER TABLE curriculum_items ADD COLUMN subject VARCHAR(100) DEFAULT 'Nespecificată' NOT NULL")
            )
        material_columns = {
            column["name"]
            for column in inspect(connection).get_columns("materials")
        }
        if "teacher_id" not in material_columns:
            connection.execute(
                text("ALTER TABLE materials ADD COLUMN teacher_id VARCHAR(36)")
            )
    # Seed initial data if empty
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="EduPriority API",
    description="Backend AI-powered API for EduPriority - Student Request Prioritization & Classroom Management",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(teachers_router, prefix="/api")
app.include_router(requests_router, prefix="/api")
app.include_router(overview_router, prefix="/api")
app.include_router(classes_router, prefix="/api")
app.include_router(schedules_router, prefix="/api")
app.include_router(materials_router, prefix="/api")
app.include_router(export_router, prefix="/api")

@app.get("/")
def root():
    return {
        "name": "EduPriority Backend API",
        "status": "online",
        "documentation": "/docs",
        "version": "1.0.0",
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "EduPriority Backend"}
