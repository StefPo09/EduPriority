import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import unittest


BACKEND_DIR = Path(__file__).resolve().parent.parent
PRODUCTION_SECRET = "v5qNF2Z6k9P8T3yB4mQ7rL0cX1hD6wSa"
PRODUCTION_ORIGIN = "https://school.example.com"


class TestDeploymentConfig(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.database_path = Path(self.temp_dir.name) / "test.db"

    def run_python(self, script, **variables):
        env = os.environ.copy()
        for name in ("APP_ENV", "SECRET_KEY", "CORS_ORIGINS", "SEED_DEMO_DATA", "DATABASE_URL"):
            env.pop(name, None)
        env.update({"DATABASE_URL": f"sqlite:///{self.database_path.as_posix()}", **variables})
        return subprocess.run(
            [sys.executable, "-c", script],
            cwd=BACKEND_DIR,
            env=env,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=60,
        )

    def test_production_rejects_missing_and_weak_secrets_without_disclosure(self):
        secrets = [None, "", "short-secret", "edupriority-super-secret-key-2026",
                   "edupriority-super-secret-key-2026-extra", "a" * 32,
                   "changeme" * 4, "abcd" * 8, "12345678901234567890123456789012",
                   "default-very-weak-secret-for-production", "change-this-production-secret-key-now"]
        for secret in secrets:
            with self.subTest(secret=secret):
                variables = {"APP_ENV": "production", "CORS_ORIGINS": PRODUCTION_ORIGIN}
                if secret is not None:
                    variables["SECRET_KEY"] = secret
                result = self.run_python("import app.main", **variables)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("SECRET_KEY", result.stderr)
                if secret:
                    self.assertNotIn(secret, result.stderr + result.stdout)
                self.assertFalse(self.database_path.exists())

    def test_production_requires_explicit_valid_origins(self):
        for origins in (None, "", "  ", ",", "*", "https://*.example.com", "https://example.com/path",
                        "https://example.com,", "https://user@example.com", "https://example.com:99999"):
            with self.subTest(origins=origins):
                variables = {"APP_ENV": "production", "SECRET_KEY": PRODUCTION_SECRET}
                if origins is not None:
                    variables["CORS_ORIGINS"] = origins
                result = self.run_python("import app.main", **variables)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("CORS_ORIGINS", result.stderr)
                self.assertFalse(self.database_path.exists())

    def test_invalid_environment_and_development_seed_settings_fail(self):
        for variables, error in (({"APP_ENV": "prod"}, "APP_ENV"),
                                 ({"SEED_DEMO_DATA": "sometimes"}, "SEED_DEMO_DATA")):
            with self.subTest(variables=variables):
                result = self.run_python("import app.config", **variables)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(error, result.stderr)

    def run_application(self, **variables):
        result = self.run_python(
            """
import json
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User

with TestClient(app) as client:
    with SessionLocal() as db:
        count = db.query(User).count()
    origins = ['https://school.example.com', 'http://192.168.1.5:3000', 'https://evil.example.com']
    headers = {origin: client.get('/api/health', headers={'Origin': origin}).headers.get('access-control-allow-origin') for origin in origins}
print(json.dumps({'count': count, 'cors': headers}))
""",
            **variables,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout.strip().splitlines()[-1])

    def test_development_defaults_seed_and_allow_lan(self):
        data = self.run_application()
        self.assertGreater(data["count"], 0)
        self.assertEqual(data["cors"]["http://192.168.1.5:3000"], "http://192.168.1.5:3000")
        self.assertIsNone(data["cors"]["https://evil.example.com"])

    def test_development_seed_can_be_disabled_and_reenabled(self):
        data = self.run_application(SEED_DEMO_DATA="false")
        self.assertEqual(data["count"], 0)
        data = self.run_application(SEED_DEMO_DATA="true")
        self.assertGreater(data["count"], 0)

    def test_production_never_seeds_and_only_allows_explicit_origins(self):
        data = self.run_application(
            APP_ENV="production", SECRET_KEY=PRODUCTION_SECRET,
            CORS_ORIGINS=PRODUCTION_ORIGIN, SEED_DEMO_DATA="true",
        )
        self.assertEqual(data["count"], 0)
        self.assertEqual(data["cors"][PRODUCTION_ORIGIN], PRODUCTION_ORIGIN)
        self.assertIsNone(data["cors"]["http://192.168.1.5:3000"])
        self.assertIsNone(data["cors"]["https://evil.example.com"])

    def test_production_preflight_allows_only_listed_origins(self):
        result = self.run_python(
            """
import json
from fastapi.testclient import TestClient
from app.main import app
with TestClient(app) as client:
    origins = ['https://school.example.com', 'https://admin.example.com:8443', 'http://192.168.1.5:3000']
    responses = {origin: client.options('/api/health', headers={'Origin': origin, 'Access-Control-Request-Method': 'GET'}).status_code for origin in origins}
print(json.dumps(responses))
""",
            APP_ENV="production", SECRET_KEY=PRODUCTION_SECRET,
            CORS_ORIGINS=f"{PRODUCTION_ORIGIN}, https://admin.example.com:8443",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        responses = json.loads(result.stdout.strip().splitlines()[-1])
        self.assertEqual(responses[PRODUCTION_ORIGIN], 200)
        self.assertEqual(responses["https://admin.example.com:8443"], 200)
        self.assertEqual(responses["http://192.168.1.5:3000"], 400)

    def test_production_still_applies_existing_schema_alterations(self):
        with sqlite3.connect(self.database_path) as db:
            db.execute("CREATE TABLE users (id VARCHAR(36) PRIMARY KEY)")
        result = self.run_python(
            """
from fastapi.testclient import TestClient
from app.main import app
with TestClient(app) as client:
    assert client.get('/api/health').status_code == 200
""",
            APP_ENV="production", SECRET_KEY=PRODUCTION_SECRET, CORS_ORIGINS=PRODUCTION_ORIGIN,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        with sqlite3.connect(self.database_path) as db:
            columns = {row[1] for row in db.execute("PRAGMA table_info(users)")}
        self.assertTrue({"subjects_json", "class_name"}.issubset(columns))


if __name__ == "__main__":
    unittest.main()