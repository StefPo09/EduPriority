import json
from urllib.parse import unquote
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.school_class import ScheduleSlot, CurriculumItem
from app.schemas.class_schedule import ScheduleOut, ScheduleSlotOut, CurriculumItemOut

router = APIRouter(prefix="/schedules", tags=["Schedules"])

DEFAULT_SLOTS = [
    ("08:00 - 08:50", ["Matematică", "Fizică", "Informatică", "Limba Română", "Matematică"]),
    ("09:00 - 09:50", ["Matematică", "Chimie", "Informatică", "Istorie", "Fizică"]),
    ("10:00 - 10:50", ["Informatică", "Limba Română", "Limba Engleză", "Matematică", "Biologie"]),
    ("11:00 - 11:50", ["Limba Română", "Istorie", "Fizică", "Chimie", "Educație Fizică"]),
    ("12:00 - 12:50", ["Biologie", "Geografie", "Limba Română", "Informatică", "Limba Engleză"]),
]

DEFAULT_CURRICULUM = [
    ("Analiză Matematică - Limite și Derivate", "În desfășurare"),
    ("Algoritmi pe grafuri și programare dinamică", "Finalizat"),
    ("Termodinamică - Transformări gazoase", "Planificat"),
    ("Eseul structurat pentru Bacalaureat", "În desfășurare"),
]

@router.get("/{class_name}", response_model=ScheduleOut)
def get_schedule(class_name: str, db: Session = Depends(get_db)):
    decoded_name = unquote(class_name)

    slot_models = db.query(ScheduleSlot).filter(ScheduleSlot.class_name == decoded_name).all()
    curriculum_models = db.query(CurriculumItem).filter(CurriculumItem.class_name == decoded_name).all()

    slots_out = []
    if slot_models:
        for s in slot_models:
            try:
                subs = json.loads(s.subjects_json)
            except Exception:
                subs = []
            slots_out.append(ScheduleSlotOut(time=s.time, subjects=subs))
    else:
        for time_str, subs in DEFAULT_SLOTS:
            slots_out.append(ScheduleSlotOut(time=time_str, subjects=subs))

    curriculum_out = []
    if curriculum_models:
        for c in curriculum_models:
            curriculum_out.append(CurriculumItemOut(title=c.title, status=c.status))
    else:
        for title, status in DEFAULT_CURRICULUM:
            curriculum_out.append(CurriculumItemOut(title=title, status=status))

    return ScheduleOut(
        className=decoded_name,
        slots=slots_out,
        curriculum=curriculum_out,
    )
