import os
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

if any(name in sys.modules for name in ("app.config", "app.database", "app.main")):
    raise RuntimeError("API tests must configure their temporary database before importing the app")

temp_dir = tempfile.TemporaryDirectory()
try:
    with patch.dict(os.environ, {
        "APP_ENV": "development",
        "SEED_DEMO_DATA": "true",
        "DATABASE_URL": f"sqlite:///{(Path(temp_dir.name) / 'test.db').as_posix()}",
    }):
        from app.main import app
        from app.database import engine
except BaseException:
    temp_dir.cleanup()
    raise


def tearDownModule():
    engine.dispose()
    temp_dir.cleanup()


class TestEduPriorityAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Trigger lifespan
        cls.client.__enter__()
        cls.addClassCleanup(cls.client.__exit__, None, None, None)
        accounts = (
            ("student", "alex.radu@edupriority.ro", "Student123!"),
            ("other_student", "maria.stan@edupriority.ro", "Student123!"),
            ("teacher", "prof.popescu@edupriority.ro", "Profesor123!"),
            ("other_teacher", "prof.ionescu@edupriority.ro", "Profesor123!"),
        )
        cls.users = {}
        cls.headers = {}
        for key, email, password in accounts:
            role = "student" if "student" in key else "teacher"
            response = cls.client.post("/api/auth/login", json={
                "email": email, "password": password, "role": role,
            })
            if response.status_code != 200:
                raise AssertionError(f"Seeded {key} login failed: {response.status_code} {response.text}")
            cls.users[key] = response.json()
            cls.headers[key] = {"Authorization": f"Bearer {cls.users[key]['access_token']}"}

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_list_teachers(self):
        response = self.client.get("/api/teachers", headers=self.headers["student"])
        self.assertEqual(response.status_code, 200)
        teachers = response.json()
        self.assertIsInstance(teachers, list)
        self.assertGreaterEqual(len(teachers), 1)
        self.assertIn("name", teachers[0])
        self.assertIn("id", teachers[0])

    def test_auth_login_seeded_teacher(self):
        response = self.client.post(
            "/api/auth/login",
            json={
                "email": "prof.popescu@edupriority.ro",
                "password": "Profesor123!",
                "role": "teacher",
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], "prof.popescu@edupriority.ro")
        self.assertEqual(data["role"], "teacher")

    def test_auth_signup_new_user(self):
        new_email = "test.elev2@edupriority.ro"
        response = self.client.post(
            "/api/auth/signup",
            json={
                "name": "Elev Test",
                "email": new_email,
                "password": "ParolaSigura123!",
                "role": "student",
            },
        )
        self.assertEqual(response.status_code, 201)

    def test_create_and_classify_request(self):
        teacher_id = self.users["teacher"]["id"]

        req_payload = {
            "student": "Elev Test",
            "type": "Întrebare",
            "deadline": date.today().isoformat(),
            "text": "Am o problemă urgentă la calculul derivatei a doua și a punctelor de inflexiune pentru funcție.",
            "teacherId": teacher_id,
        }
        res = self.client.post("/api/requests", json=req_payload, headers=self.headers["student"])
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["subject"], "Matematică")
        self.assertGreaterEqual(data["priority"], 4)
        self.assertIn("createdAt", data)
        self.assertIn("teacherId", data)
        self.assertEqual(data["teacherId"], teacher_id)
        self.assertEqual(data["student"], "Alex Radu")

        # Retrieve by id
        request_url = f"/api/requests/{data['id']}"
        get_res = self.client.get(request_url, headers=self.headers["student"])
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["id"], data["id"])
        for key in ("student", "teacher", "other_student", "other_teacher"):
            with self.subTest(list_user=key):
                response = self.client.get("/api/requests", headers=self.headers[key])
                self.assertEqual(response.status_code, 200)
                request_ids = {request["id"] for request in response.json()}
                if key in ("student", "teacher"):
                    self.assertIn(data["id"], request_ids)
                else:
                    self.assertNotIn(data["id"], request_ids)

        for key in ("other_student", "other_teacher"):
            with self.subTest(user=key):
                self.assertEqual(self.client.get(request_url, headers=self.headers[key]).status_code, 403)
                self.assertEqual(self.client.patch(
                    request_url, json={"status": "resolved"}, headers=self.headers[key],
                ).status_code, 403)
        self.assertEqual(self.client.patch(
            request_url, json={"status": "resolved"}, headers=self.headers["student"],
        ).status_code, 403)

        # Update status to resolved
        patch_res = self.client.patch(
            request_url, json={"status": "resolved"}, headers=self.headers["teacher"],
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["status"], "resolved")

    def test_overview_endpoint(self):
        res = self.client.get("/api/overview", headers=self.headers["teacher"])
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("urgent", data)
        self.assertIn("critical", data["urgent"])
        self.assertIn("week", data)
        self.assertIn("received", data["week"])

    def test_classes_and_schedules(self):
        classes_res = self.client.get("/api/classes", headers=self.headers["teacher"])
        self.assertEqual(classes_res.status_code, 200)
        classes = classes_res.json()
        self.assertIsInstance(classes, list)
        self.assertGreaterEqual(len(classes), 1)

        summary_res = self.client.get(f"/api/classes/{classes[0]}", headers=self.headers["teacher"])
        self.assertEqual(summary_res.status_code, 200)
        summary = summary_res.json()
        self.assertIn("totalRequests", summary)
        self.assertIn("topics", summary)

        sched_res = self.client.get(f"/api/schedules/{classes[0]}", headers=self.headers["teacher"])
        self.assertEqual(sched_res.status_code, 200)
        sched = sched_res.json()
        self.assertIn("slots", sched)
        self.assertIn("curriculum", sched)

    def test_materials(self):
        res = self.client.get("/api/materials", headers=self.headers["teacher"])
        self.assertEqual(res.status_code, 200)
        materials = res.json()
        self.assertIsInstance(materials, list)
        self.assertGreaterEqual(len(materials), 1)
        self.assertIn("className", materials[0])

    def test_export_csv(self):
        res = self.client.get("/api/export/csv", headers=self.headers["teacher"])
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/csv", res.headers["content-type"])
        self.assertIn("Scor", res.text)

    def test_protected_endpoints_reject_anonymous_access(self):
        requests = (
            ("GET", "/api/teachers", {}),
            ("GET", "/api/requests", {}),
            ("POST", "/api/requests", {"json": {
                "student": "Elev Test", "type": "Întrebare", "deadline": date.today().isoformat(),
                "text": "O întrebare", "teacherId": self.users["teacher"]["id"],
            }}),
            ("GET", "/api/requests/nonexistent", {}),
            ("PATCH", "/api/requests/nonexistent", {"json": {"status": "resolved"}}),
            ("DELETE", "/api/requests/nonexistent", {}),
            ("GET", "/api/overview", {}),
            ("GET", "/api/classes", {}),
            ("GET", "/api/classes/Clasa", {}),
            ("GET", "/api/schedules/Clasa", {}),
            ("GET", "/api/materials", {}),
            ("POST", "/api/materials", {"files": {"file": ("test.txt", b"test", "text/plain")}}),
            ("GET", "/api/materials/nonexistent/download", {}),
            ("GET", "/api/export/csv", {}),
        )
        for method, url, kwargs in requests:
            with self.subTest(method=method, url=url):
                self.assertEqual(self.client.request(method, url, **kwargs).status_code, 401)

    def test_teacher_only_endpoints_reject_students(self):
        for url in ("/api/overview", "/api/export/csv"):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url, headers=self.headers["student"]).status_code, 403)
        response = self.client.post(
            "/api/materials", headers=self.headers["student"],
            files={"file": ("test.txt", b"test", "text/plain")},
        )
        self.assertEqual(response.status_code, 403)

if __name__ == "__main__":
    unittest.main()
