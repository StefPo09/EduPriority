import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestEduPriorityAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Trigger lifespan
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_list_teachers(self):
        response = self.client.get("/api/teachers")
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
        self.assertIn(response.status_code, [201, 409])

    def test_create_and_classify_request(self):
        teachers_res = self.client.get("/api/teachers")
        teacher_id = teachers_res.json()[0]["id"]

        req_payload = {
            "student": "Elev Test",
            "type": "Întrebare",
            "deadline": "2026-10-31",
            "text": "Am o problemă urgentă la calculul derivatei a doua și a punctelor de inflexiune pentru funcție.",
            "teacherId": teacher_id,
        }
        res = self.client.post("/api/requests", json=req_payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["subject"], "Matematică")
        self.assertGreaterEqual(data["priority"], 4)
        self.assertIn("createdAt", data)
        self.assertIn("teacherId", data)
        self.assertEqual(data["teacherId"], teacher_id)

        # Retrieve by id
        get_res = self.client.get(f"/api/requests/{data['id']}")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["id"], data["id"])

        # Update status to resolved
        patch_res = self.client.patch(f"/api/requests/{data['id']}", json={"status": "resolved"})
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["status"], "resolved")

    def test_overview_endpoint(self):
        res = self.client.get("/api/overview")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("urgent", data)
        self.assertIn("critical", data["urgent"])
        self.assertIn("week", data)
        self.assertIn("received", data["week"])

    def test_classes_and_schedules(self):
        classes_res = self.client.get("/api/classes")
        self.assertEqual(classes_res.status_code, 200)
        classes = classes_res.json()
        self.assertIsInstance(classes, list)
        self.assertGreaterEqual(len(classes), 1)

        summary_res = self.client.get(f"/api/classes/{classes[0]}")
        self.assertEqual(summary_res.status_code, 200)
        summary = summary_res.json()
        self.assertIn("totalRequests", summary)
        self.assertIn("topics", summary)

        sched_res = self.client.get(f"/api/schedules/{classes[0]}")
        self.assertEqual(sched_res.status_code, 200)
        sched = sched_res.json()
        self.assertIn("slots", sched)
        self.assertIn("curriculum", sched)

    def test_materials(self):
        res = self.client.get("/api/materials")
        self.assertEqual(res.status_code, 200)
        materials = res.json()
        self.assertIsInstance(materials, list)
        self.assertGreaterEqual(len(materials), 1)
        self.assertIn("className", materials[0])

    def test_export_csv(self):
        res = self.client.get("/api/export/csv")
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/csv", res.headers["content-type"])
        self.assertIn("Scor", res.text)

if __name__ == "__main__":
    unittest.main()
