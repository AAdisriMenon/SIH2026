"""
Unit Tests for Deterministic Rules Engine (MoSJE SIH 2026).
Verifies:
1. Persona 1: Rekha (OBC Woman, Tailoring)
2. Persona 2: Suresh (SC Male, Workshop)
3. Persona 3: Imran (Minority Male, Artisan)
4. Persona 4: Anita (PwD Woman, Home Crafts)
5. Strict Affirmative Caste/Category Isolation
6. Boundary Buffer (Borderline) Logic
7. Zero-Hallucination Explainability Audit Trail
"""
import unittest
from backend.models import UserProfile
from backend.rules_engine import evaluate_scheme
from backend.storage import SchemeStorage

class TestRulesEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.storage = SchemeStorage()
        cls.schemes = cls.storage.get_all()
        cls.schemes_by_id = {s["id"]: s for s in cls.schemes}

    def test_persona_rekha(self):
        """Rekha: OBC, Female, Tailoring, ₹1.5L income, ₹1.5L project cost."""
        rekha = UserProfile(
            name="Rekha", category="OBC", gender="Female", age=34,
            annual_income=150000, is_pwd=False,
            business_idea="Tailoring boutique and garments stitching",
            business_sector="Tailoring/Garments", project_cost=150000, education="Class 8"
        )
        
        # New Swarnima is specifically for OBC Women
        swarnima = self.schemes_by_id.get("nbcfdc-new-swarnima")
        self.assertIsNotNone(swarnima)
        status, verdicts, guidance = evaluate_scheme(rekha, swarnima)
        self.assertEqual(status, "ELIGIBLE", "Rekha must be ELIGIBLE for New Swarnima Scheme")

        # PMEGP is open to OBC and Women
        pmegp = self.schemes_by_id.get("pmegp-scheme")
        status, _, _ = evaluate_scheme(rekha, pmegp)
        self.assertEqual(status, "ELIGIBLE", "Rekha must be ELIGIBLE for PMEGP")

        # Mudra Kishore allows ₹1.5L loan
        mudra = self.schemes_by_id.get("mudra-kishore")
        status, _, _ = evaluate_scheme(rekha, mudra)
        self.assertEqual(status, "ELIGIBLE", "Rekha must be ELIGIBLE for Mudra Kishore")

        # NSFDC Term Loan requires SC category -> Rekha is OBC so must be INELIGIBLE
        nsfdc = self.schemes_by_id.get("nsfdc-term-loan")
        status, verdicts, _ = evaluate_scheme(rekha, nsfdc)
        self.assertEqual(status, "INELIGIBLE", "Rekha (OBC) must be INELIGIBLE for NSFDC (SC)")
        cat_verdict = next(v for v in verdicts if v.criterion == "Social Category")
        self.assertEqual(cat_verdict.status, "FAIL")

    def test_persona_suresh(self):
        """Suresh: SC, Male, Workshop, ₹2.5L income, ₹5.0L project cost."""
        suresh = UserProfile(
            name="Suresh", category="SC", gender="Male", age=41,
            annual_income=250000, is_pwd=False,
            business_idea="Automobile workshop and fabrication setup",
            business_sector="Manufacturing", project_cost=500000, education="Class 10"
        )

        # NSFDC Term Loan
        nsfdc = self.schemes_by_id.get("nsfdc-term-loan")
        status, _, _ = evaluate_scheme(suresh, nsfdc)
        self.assertEqual(status, "ELIGIBLE", "Suresh must be ELIGIBLE for NSFDC Term Loan")

        # Green Business Scheme
        gbs = self.schemes_by_id.get("nsfdc-green-business")
        status, _, _ = evaluate_scheme(suresh, gbs)
        self.assertEqual(status, "ELIGIBLE", "Suresh must be ELIGIBLE for Green Business Scheme")

        # NBCFDC New Swarnima is for OBC Women -> Suresh (SC Male) must be INELIGIBLE
        swarnima = self.schemes_by_id.get("nbcfdc-new-swarnima")
        status, verdicts, _ = evaluate_scheme(suresh, swarnima)
        self.assertEqual(status, "INELIGIBLE", "Suresh must be INELIGIBLE for New Swarnima")

    def test_persona_imran(self):
        """Imran: Minority, Male, Artisan, ₹1.8L income, ₹1.5L project cost."""
        imran = UserProfile(
            name="Imran", category="Minority", gender="Male", age=29,
            annual_income=180000, is_pwd=False,
            business_idea="Brass handicraft artisan workshop",
            business_sector="Artisans/Handicrafts", project_cost=150000, education="Class 8"
        )

        # NMDFC Virasat Scheme for Artisans
        virasat = self.schemes_by_id.get("nmdfc-virasat")
        status, _, _ = evaluate_scheme(imran, virasat)
        self.assertEqual(status, "ELIGIBLE", "Imran must be ELIGIBLE for NMDFC Virasat")

        # NMDFC Credit Line 1
        line1 = self.schemes_by_id.get("nmdfc-term-loan-line1")
        status, _, _ = evaluate_scheme(imran, line1)
        self.assertEqual(status, "ELIGIBLE", "Imran must be ELIGIBLE for NMDFC Credit Line 1")

        # PM Vishwakarma for traditional artisans
        vishwa = self.schemes_by_id.get("pm-vishwakarma")
        status, _, _ = evaluate_scheme(imran, vishwa)
        self.assertEqual(status, "ELIGIBLE", "Imran must be ELIGIBLE for PM Vishwakarma")

    def test_persona_anita(self):
        """Anita: PwD (50%), Female, Home Crafts, ₹1.0L income, ₹70,000 project cost."""
        anita = UserProfile(
            name="Anita", category="General", gender="Female", age=26,
            annual_income=100000, is_pwd=True, pwd_percent=50,
            business_idea="Home based crafts and kiosk",
            business_sector="Artisans/Handicrafts", project_cost=70000, education="Class 10"
        )

        # NHFDC Micro Credit for PwD (up to ₹75k)
        micro = self.schemes_by_id.get("nhfdc-micro-credit")
        status, _, _ = evaluate_scheme(anita, micro)
        self.assertEqual(status, "ELIGIBLE", "Anita must be ELIGIBLE for NHFDC Micro Credit")

        # Non-PwD person testing NHFDC Micro Credit -> MUST FAIL
        non_pwd_user = UserProfile(
            name="Ravi", category="General", gender="Male", age=26,
            annual_income=100000, is_pwd=False,
            business_idea="Kiosk", business_sector="Trading", project_cost=70000
        )
        status_non, verdicts_non, _ = evaluate_scheme(non_pwd_user, micro)
        self.assertEqual(status_non, "INELIGIBLE", "Non-PwD applicant must be INELIGIBLE for NHFDC")
        pwd_verdict = next(v for v in verdicts_non if v.criterion == "Disability (Divyangjan)")
        self.assertEqual(pwd_verdict.status, "FAIL")

    def test_persona_pooja(self):
        """Pooja: SC Student, Female, Age 22, ₹2.0L income, Higher Education, ₹8.0L cost."""
        pooja = UserProfile(
            name="Pooja", category="SC", gender="Female", age=22,
            annual_income=200000, is_pwd=False,
            business_idea="Pursuing M.Tech in Computer Science requiring semester fees and hostel accommodation.",
            business_sector="Education", loan_purpose="education",
            project_cost=800000, education="Graduate"
        )
        edu_scheme = self.schemes_by_id.get("nsfdc-education-loan")
        status, verdicts, _ = evaluate_scheme(pooja, edu_scheme)
        self.assertEqual(status, "ELIGIBLE", "Pooja must be ELIGIBLE for NSFDC Educational Loan")

    def test_income_boundary_borderline(self):
        """Testing borderline buffer: income within 15% over ceiling becomes BORDERLINE."""
        # Current official NSFDC family income ceiling is ₹5,00,000.
        # An applicant with ₹5,30,000 is 6.0% over -> must be BORDERLINE, not hard FAIL.
        applicant = UserProfile(
            name="BorderlineUser", category="SC", gender="Male", age=30,
            annual_income=530000, is_pwd=False,
            business_idea="Small retail shop", business_sector="Trading",
            project_cost=200000, education="Class 10"
        )
        lvy = self.schemes_by_id.get("nsfdc-lvy")
        status, verdicts, guidance = evaluate_scheme(applicant, lvy)
        self.assertEqual(status, "BORDERLINE", "Income within 15% buffer must be BORDERLINE")
        self.assertTrue(len(guidance) > 0, "Borderline guidance must be generated")

    def test_explainability_clause_completeness(self):
        """FR5: Every single rule evaluation returns a structured audit trail."""
        rekha = UserProfile(
            name="Rekha", category="OBC", gender="Female", age=34,
            annual_income=150000, is_pwd=False,
            business_idea="Tailoring", business_sector="Tailoring/Garments",
            project_cost=150000, education="Class 8"
        )
        swarnima = self.schemes_by_id.get("nbcfdc-new-swarnima")
        _, verdicts, _ = evaluate_scheme(rekha, swarnima)
        
        criteria_names = [v.criterion for v in verdicts]
        self.assertIn("Social Category", criteria_names)
        self.assertIn("Gender", criteria_names)
        self.assertIn("Annual Family Income", criteria_names)
        self.assertIn("Age Criteria", criteria_names)
        self.assertIn("Project Cost Band", criteria_names)
        self.assertIn("Business Sector", criteria_names)
        self.assertIn("Minimum Education", criteria_names)

        for v in verdicts:
            self.assertIn(v.status, ["PASS", "BORDERLINE", "FAIL"])
            self.assertTrue(len(v.reason) > 5, "Clause explanation reason must be informative")

if __name__ == "__main__":
    unittest.main()
