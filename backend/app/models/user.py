import uuid
import secrets
import hashlib
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from app.database import Base

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.scrypt(
        password.encode("utf-8"),
        salt=bytes.fromhex(salt),
        n=16384,
        r=8,
        p=1,
        dklen=64,
    ).hex()
    return f"{salt}:{hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        parts = stored_hash.split(":")
        if len(parts) != 2:
            return False
        salt_hex, hash_hex = parts
        computed = hashlib.scrypt(
            password.encode("utf-8"),
            salt=bytes.fromhex(salt_hex),
            n=16384,
            r=8,
            p=1,
            dklen=64,
        ).hex()
        return secrets.compare_digest(computed, hash_hex)
    except Exception:
        return False

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # "teacher" | "student"
    school = Column(String(180), default="Liceul Teoretic Mihai Eminescu")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def set_password(self, password: str):
        self.password_hash = hash_password(password)

    def check_password(self, password: str) -> bool:
        return verify_password(password, self.password_hash)
