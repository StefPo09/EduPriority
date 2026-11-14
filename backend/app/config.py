import os
import re
from ipaddress import IPv6Address
from pathlib import Path
from typing import List
from urllib.parse import urlsplit

# Base directory for the backend
BASE_DIR = Path(__file__).resolve().parent.parent

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
if APP_ENV not in ("development", "production"):
    raise ValueError("APP_ENV must be development or production")

# Database configuration
DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'edupriority.db'}")

# Secret key for authentication / password hashing salt
DEFAULT_SECRET_KEY = "edupriority-super-secret-key-2026"
SECRET_KEY: str = os.getenv("SECRET_KEY", DEFAULT_SECRET_KEY)
if APP_ENV == "production":
    normalized_secret = re.sub(r"[^a-z0-9]", "", SECRET_KEY.lower())
    repeated_secret = any(
        len(SECRET_KEY) % size == 0 and SECRET_KEY == SECRET_KEY[:size] * (len(SECRET_KEY) // size)
        for size in range(1, len(SECRET_KEY) // 2 + 1)
    )
    if (
        len(SECRET_KEY) < 32
        or SECRET_KEY != SECRET_KEY.strip()
        or re.sub(r"[^a-z0-9]", "", DEFAULT_SECRET_KEY.lower()) in normalized_secret
        or len(set(SECRET_KEY)) < 8
        or repeated_secret
        or any(marker in normalized_secret for marker in (
            "changeme", "changethis", "replaceme", "yoursecret", "password", "placeholder",
            "default", "insecure", "weak", "0123456789", "9876543210",
            "abcdefghijklmnopqrstuvwxyz", "zyxwvutsrqponmlkjihgfedcba",
        ))
    ):
        raise ValueError("SECRET_KEY must be a strong, non-default value of at least 32 characters")

if APP_ENV == "production":
    SEED_DEMO_DATA = False
else:
    seed_setting = os.getenv("SEED_DEMO_DATA", "true").strip().lower()
    if seed_setting not in ("true", "false", "1", "0", "yes", "no", "on", "off"):
        raise ValueError("SEED_DEMO_DATA must be a boolean")
    SEED_DEMO_DATA = seed_setting in ("true", "1", "yes", "on")

# CORS allowed origins.
# Keep this explicit to avoid wildcard origins when credentials are enabled.
DEFAULT_CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

RAW_CORS_ORIGINS = os.getenv("CORS_ORIGINS", "")
if APP_ENV == "production":
    CORS_ORIGINS = [origin.strip() for origin in RAW_CORS_ORIGINS.split(",")]

    def valid_origin(origin: str) -> bool:
        try:
            parsed = urlsplit(origin)
            if (
                parsed.scheme not in ("http", "https")
                or not parsed.hostname
                or any(ord(char) < 33 or ord(char) == 127 for char in origin)
                or parsed.path
                or "?" in origin
                or "#" in origin
                or parsed.username is not None
                or parsed.password is not None
                or parsed.port == 0
            ):
                return False
            if parsed.netloc.startswith("["):
                IPv6Address(parsed.hostname)
                return bool(re.fullmatch(r"\[[0-9a-fA-F:.]+\](?::[0-9]+)?", parsed.netloc))
            return bool(re.fullmatch(r"[a-zA-Z0-9.-]+(?::[0-9]+)?", parsed.netloc))
        except ValueError:
            return False

    if not all(valid_origin(origin) for origin in CORS_ORIGINS):
        raise ValueError("CORS_ORIGINS must list explicit HTTP(S) origins without wildcards or paths")
elif RAW_CORS_ORIGINS:
    CORS_ORIGINS = [origin.strip() for origin in RAW_CORS_ORIGINS.split(",") if origin.strip()]
else:
    CORS_ORIGINS = DEFAULT_CORS_ORIGINS

CORS_ORIGIN_REGEX = None if APP_ENV == "production" else (
    r"https?://(?:localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|"
    r"172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|"
    r"192\.168(?:\.\d{1,3}){2})(?::\d{1,5})?"
)

# Upload directory for study materials
UPLOADS_DIR: Path = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Optional AI API Key (Gemini)
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
