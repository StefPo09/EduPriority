import os
from pathlib import Path
from typing import List

# Base directory for the backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Database configuration
DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'edupriority.db'}")

# Upload directory for study materials
UPLOADS_DIR: Path = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Secret key for authentication / password hashing salt
SECRET_KEY: str = os.getenv("SECRET_KEY", "edupriority-super-secret-key-2026")

# CORS allowed origins.
# Keep this explicit to avoid wildcard origins when credentials are enabled.
DEFAULT_CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

RAW_CORS_ORIGINS = os.getenv("CORS_ORIGINS", "")
if RAW_CORS_ORIGINS:
    CORS_ORIGINS = [origin.strip() for origin in RAW_CORS_ORIGINS.split(",") if origin.strip()]
else:
    CORS_ORIGINS = DEFAULT_CORS_ORIGINS

# Optional AI API Key (Gemini)
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
