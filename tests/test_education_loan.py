"""
Unit Tests for Educational Loan Workflow & Micro Finance vs Term Loan Separation (PS #26092).
Verifies:
1. 5th Benchmark Persona (Pooja: SC Student, Higher Education)
2. Deterministic qualification for NSFDC Educational Loan Scheme
3. Current official NSFDC FAQ interest rate (6.5% p.a.) and versioned historical note
4. Official moratorium rule verification (Course duration + 1 year, or up to 6 months where repayment has started)
5. Clear separation between Micro Finance (Project Cost <= 1.40L; Max Loan <= 1.25L), Term Loan (Project Cost > 1.40L to 50L; Max Loan <= 45L), and Educational Loan (<= 40L / 90% fee)
"""
import unittest
import sys
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from starlette.testclient import TestClient
from backend.main import app

class TestEducationLoanWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_pooja_education_loan_match(self):
        """Pooja: SC Student, Female, Age 22, Higher Education course, Project cost ₹8,00,000."""
        pooja_payload = {
            "name": "Pooja",
            "category": "SC",
            "gender": "Female",
            "age": 22,
            "annual_income": 200000,
            "is_pwd": False,
            "state": "Uttar Pradesh",
            "district": "Varanasi",
            "pincode": "221002",
            "business_idea": "Pursuing M.Tech in Computer Science requiring semester fee and hostel accommodation loan.",
            "business_sector": "Education",
            "loan_purpose": "education",
            "project_cost": 800000,
            "education": "Graduate"
        }

        res = self.client.post("/api/match", json=pooja_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Must have eligible schemes
        self.assertGreater(data["eligible_count"], 0)
        matches = {s["scheme_id"]: s for s in data["matches"]}

        # Must include NSFDC Educational Loan as ELIGIBLE
        self.assertIn("nsfdc-education-loan", matches)
        edu_match = matches["nsfdc-education-loan"]
        self.assertEqual(edu_match["eligibility_status"], "ELIGIBLE")

        # Verify scheme details
        fin = edu_match["financial_summary"]
        self.assertEqual(fin["max_loan_amount"], 4000000.0)
        # Current official NSFDC FAQ interest rate is 6.5% p.a.
        self.assertEqual(fin["interest_rate_percent"], 6.5)
        self.assertEqual(edu_match["loan_category"], "Educational Loan")
        self.assertEqual(edu_match["moratorium_months"], 12)

    def test_loan_category_taxonomies(self):
        """All 34 schemes must have a valid loan_category classification."""
        res = self.client.get("/api/schemes")
        self.assertEqual(res.status_code, 200)
        schemes = res.json()
        self.assertEqual(len(schemes), 34)

        valid_categories = {"Micro Finance", "Term Loan", "Educational Loan"}
        for s in schemes:
            self.assertIn("loan_category", s)
            self.assertIn(s["loan_category"], valid_categories)
            self.assertIn("moratorium_months", s)
            self.assertIsInstance(s["moratorium_months"], int)

    def test_education_loan_calculator_with_moratorium(self):
        """Verify calculator computes EMI and returns official moratorium wording for NSFDC Educational Loan."""
        calc_payload = {
            "scheme_id": "nsfdc-education-loan",
            "project_cost": 1000000,
            "tenure_years": 8
        }
        res = self.client.post("/api/calculate", json=calc_payload)
        self.assertEqual(res.status_code, 200)
        calc_data = res.json()

        self.assertEqual(calc_data["loan_category"], "Educational Loan")
        self.assertEqual(calc_data["moratorium_months"], 12)
        self.assertIn("Course duration + 1 year, or up to 6 months where repayment has started", calc_data["moratorium_note"])
        self.assertGreater(calc_data["monthly_emi"], 0)

if __name__ == "__main__":
    unittest.main()
