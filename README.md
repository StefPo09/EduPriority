# EduPriority

Platformă educațională inteligentă pentru prioritizarea și organizarea solicitărilor elevilor către profesori (întrebări, teme, recuperări), folosind clasificare automată asistată de AI.

---

## 🎯 Ideea de bază (Core Concept)

Profesorii sunt adesea asaltați de numeroase mesaje, solicitări de recuperare și întrebări nestructurate de la elevi pe platforme diverse. Fără un sistem dedicat de triere și prioritizare, întrebările urgente înainte de teste sau recuperările cu termen limită critic riscă să se piardă, iar timpul profesorilor este irosit cu trierea manuală.

**EduPriority** rezolvă această problemă:
1. **Punct unic de contact elev-profesor**: Elevii trimit întrebări, teme sau solicitări de recuperare specificând profesorul și data limită (deadline).
2. **Prioritizare și clasificare AI**: Fiecare cerere este analizată automat în limba română pentru detectarea materiei (Matematică, Informatică, Fizică, Română etc.), calculul scorului de urgență de la **1 (Minim) la 5 (Critic)**, estimarea timpului de rezolvare și generarea unei acțiuni recomandate pentru profesor.
3. **Tablou de bord & Gestionare urgențe**: Profesorul vede direct ce este critic astăzi, cererile ordonate după prioritate, calendarul termenelor limită, orarul claselor și materialele didactice încărcate.
4. **Analiză & Export**: Statistici despre timpul economisit, rata de rezolvare și posibilitatea de a exporta lista completă în format CSV/print.

---

## 📁 Structura proiectului

- **`frontend/`**: Aplicație web Next.js 16 + React 19 + TailwindCSS v4 + React Router.
- **`backend/`**: Serviciu API REST complet în Python (FastAPI + SQLAlchemy + SQLite + motor de clasificare AI).

---

## 🚀 Pornirea aplicației

### 1. Pornire Backend (Python)
Deschide un terminal în folderul `backend`:
```bash
cd backend
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate
python -m pip install -r requirements.txt
python run.py
```
Backend-ul va porni la adresa: **`http://127.0.0.1:8000`**
- Documentație Swagger UI: **`http://127.0.0.1:8000/docs`**

### 2. Pornire Frontend (Next.js)
Într-un alt terminal, în folderul `frontend`:
```bash
cd frontend
npm install
npm run dev
```
Aplicația va fi accesibilă în browser la: **`http://localhost:3000`**

### Acces din rețeaua locală
Atât frontend-ul, cât și backend-ul ascultă pe toate interfețele de rețea. Conectează dispozitivele la aceeași rețea Wi-Fi/LAN și deschide pe dispozitivul client:

```text
http://IP-ul-calculatorului:3000
```

Pe Windows, află adresa IPv4 a calculatorului cu `ipconfig` (adresa adaptorului Wi-Fi/Ethernet, de obicei în intervalul `192.168.x.x`). Pornește backend-ul și frontend-ul în terminale separate, pe calculatorul care găzduiește aplicația. Dacă Windows Firewall solicită permisiunea, permite accesul pe rețeaua privată pentru portul `3000` (frontend) și `8000` (backend). Frontend-ul folosește backend-ul de pe același calculator; pentru altă topologie setează `BACKEND_URL` către adresa backend-ului.

### Instalare ca aplicație (PWA)
Aplicația poate fi instalată din meniul browserului pe dispozitive compatibile și păstrează interfața de bază disponibilă offline. Instalarea și service worker-ul necesită HTTPS (cu excepția `localhost`); accesul printr-un IP local HTTP poate fi folosit în rețea, dar nu permite instalarea PWA. Datele și operațiile aplicației necesită în continuare o conexiune la backend.

---

## 👤 Conturi implicite pentru testare

Baza de date este pre-populată cu date de test:
- **Profesor:** `prof.popescu@edupriority.ro` / `Profesor123!`
- **Elev:** `alex.radu@edupriority.ro` / `Student123!`
