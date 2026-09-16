"""
Integration Tests for FastAPI Backend Endpoints (MoSJE SIH 2026).
Verifies:
1. POST /api/match (Profile matching & ranking)
2. GET /api/schemes & GET /api/schemes/{id}
3. POST /api/calculate (Live financial calculator)
4. POST /api/assistant/chat (RAG Q&A)
5. GET / PUT /api/admin/schemes (Dynamic rule modification)
6. GET /api/admin/analytics (Anonymized analytics)
"""
import unittest
from starlette.testclient import TestClient
from backend.main import app

class TestAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_match_endpoint(self):
        """Test profile matching against all schemes."""
        payload = {
            "name": "Rekha",
            "category": "OBC",
            "gender": "Female",
            "age": 34,
            "annual_income": 150000,
            "is_pwd": False,
            "state": "All",
            "business_idea": "Tailoring and boutique business",
            "business_sector": "Tailoring/Garments",
            "project_cost": 150000,
            "education": "Class 8"
        }
        res = self.client.post("/api/match", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("eligible_count", data)
        self.assertTrue(data["eligible_count"] > 0)
        self.assertTrue(len(data["matches"]) > 0)
        
        # Verify first matched item structure
        first = data["matches"][0]
        self.assertIn("scheme_id", first)
        self.assertIn("verdicts", first)
        self.assertIn("semantic_score", first)

    def test_get_schemes(self):
        """Test scheme catalogue endpoints."""
        res = self.client.get("/api/schemes")
        self.assertEqual(res.status_code, 200)
        schemes = res.json()
        self.assertGreaterEqual(len(schemes), 20)

        # Detail endpoint
        first_id = schemes[0]["id"]
        res_detail = self.client.get(f"/api/schemes/{first_id}")
        self.assertEqual(res_detail.status_code, 200)
        self.assertEqual(res_detail.json()["id"], first_id)

    def test_general_benefits_endpoint(self):
        """Test general benefits tier 2 discovery catalogue."""
        res = self.client.get("/api/general-benefits")
        self.assertEqual(res.status_code, 200)
        benefits = res.json()
        self.assertEqual(len(benefits), 41)
        
        # Test category filter
        res_agri = self.client.get("/api/general-benefits?category=Agriculture")
        self.assertEqual(res_agri.status_code, 200)
        agri_list = res_agri.json()
        self.assertTrue(len(agri_list) > 0)


    def test_calculate_endpoint(self):
        """Test live financial calculation endpoint."""
        payload = {
            "project_cost": 200000,
            "scheme_id": "nbcfdc-new-swarnima",
            "tenure_years": 5
        }
        res = self.client.post("/api/calculate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["project_cost"], 200000)
        self.assertTrue(data["monthly_emi"] > 0)
        self.assertTrue(len(data["yearly_schedule"]) == 5)

    def test_chat_endpoint(self):
        """Test conversational RAG assistant endpoint."""
        payload = {
            "question": "What is the interest rate for Mahila Samriddhi Yojana?",
            "scheme_id": "nsfdc-msy"
        }
        res = self.client.post("/api/assistant/chat", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["grounded"])
        self.assertTrue("4.0%" in data["answer"] or "4%" in data["answer"])

    def test_admin_and_analytics_endpoints(self):
        """Test admin CRUD and analytics endpoints."""
        res_analytics = self.client.get("/api/admin/analytics")
        self.assertEqual(res_analytics.status_code, 200)
        self.assertIn("total_schemes_configured", res_analytics.json())

        # Update a scheme rule dynamically
        res_update = self.client.put("/api/admin/schemes/nsfdc-mcf", json={
            "income_ceiling": 350000,
            "interest_rate_percent": 4.5,
            "verified_by": "Senior Test Auditor"
        })
        self.assertEqual(res_update.status_code, 200)
        updated_scheme = res_update.json()["scheme"]
        self.assertEqual(updated_scheme["rules"]["income_ceiling"], 350000)
        self.assertEqual(updated_scheme["financials"]["interest_rate_percent"], 4.5)

if __name__ == "__main__":
    unittest.main()
