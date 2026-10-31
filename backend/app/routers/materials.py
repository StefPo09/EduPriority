import uuid
import shutil
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import UPLOADS_DIR
from app.models.material import Material
from app.schemas.material import MaterialOut

router = APIRouter(prefix="/materials", tags=["Materials"])

def determine_icon(filename: str, content_type: str) -> str:
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext in ["pdf"]:
        return "📄"
    if ext in ["cpp", "c", "py", "java", "js", "ts", "html", "css"]:
        return "💻"
    if ext in ["xlsx", "xls", "csv"]:
        return "📊"
    if ext in ["docx", "doc", "txt", "rtf"]:
        return "📝"
    if ext in ["zip", "rar", "7z", "tar"]:
        return "📦"
    if ext in ["png", "jpg", "jpeg", "webp"]:
        return "🖼️"
    return "📚"

def format_size(bytes_size: int) -> str:
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024 * 1024:
        return f"{round(bytes_size / 1024)} KB"
    else:
        return f"{round(bytes_size / (1024 * 1024), 1)} MB"

@router.get("", response_model=List[MaterialOut], response_model_by_alias=True)
def list_materials(db: Session = Depends(get_db)):
    materials = db.query(Material).order_by(Material.uploaded_at.desc()).all()
    return materials

@router.post("", response_model=MaterialOut, status_code=status.HTTP_201_CREATED, response_model_by_alias=True)
async def upload_material(
    file: UploadFile = File(...),
    subject: Optional[str] = Form("Nespecificată"),
    class_name: Optional[str] = Form("Nespecificată"),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selectează un fișier.",
        )

    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}_{file.filename}"
    saved_path = UPLOADS_DIR / safe_name

    # Read and save file content
    content = await file.read()
    file_size = len(content)
    with open(saved_path, "wb") as f:
        f.write(content)

    icon = determine_icon(file.filename, file.content_type or "")
    size_str = format_size(file_size)

    material = Material(
        id=file_id,
        name=file.filename,
        subject=subject or "Nespecificată",
        class_name=class_name or "Nespecificată",
        type=file.content_type or file.filename.split(".")[-1].upper(),
        size=size_str,
        icon=icon,
        file_path=str(saved_path),
        uploaded_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material

@router.get("/{id}/download")
def download_material(id: str, db: Session = Depends(get_db)):
    mat = db.query(Material).filter(Material.id == id).first()
    if not mat or not mat.file_path or not Path(mat.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fișierul nu a fost găsit pe server.",
        )
    return FileResponse(
        path=mat.file_path,
        filename=mat.name,
        media_type="application/octet-stream",
    )
