import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.request import StudentRequest

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/csv")
def export_csv(db: Session = Depends(get_db)):
    requests = (
        db.query(StudentRequest)
        .order_by(StudentRequest.priority.desc(), StudentRequest.created_at.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)
    # Header matching the frontend ExportPage expectations
    writer.writerow([
        "Scor",
        "Cerere",
        "Materie",
        "Urgență",
        "Deadline",
        "Elev",
        "Profesor",
        "Status",
        "Timp estimat",
        "Data primirii",
    ])

    for req in requests:
        writer.writerow([
            req.priority,
            req.text,
            req.subject,
            req.type,
            req.deadline,
            req.student,
            req.teacher or "Nespecificat",
            req.status,
            req.estimated_time or "—",
            req.created_at,
        ])

    csv_data = "\ufeff" + output.getvalue()  # UTF-8 BOM for proper Romanian diacritics in Excel
    return Response(
        content=csv_data,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="edupriority-cereri.csv"'},
    )
