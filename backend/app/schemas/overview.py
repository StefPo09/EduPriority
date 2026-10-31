from pydantic import BaseModel

class UrgentOverview(BaseModel):
    critical: int
    medium: int
    low: int

class WeekOverview(BaseModel):
    received: int
    resolved: int
    savedMinutes: int
    changePercent: float

class OverviewOut(BaseModel):
    urgent: UrgentOverview
    week: WeekOverview
