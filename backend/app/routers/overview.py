from datetime import date, timedelta, datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.request import StudentRequest
from app.schemas.overview import OverviewOut, UrgentOverview, WeekOverview

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("", response_model=OverviewOut)
def get_overview(db: Session = Depends(get_db)):
    today_str = date.today().strftime("%Y-%m-%d")
    now = datetime.now(timezone.utc)
    seven_days_ago = (now - timedelta(days=7)).isoformat()
    fourteen_days_ago = (now - timedelta(days=14)).isoformat()

    all_requests = db.query(StudentRequest).all()

    # Requests due today
    today_requests = [r for r in all_requests if r.deadline == today_str]
    critical_count = sum(1 for r in today_requests if r.priority == 5)
    medium_count = sum(1 for r in today_requests if r.priority == 3)
    low_count = sum(1 for r in today_requests if r.priority <= 2)

    # Weekly statistics (last 7 days vs previous 7 days)
    current_week_reqs = [r for r in all_requests if r.created_at >= seven_days_ago]
    previous_week_reqs = [
        r for r in all_requests if fourteen_days_ago <= r.created_at < seven_days_ago
    ]

    received_count = len(current_week_reqs)
    resolved_count = sum(1 for r in current_week_reqs if r.status == "resolved")

    # Time saved estimate: 20 minutes per resolved request + 5 minutes triaging per received request
    saved_minutes = (resolved_count * 20) + (received_count * 5)

    # Change percent vs previous week
    prev_received = len(previous_week_reqs)
    if prev_received > 0:
        change_pct = round(((received_count - prev_received) / prev_received) * 100, 1)
    else:
        change_pct = 0.0

    return OverviewOut(
        urgent=UrgentOverview(
            critical=critical_count,
            medium=medium_count,
            low=low_count,
        ),
        week=WeekOverview(
            received=received_count,
            resolved=resolved_count,
            savedMinutes=saved_minutes,
            changePercent=change_pct,
        ),
    )
