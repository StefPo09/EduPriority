import json
import random
from urllib.parse import unquote
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.school_class import SchoolClass, ScheduleSlot, CurriculumItem
from app.models.user import User
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
    ("Analiză Matematică - Limite și Derivate", "În desfășurare", "Matematică"),
    ("Algoritmi pe grafuri și programare dinamică", "Finalizat", "Informatică"),
    ("Termodinamică - Transformări gazoase", "Planificat", "Fizică"),
    ("Eseul structurat pentru Bacalaureat", "În desfășurare", "Limba Română"),
]

@router.get("/{class_name}", response_model=ScheduleOut)
def get_schedule(
    class_name: str,
    teacher_id: str | None = Query(None, alias="teacherId"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decoded_name = unquote(class_name)
    if current_user.role == "student":
        if decoded_name != current_user.class_name:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nu ai permisiunea necesară.")
        teacher_id = None
    elif teacher_id and teacher_id != current_user.id:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nu poți accesa programul altui profesor.")
    else:
        teacher_id = current_user.id
    if teacher_id:
        school_class = (
            db.query(SchoolClass)
            .filter(SchoolClass.name == decoded_name)
            .first()
        )
        assigned_teachers = (
            json.loads(school_class.teacher_ids_json or "[]")
            if school_class
            else []
        )
        if teacher_id not in assigned_teachers:
            return ScheduleOut(className=decoded_name, slots=[], curriculum=[])

    slot_models = db.query(ScheduleSlot).filter(ScheduleSlot.class_name == decoded_name).all()
    curriculum_models = db.query(CurriculumItem).filter(CurriculumItem.class_name == decoded_name).all()

    raw_slots = []
    slots_out = []
    teacher_subjects = []
    teacher_found = False
    if teacher_id:
        teacher = db.query(User).filter(User.id == teacher_id).first()
        if teacher:
            teacher_found = True
            teacher_subjects = teacher.subjects

    if slot_models:
        for s in slot_models:
            try:
                subs = json.loads(s.subjects_json)
            except Exception:
                subs = []
            raw_slots.append((s.time, subs))
    else:
        for time_str, subs in DEFAULT_SLOTS:
            raw_slots.append((time_str, subs))

    shuffled_subjects = [subject for _, subjects in raw_slots for subject in subjects]
    random.Random(decoded_name).shuffle(shuffled_subjects)
    position = 0
    for time_str, subjects in raw_slots:
        shuffled = shuffled_subjects[position : position + len(subjects)]
        position += len(subjects)
        slots_out.append(
            ScheduleSlotOut(
                time=time_str,
                subjects=shuffled,
                taughtSubjects=[subject in teacher_subjects for subject in shuffled],
            )
        )

    curriculum_out = []
    if curriculum_models:
        for c in curriculum_models:
            if not teacher_found or c.subject in teacher_subjects:
                curriculum_out.append(
                    CurriculumItemOut(
                        title=c.title, status=c.status, subject=c.subject
                    )
                )
    else:
        for title, status, subject in DEFAULT_CURRICULUM:
            if not teacher_found or subject in teacher_subjects:
                curriculum_out.append(
                    CurriculumItemOut(title=title, status=status, subject=subject)
                )

    return ScheduleOut(
        className=decoded_name,
        slots=slots_out,
        curriculum=curriculum_out,
    )
