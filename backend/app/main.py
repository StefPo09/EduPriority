from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS, CORS_ORIGIN_REGEX
from app.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
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
