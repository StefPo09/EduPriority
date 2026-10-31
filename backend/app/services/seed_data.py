import json
import uuid
from datetime import date, timedelta, datetime, timezone
from sqlalchemy.orm import Session
from app.models.user import User, hash_password
from app.models.school_class import SchoolClass, ScheduleSlot, CurriculumItem
from app.models.request import StudentRequest
from app.models.material import Material
from app.services.ai_classifier import analyze_student_request

def seed_database(db: Session):
    # Ensure the project is usable even when the database file exists but is empty or partially populated.
    default_users = [
        {
            "id": str(uuid.uuid4()),
            "name": "Prof. Mihai Popescu",
            "email": "prof.popescu@edupriority.ro",
            "password_hash": hash_password("Profesor123!"),
            "role": "teacher",
            "school": "Liceul Teoretic Mihai Eminescu",
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Prof. Elena Ionescu",
            "email": "prof.ionescu@edupriority.ro",
            "password_hash": hash_password("Profesor123!"),
            "role": "teacher",
            "school": "Liceul Teoretic Mihai Eminescu",
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Prof. Andrei Dumitrescu",
            "email": "prof.dumitrescu@edupriority.ro",
            "password_hash": hash_password("Profesor123!"),
            "role": "teacher",
            "school": "Liceul Teoretic Mihai Eminescu",
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Alex Radu",
            "email": "alex.radu@edupriority.ro",
            "password_hash": hash_password("Student123!"),
            "role": "student",
            "school": "Liceul Teoretic Mihai Eminescu",
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Maria Stan",
            "email": "maria.stan@edupriority.ro",
            "password_hash": hash_password("Student123!"),
            "role": "student",
            "school": "Liceul Teoretic Mihai Eminescu",
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Andrei Popa",
            "email": "andrei.popa@edupriority.ro",
            "password_hash": hash_password("Student123!"),
            "role": "student",
            "school": "Liceul Teoretic Mihai Eminescu",
        },
    ]

    existing_emails = {user.email for user in db.query(User.email).all()}
    for payload in default_users:
        if payload["email"] not in existing_emails:
            db.add(User(**payload))
    db.flush()

    if db.query(SchoolClass).count() == 0:
        classes = [
            "Clasa a 11-a A",
            "Clasa a 11-a B",
            "Clasa a 12-a A",
            "Clasa a 12-a B",
            "Clasa a 10-a C",
        ]
        for c_name in classes:
            db.add(SchoolClass(name=c_name))

    if db.query(ScheduleSlot).count() == 0:
        slots_11a = [
            ("08:00 - 08:50", ["Matematică", "Fizică", "Informatică", "Limba Română", "Matematică"]),
            ("09:00 - 09:50", ["Matematică", "Chimie", "Informatică", "Istorie", "Fizică"]),
            ("10:00 - 10:50", ["Informatică", "Limba Română", "Limba Engleză", "Matematică", "Biologie"]),
            ("11:00 - 11:50", ["Limba Română", "Istorie", "Fizică", "Chimie", "Educație Fizică"]),
            ("12:00 - 12:50", ["Biologie", "Geografie", "Limba Română", "Informatică", "Limba Engleză"]),
            ("13:00 - 13:50", ["Opțional Info", "—", "Geografie", "—", "Consiliere"]),
        ]
        for time_str, subs in slots_11a:
            db.add(ScheduleSlot(class_name="Clasa a 11-a A", time=time_str, subjects_json=json.dumps(subs)))

        slots_12a = [
            ("08:00 - 08:50", ["Informatică", "Matematică", "Fizică", "Limba Română", "Matematică"]),
            ("09:00 - 09:50", ["Informatică", "Matematică", "Limba Engleză", "Istorie", "Fizică"]),
            ("10:00 - 10:50", ["Matematică", "Limba Română", "Informatică", "Matematică", "Chimie"]),
            ("11:00 - 11:50", ["Fizică", "Chimie", "Limba Română", "Informatică", "Biologie"]),
            ("12:00 - 12:50", ["Limba Română", "Biologie", "Geografie", "Limba Engleză", "Sport"]),
        ]
        for time_str, subs in slots_12a:
            db.add(ScheduleSlot(class_name="Clasa a 12-a A", time=time_str, subjects_json=json.dumps(subs)))

    if db.query(CurriculumItem).count() == 0:
        curriculum_11a = [
            ("Derivate de ordin superior și aplicații geometrice", "În desfășurare"),
            ("Programare dinamică și algoritmi de grafuri", "Finalizat"),
            ("Termodinamică: transformări ale gazului ideal", "Planificat"),
            ("Romanul realist-obiectiv în literatura română", "Finalizat"),
            ("Legile lui Kirchhoff și circuite de curent continuu", "Planificat"),
        ]
        for title, status in curriculum_11a:
            db.add(CurriculumItem(class_name="Clasa a 11-a A", title=title, status=status))

        curriculum_12a = [
            ("Integrale definite și calcul de arii/volume", "În desfășurare"),
            ("Pregătire Bacalaureat - Subiectul al III-lea Română", "În desfășurare"),
            ("Structuri arborescente și algoritmi genetici", "Finalizat"),
        ]
        for title, status in curriculum_12a:
            db.add(CurriculumItem(class_name="Clasa a 12-a A", title=title, status=status))

    if db.query(StudentRequest).count() == 0:
        today = date.today()
        today_str = today.strftime("%Y-%m-%d")
        tomorrow_str = (today + timedelta(days=1)).strftime("%Y-%m-%d")
        in_2_days = (today + timedelta(days=2)).strftime("%Y-%m-%d")
        in_5_days = (today + timedelta(days=5)).strftime("%Y-%m-%d")

        teacher_popescu = db.query(User).filter(User.email == "prof.popescu@edupriority.ro").first()
        teacher_ionescu = db.query(User).filter(User.email == "prof.ionescu@edupriority.ro").first()
        teacher_dumitrescu = db.query(User).filter(User.email == "prof.dumitrescu@edupriority.ro").first()
        student_alex = db.query(User).filter(User.email == "alex.radu@edupriority.ro").first()
        student_maria = db.query(User).filter(User.email == "maria.stan@edupriority.ro").first()
        student_andrei = db.query(User).filter(User.email == "andrei.popa@edupriority.ro").first()

        initial_requests_data = [
            {
                "student": "Alex Radu",
                "student_id": student_alex.id,
                "teacher": teacher_popescu.name,
                "teacher_id": teacher_popescu.id,
                "type": "Întrebare",
                "deadline": today_str,
                "text": "Nu am înțeles cum se calculează asimptota oblică la funcția rațională de la pagina 45, exercițiul 7. Am test mâine și sunt foarte blocat, e urgent!",
            },
            {
                "student": "Maria Stan",
                "student_id": student_maria.id,
                "teacher": teacher_popescu.name,
                "teacher_id": teacher_popescu.id,
                "type": "Temă",
                "deadline": tomorrow_str,
                "text": "Am o eroare de compilare în programul C++ pentru parcurgerea în adâncime (DFS) a unui graf orientat.",
            },
            {
                "student": "Andrei Popa",
                "student_id": student_andrei.id,
                "teacher": teacher_ionescu.name,
                "teacher_id": teacher_ionescu.id,
                "type": "Recuperare",
                "deadline": in_2_days,
                "text": "Doresc o programare pentru recuperarea lucrării de laborator la Fizică (circuite electrice și legile lui Kirchhoff). Am fost scutit medical.",
            },
            {
                "student": "Alex Radu",
                "student_id": student_alex.id,
                "teacher": teacher_dumitrescu.name,
                "teacher_id": teacher_dumitrescu.id,
                "type": "Temă",
                "deadline": in_5_days,
                "text": "Aș dori o verificare preliminară pentru eseul structurat despre tema și viziunea despre lume în romanul Moromeții.",
            },
            {
                "student": "Maria Stan",
                "student_id": student_maria.id,
                "teacher": teacher_popescu.name,
                "teacher_id": teacher_popescu.id,
                "type": "Întrebare",
                "deadline": today_str,
                "text": "Avem nevoie de calculator științific la teza de la analiza matematică de azi?",
            },
        ]

        for req in initial_requests_data:
            ai_res = analyze_student_request(
                student_name=req["student"],
                text=req["text"],
                request_type=req["type"],
                deadline_str=req["deadline"],
            )
            db.add(StudentRequest(
                id=str(uuid.uuid4()),
                student=req["student"],
                student_id=req["student_id"],
                teacher=req["teacher"],
                teacher_id=req["teacher_id"],
                type=req["type"],
                deadline=req["deadline"],
                text=req["text"],
                subject=ai_res["subject"],
                priority=ai_res["priority"],
                estimated_time=ai_res["estimated_time"],
                suggested_action=ai_res["suggested_action"],
                ai_summary=ai_res["ai_summary"],
                status="pending",
                created_at=datetime.now(timezone.utc).isoformat(),
            ))

    if db.query(Material).count() == 0:
        db.add_all([
            Material(
                id=str(uuid.uuid4()),
                name="Fișă recapitulativă - Analiză Matematică (Derivate).pdf",
                subject="Matematică",
                class_name="Clasa a 11-a A",
                type="PDF",
                size="340 KB",
                icon="📄",
            ),
            Material(
                id=str(uuid.uuid4()),
                name="Algoritmi de Grafuri - Exemple C++.cpp",
                subject="Informatică",
                class_name="Clasa a 11-a A",
                type="C++",
                size="45 KB",
                icon="💻",
            ),
            Material(
                id=str(uuid.uuid4()),
                name="Bareme și Modele Bacalaureat Română.pdf",
                subject="Limba Română",
                class_name="Clasa a 12-a A",
                type="PDF",
                size="1.2 MB",
                icon="📚",
            ),
            Material(
                id=str(uuid.uuid4()),
                name="Laborator Fizică - Legile lui Kirchhoff.pdf",
                subject="Fizică",
                class_name="Clasa a 11-a A",
                type="PDF",
                size="520 KB",
                icon="⚡",
            ),
        ])

    db.commit()
