import re
import unicodedata
from datetime import datetime, date, timezone
from typing import Dict, Any, Optional

SUBJECT_KEYWORDS: Dict[str, list[str]] = {
    "Matematică": [
        "derivata", "derivate", "integrala", "integrale", "functie", "functii",
        "ecuatie", "ecuatii", "matrice", "determinant", "vectori", "vector",
        "trigonometrie", "sinus", "cosinus", "tangenta", "limita", "limite",
        "polinom", "polinoame", "algebra", "geometrie", "analiza matematica",
        "progresie", "asimptota", "monotonie", "conica", "binom", "newton",
        "probabilitati", "combinatorica", "siruri", "inecuatie", "grafic"
    ],
    "Informatică": [
        "algoritm", "algoritmi", "c++", "cpp", "python", "java", "vector",
        "matrice", "graf", "grafuri", "arbore", "arbori", "recursivitate",
        "recursiv", "programare dinamica", "pointer", "pointeri", "stiva",
        "coada", "sortare", "cautare binara", "backtracking", "complexitate",
        "clasa", "obiect", "functie", "sir de caractere", "string", "compilare",
        "eroare", "debugging", "pseudocod", "subprogram", "structura de date"
    ],
    "Fizică": [
        "forta", "viteza", "acceleratie", "energie", "putere", "randament",
        "impuls", "caloric", "termodinamica", "gaz ideal", "presiune",
        "temperatura", "curent", "tensiune", "rezistenta", "circuit", "ohm",
        "kirchhoff", "inductie", "camp magnetic", "camp electric", "lentila",
        "lentile", "optica", "reflexie", "refractie", "frecare", "oscilator", "unda"
    ],
    "Limba Română": [
        "eseu", "comentariu", "caracterizare", "personaj", "bac", "bacalaureat",
        "poezie", "liric", "epic", "dramatic", "roman", "nuvela", "basm",
        "eminescu", "bacovia", "ion", "morometii", "harap alb", "baltagul",
        "caragiale", "blaga", "barbu", "arghezi", "figura de stil", "metafora",
        "subiectul al treilea", "tema si viziunea", "relatia dintre personaje"
    ],
    "Chimie": [
        "reactie", "mol", "moli", "masa moleculara", "concentratie", "solutie",
        "acid", "baza", "ph", "oxidare", "reducere", "tabel periodic", "valenta",
        "hidrocarbura", "alcan", "alchena", "alcool", "echilibru chimic", "stoechiometrie"
    ],
    "Biologie": [
        "celula", "adn", "arn", "genetica", "meioza", "mitoza", "fotosinteza",
        "respiratie", "inima", "creier", "sistem nervos", "circulator", "digestiv",
        "ecologie", "evolutie", "regn", "bacterie", "cloroplaste"
    ],
    "Istorie": [
        "razboi", "domnitor", "unire", "tratad", "revolutie", "comunism",
        "monarhie", "daci", "romani", "constitutie", "evul mediu", "moderna",
        "primul razboi", "al doilea razboi", "cuza", "stefan cel mare", "mihai viteazul"
    ],
    "Geografie": [
        "relief", "carpati", "dunare", "clima", "vegetatie", "hidrografie",
        "populatie", "resurse", "orase", "munti", "podis", "campie", "europa"
    ],
    "Limba Engleză": [
        "grammar", "tense", "present perfect", "past continuous", "conditionals",
        "essay", "vocabulary", "writing", "reading", "phrasal verb", "passive voice"
    ],
}

URGENT_KEYWORDS = [
    "urgent", "foarte urgent", "repede", "maine", "azi", "test", "teza",
    "evaluare", "nota", "bac", "restanta", "blocat", "nu inteleg nimic",
    "ajutor", "panica", "important", "recuperare", "deadline scurt"
]

def normalize_text(text: str) -> str:
    """Removes diacritics and converts to lowercase for uniform keyword matching."""
    text = text.lower()
    # Normalize unicode to decompose accents (e.g. ă -> a + combining mark)
    decomposed = unicodedata.normalize("NFKD", text)
    stripped = "".join(c for c in decomposed if not unicodedata.combining(c))
    return stripped

def classify_subject(normalized_text: str, current_subject: Optional[str] = None) -> str:
    """Detects school subject using frequency of domain-specific keywords."""
    if current_subject and current_subject != "Nespecificată":
        return current_subject

    best_subject = "Nespecificată"
    highest_count = 0

    for subject, keywords in SUBJECT_KEYWORDS.items():
        matches = 0
        for kw in keywords:
            # Word boundary regex matching
            pattern = rf"\b{re.escape(kw)}\b"
            matches += len(re.findall(pattern, normalized_text))
        if matches > highest_count:
            highest_count = matches
            best_subject = subject

    return best_subject if highest_count > 0 else "Matematică"  # default to high frequency subject if undetermined

def calculate_priority(
    normalized_text: str,
    request_type: str,
    deadline_str: str,
) -> int:
    """Calculates priority from 1 (Minim) to 5 (Critic)."""
    # 1. Base score by type
    if request_type == "Recuperare":
        score = 4
    elif request_type == "Temă":
        score = 3
    else:  # Întrebare
        score = 2

    # 2. Urgency from deadline proximity
    try:
        deadline_date = datetime.strptime(deadline_str, "%Y-%m-%d").date()
        today = date.today()
        days_diff = (deadline_date - today).days

        if days_diff <= 0:
            score += 2  # Due today or overdue!
        elif days_diff == 1:
            score += 1  # Due tomorrow
        elif days_diff > 7:
            score -= 1  # Plenty of time
    except Exception:
        pass

    # 3. Urgency from keywords
    urgent_hits = sum(1 for kw in URGENT_KEYWORDS if kw in normalized_text)
    if urgent_hits >= 2:
        score += 2
    elif urgent_hits == 1:
        score += 1

    # Clamp to [1, 5]
    return max(1, min(5, score))

def estimate_time(text: str, request_type: str, priority: int) -> str:
    """Estimates time required for teacher response."""
    length = len(text)
    if request_type == "Recuperare" or priority == 5:
        return "45 min"
    if length > 250 or priority == 4:
        return "30 min"
    if length > 100 or request_type == "Temă":
        return "20 min"
    return "15 min"

def suggest_action(subject: str, request_type: str, priority: int, deadline: str) -> str:
    """Generates an action suggestion in Romanian for the teacher."""
    if priority == 5:
        return f"Urgență critică! Verifică cererea pentru {subject} și răspunde astăzi (termen limită: {deadline})."
    if request_type == "Recuperare":
        return f"Programează o sesiune de recuperare sau consultare individuală la {subject}."
    if request_type == "Temă":
        return f"Verifică exercițiul la {subject} și oferă un indiciu sau material suplimentar."
    return f"Răspunde punctual la întrebare și recomandă fișe de lucru din biblioteca de materiale."

def summarize_text(student_name: str, subject: str, request_type: str, text: str) -> str:
    """Generates a clean Romanian AI summary."""
    snippet = text.strip().replace("\n", " ")
    if len(snippet) > 90:
        snippet = snippet[:87] + "..."
    return f"Cerere de tip {request_type} la {subject} trimisă de {student_name}: \"{snippet}\""

def analyze_student_request(
    student_name: str,
    text: str,
    request_type: str,
    deadline_str: str,
    current_subject: Optional[str] = None,
    current_priority: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Main AI classification pipeline for student requests.
    Computes subject, priority score (1-5), estimated resolution time,
    suggested action, and summary.
    """
    normalized = normalize_text(text)
    detected_subject = classify_subject(normalized, current_subject)
    
    if current_priority and current_priority != 3:
        computed_priority = current_priority
    else:
        computed_priority = calculate_priority(normalized, request_type, deadline_str)

    est_time = estimate_time(text, request_type, computed_priority)
    action = suggest_action(detected_subject, request_type, computed_priority, deadline_str)
    summary = summarize_text(student_name, detected_subject, request_type, text)

    return {
        "subject": detected_subject,
        "priority": computed_priority,
        "estimated_time": est_time,
        "suggested_action": action,
        "ai_summary": summary,
    }
