# EduPriority Backend (Python & FastAPI)

Backend-ul complet în Python pentru platforma **EduPriority**, dezvoltat cu **FastAPI**, **SQLAlchemy** și **SQLite**, integrat cu un motor inteligent de clasificare și prioritizare AI a cererilor elevilor.

---

## 🚀 Caracteristici principale

1. **Clasificare și Prioritizare AI a Cererilor ("Clasifică cu AI")**:
   - Detectare automată a materiei pe baza vocabularului educațional specific în limba română (Matematică, Informatică, Fizică, Limba Română, Chimie, Biologie, Istorie, Geografie, Limba Engleză).
   - Calcul dinamic al scorului de prioritate de la **1 la 5** (1: Minim, 2: Scăzută, 3: Medie, 4: Ridicată, 5: Critic) în funcție de apropierea deadline-ului, tipul cererii (Recuperare, Temă, Întrebare) și cuvinte-cheie de urgență ("urgent", "test mâine", "nu înțeleg", "blocat", "restanță").
   - Estimare timp de rezolvare (ex. "15 min", "30 min", "45 min") și sugestie practică de acțiune pentru profesor.
   - Rezumat automat al cererii.

2. **Autentificare și Management Roluri**:
   - Înregistrare și autentificare securizată cu hashing `scrypt` compatibil.
   - Roluri distincte: `teacher` (profesor) și `student` (elev).
   - Endpoint pentru selectarea profesorului disponibil (`/api/teachers`).

3. **Dashboard & Statistici Urgență**:
   - Centralizare cereri urgente pentru ziua curentă: critice (scor 5), medii (scor 3), scăzute (scor 1-2).
   - Statistici săptămânale: cereri primite, cereri rezolvate, minute economisite de profesori, procent de variație.

4. **Clase, Orare & Programă**:
   - Sumar clasă cu rată de rezolvare, timp mediu și topul temelor solicitate.
   - Orar pe intervale orare și zile (Luni–Vineri) pe clase.
   - Urmărire stadiu programă școlară (Finalizat, În desfășurare, Planificat).

5. **Management Materiale Didactice**:
   - Încărcare fișiere (PDF, cod sursă C++, foi de calcul, documente) cu stocare pe disc în folderul `uploads/`.
   - Listare și descărcare fișiere cu identificare automată a tipului și pictogramei.

6. **Export & Raportare**:
   - Export în format CSV (`/api/export/csv`) cu antete complete și codificare UTF-8 BOM pentru deschidere impecabilă în Microsoft Excel.

---

## 📂 Structura proiectului

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py              # Setări aplicație, căi, CORS, chei secrete
│   ├── database.py            # Conexiune SQLite & sesiune SQLAlchemy
│   ├── main.py                # Punctul de intrare FastAPI, lifespan & middleware CORS
│   ├── models/                # Modele de date SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py            # Utilizatori (profesori/elevi) & hash parole
│   │   ├── request.py         # Cereri elevi, scor prioritate, detalii AI
│   │   ├── material.py        # Materiale didactice
│   │   └── school_class.py    # Clase, sloturi orar, programă școlară
│   ├── schemas/               # Scheme de validare Pydantic v2
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── request.py
│   │   ├── material.py
│   │   ├── class_schedule.py
│   │   └── overview.py
│   ├── services/              # Logica de business & inteligență artificială
│   │   ├── __init__.py
│   │   ├── ai_classifier.py   # Motorul de clasificare & prioritizare în limba română
│   │   └── seed_data.py       # Populare inițială cu date realiste (utilizatori, cereri, orare)
│   └── routers/               # Endpoint-uri API REST
│       ├── __init__.py
│       ├── auth.py            # /api/auth/signup, /api/auth/login
│       ├── teachers.py        # /api/teachers
│       ├── requests.py        # /api/requests (CRUD, prioritizare)
│       ├── overview.py        # /api/overview
│       ├── classes.py         # /api/classes, /api/classes/{className}
│       ├── schedules.py       # /api/schedules/{className}
│       ├── materials.py       # /api/materials (upload & download)
│       └── export.py          # /api/export/csv
├── tests/
│   ├── __init__.py
│   └── test_api.py            # Teste automate complete
├── uploads/                   # Fișiere încărcate
├── requirements.txt           # Dependențe Python
├── run.py                     # Script simplu de pornire
└── edupriority.db             # Baza de date SQLite (creată automat)
```

---

## 🛠️ Instalare și Rulare

### 1. Instalare dependențe
Din folderul `backend`, creează și activează mediul virtual:
```bash
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate
python -m pip install -r requirements.txt
```

### 2. Pornirea serverului backend
Din folderul `backend`:
```bash
# Activează mai întâi mediul virtual conform pașilor de mai sus.
python run.py
# Alternativ, cu uvicorn:
uvicorn app.main:app --host 0.0.0.0 --reload --port 8000
```
Serverul va asculta pe toate interfețele de rețea, portul **`8000`**. Local îl poți accesa la **`http://127.0.0.1:8000`**, iar de pe alt dispozitiv din aceeași rețea la **`http://IP-ul-calculatorului:8000`**.

### 3. Documentație interactivă Swagger UI
Odată pornit serverul, deschide în browser:
- Swagger UI: **`http://127.0.0.1:8000/docs`**
- ReDoc: **`http://127.0.0.1:8000/redoc`**

Pentru acces din rețeaua locală, folosește adresa IPv4 a calculatorului gazdă (o poți afla cu `ipconfig` pe Windows) și permite portul `8000` în Windows Firewall pentru profilul de rețea privată. CORS acceptă automat origin-uri localhost și adrese IPv4 private; poți suprascrie lista explicită cu variabila `CORS_ORIGINS`, separată prin virgule.

---

## 🧪 Rulare teste automate
Din folderul `backend`:
```bash
python -m unittest tests/test_api.py
```
Toate testele verifică autentificarea, calculul priorității AI, încărcarea materialelor, generarea orarelor și exportul CSV.

---

## 👤 Conturi pre-populate pentru testare rapidă

La prima pornire, baza de date este inițializată automat cu următoarele conturi:

| Nume | Email | Parolă | Rol |
| :--- | :--- | :--- | :--- |
| **Prof. Mihai Popescu** | `prof.popescu@edupriority.ro` | `Profesor123!` | Profesor |
| **Prof. Elena Ionescu** | `prof.ionescu@edupriority.ro` | `Profesor123!` | Profesor |
| **Alex Radu** | `alex.radu@edupriority.ro` | `Student123!` | Elev |
| **Maria Stan** | `maria.stan@edupriority.ro` | `Student123!` | Elev |
