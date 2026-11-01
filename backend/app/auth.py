import base64
import hashlib
import hmac
import json
import time
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import SECRET_KEY
from app.database import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)
TOKEN_TTL_SECONDS = 60 * 60 * 8


def _encode_part(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _decode_part(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def create_access_token(user: User) -> str:
    payload = {"sub": user.id, "role": user.role, "exp": int(time.time()) + TOKEN_TTL_SECONDS}
    encoded_payload = _encode_part(json.dumps(payload, separators=(",", ":")).encode())
    signature = hmac.new(
        SECRET_KEY.encode("utf-8"), encoded_payload.encode("ascii"), hashlib.sha256
    ).digest()
    return f"{encoded_payload}.{_encode_part(signature)}"


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Autentificare necesară.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials or credentials.scheme.lower() != "bearer":
        raise unauthorized
    try:
        encoded_payload, encoded_signature = credentials.credentials.split(".", 1)
        expected_signature = hmac.new(
            SECRET_KEY.encode("utf-8"), encoded_payload.encode("ascii"), hashlib.sha256
        ).digest()
        if not hmac.compare_digest(_decode_part(encoded_signature), expected_signature):
            raise unauthorized
        payload = json.loads(_decode_part(encoded_payload))
        if int(payload["exp"]) < int(time.time()):
            raise unauthorized
        user = db.query(User).filter(User.id == payload["sub"]).first()
    except (ValueError, KeyError, TypeError, json.JSONDecodeError, UnicodeDecodeError):
        raise unauthorized
    if not user or user.role != payload.get("role"):
        raise unauthorized
    return user


def require_role(*roles: str):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Nu ai permisiunea necesară.",
            )
        return user

    return dependency
