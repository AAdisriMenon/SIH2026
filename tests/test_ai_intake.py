"""
Stage 2 Test Suite: Natural-Language Intake & Intent Classification (MoSJE SIH 2026).
Verifies:
1. Extraction of structured attributes from natural language (Zero-Authority AI).
2. Detection of missing critical matching fields (no hallucinated defaults).
3. Ambiguity handling and uncertain fields capture.
4. Intent classification (Micro Finance, Term Loan, Educational Loan, Partner Info, Scheme Info).
5. Deterministic fallback resilience when AI provider fails or is offline.
6. Provider-agnostic abstraction and pluggability.
7. Pydantic validation and FastAPI endpoint integration.
"""
import unittest
from starlette.testclient import TestClient

from backend.main import app
from backend.models import (
    ProfileExtractionRequest,
    ProfileExtractionResponse,
    ExtractedProfileData
)
from backend.nlu_service import (
    NLUService,
    BaseNLUProvider,
    DeterministicRuleBasedNLUProvider,
    CRITICAL_MATCHING_FIELDS
)


class MockFailingProvider(BaseNLUProvider):
    """Simulates a network timeout or upstream API exception."""
    def extract_profile(self, query: str) -> ProfileExtractionResponse:
        raise ConnectionError("Simulated LLM API Gateway 504 Timeout")

    def get_provider_name(self) -> str:
        return "MockFailingProvider"

    def is_available(self) -> bool:
        return True


class MockCustomProvider(BaseNLUProvider):
    """Simulates an open-source Hugging Face model adapter."""
    def extract_profile(self, query: str) -> ProfileExtractionResponse:
        return ProfileExtractionResponse(
            extracted_profile=ExtractedProfileData(
                gender="Female",
                social_category="SC",
                state="Karnataka",
                annual_income=250000.0,
                project_cost=300000.0,
                sector="Tailoring/Garments"
            ),
            detected_intent="term_loan",
            confidence_score=0.95,
            summary_interpretation="Mock extracted profile",
            missing_critical_fields=[],
            uncertain_fields=[],
            ready_for_matching=True,
            provider_used="MockCustomProvider"
        )

    def get_provider_name(self) -> str:
        return "MockCustomProvider"

    def is_available(self) -> bool:
        return True


class TestAIIntakeAndIntent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.nlu = NLUService.get_instance()

    def test_01_complete_profile_extraction(self):
        """Test extraction from a rich, explicit natural-language prompt."""
        query = (
            "I am an SC woman from Karnataka earning ₹2.5 lakh per year. "
            "I want to start a ₹3 lakh tailoring business from home."
        )
        res = self.nlu.extract_profile(query)
        self.assertIsInstance(res, ProfileExtractionResponse)
        self.assertEqual(res.extracted_profile.social_category, "SC")
        self.assertEqual(res.extracted_profile.gender, "Female")
        self.assertEqual(res.extracted_profile.state, "Karnataka")
        self.assertEqual(res.extracted_profile.annual_income, 250000.0)
        self.assertEqual(res.extracted_profile.project_cost, 300000.0)
        self.assertIn("Tailoring", res.extracted_profile.sector)
        self.assertEqual(res.missing_critical_fields, [])
        self.assertTrue(res.ready_for_matching)
        self.assertGreaterEqual(res.confidence_score, 0.8)

    def test_02_missing_income_detection(self):
        """When annual income is omitted, it must be None and flagged in missing_critical_fields."""
        query = "I am an SC woman from Karnataka wanting to start a tailoring business with ₹3 lakh project cost."
        res = self.nlu.extract_profile(query)
        self.assertIsNone(res.extracted_profile.annual_income)
        self.assertIn("annual_income", res.missing_critical_fields)
        self.assertFalse(res.ready_for_matching)

    def test_03_missing_social_category_detection(self):
        """When social category is omitted, it must NOT be guessed as SC or OBC."""
        query = "I am a 28-year-old woman from Kerala earning ₹1.5 lakh seeking ₹50,000 for poultry."
        res = self.nlu.extract_profile(query)
        self.assertIsNone(res.extracted_profile.social_category)
        self.assertIn("social_category", res.missing_critical_fields)
        self.assertFalse(res.ready_for_matching)

    def test_04_missing_state_detection(self):
        """When state is omitted, it must be None and flagged in missing_critical_fields."""
        query = "I am an OBC male artisan earning ₹1.2 lakh seeking ₹1 lakh micro finance."
        res = self.nlu.extract_profile(query)
        self.assertIsNone(res.extracted_profile.state)
        self.assertIn("state", res.missing_critical_fields)
        self.assertFalse(res.ready_for_matching)

    def test_05_missing_project_cost_detection(self):
        """When project cost is omitted, it must be None and flagged in missing_critical_fields."""
        query = "I am an SC woman from Tamil Nadu earning ₹80,000 per year looking for financial assistance."
        res = self.nlu.extract_profile(query)
        self.assertIsNone(res.extracted_profile.project_cost)
        self.assertIn("project_cost", res.missing_critical_fields)
        self.assertFalse(res.ready_for_matching)

    def test_06_ambiguous_demographics_captured_in_uncertain_fields(self):
        """Contradictory or hesitant claims (e.g. 'either SC or OBC') must be marked uncertain."""
        query = "I am either SC or OBC from Maharashtra earning between 1 lakh and 2 lakh looking for 1 lakh loan."
        res = self.nlu.extract_profile(query)
        self.assertIn("social_category", res.uncertain_fields)
        self.assertLess(res.confidence_score, 0.9)

    def test_07_invalid_extreme_age_filtered(self):
        """Extreme age values like 150 years old should be flagged as uncertain rather than accepted blindly."""
        query = "I am a 150-year-old SC male from Punjab earning 1 lakh."
        res = self.nlu.extract_profile(query)
        self.assertIn("age", res.uncertain_fields)

    def test_08_zero_hallucination_guarantee_on_vague_input(self):
        """CRITICAL: Vague query MUST NOT hallucinate demographic attributes."""
        query = "I need urgent financial help for a loan."
        res = self.nlu.extract_profile(query)
        self.assertIsNone(res.extracted_profile.social_category)
        self.assertIsNone(res.extracted_profile.gender)
        self.assertIsNone(res.extracted_profile.state)
        self.assertIsNone(res.extracted_profile.annual_income)
        self.assertIsNone(res.extracted_profile.project_cost)
        self.assertFalse(res.ready_for_matching)
        for field in CRITICAL_MATCHING_FIELDS:
            self.assertIn(field, res.missing_critical_fields)

    def test_09_intent_classification_taxonomy(self):
        """Verify intent classification across official MoSJE/NSFDC operational categories."""
        # 1. Micro Finance (<= 1.40L)
        res_micro = self.nlu.extract_profile("I am an SC woman needing ₹50,000 for a small grocery kiosk in UP.")
        self.assertEqual(res_micro.detected_intent, "micro_finance")

        # 2. Term Loan (> 1.40L)
        res_term = self.nlu.extract_profile("I am an SC entrepreneur needing ₹8,00,000 for a CNC metal workshop in Gujarat.")
        self.assertEqual(res_term.detected_intent, "term_loan")

        # 3. Educational Loan (Higher Education / Degree)
        res_edu = self.nlu.extract_profile("I am an SC student admitted to M.Tech in computer science needing ₹12 lakh tuition fees.")
        self.assertEqual(res_edu.detected_intent, "educational_loan")

        # 4. Partner Information
        res_partner = self.nlu.extract_profile("Where is the nearest bank branch or SCA channel partner office in Karnataka?")
        self.assertEqual(res_partner.detected_intent, "partner_information")

        # 5. Scheme Information
        res_info = self.nlu.extract_profile("What is the eligibility for the NSFDC Mahila Samriddhi Yojana?")
        self.assertEqual(res_info.detected_intent, "scheme_information")

    def test_10_provider_agnostic_abstraction(self):
        """Verify that any BaseNLUProvider implementation can be swapped into NLUService."""
        orig_provider = self.nlu.provider
        try:
            custom_provider = MockCustomProvider()
            self.nlu.set_provider(custom_provider)
            self.assertEqual(self.nlu.get_active_provider_name(), "MockCustomProvider")
            
            res = self.nlu.extract_profile("any text")
            self.assertEqual(res.provider_used, "MockCustomProvider")
            self.assertEqual(res.extracted_profile.social_category, "SC")
        finally:
            self.nlu.set_provider(orig_provider)

    def test_11_automatic_fallback_on_provider_error(self):
        """When active provider raises an exception, service falls back to DeterministicRuleBasedNLUProvider."""
        orig_provider = self.nlu.provider
        try:
            failing_provider = MockFailingProvider()
            self.nlu.set_provider(failing_provider)
            
            query = "I am an SC woman from Karnataka earning ₹2.5 lakh looking for ₹3 lakh tailoring loan."
            res = self.nlu.extract_profile(query)
            # Must not crash, and must return extracted profile via deterministic rules
            self.assertEqual(res.extracted_profile.social_category, "SC")
            self.assertEqual(res.extracted_profile.gender, "Female")
            self.assertEqual(res.extracted_profile.annual_income, 250000.0)
            self.assertIn("DeterministicRuleBasedNLU", res.provider_used)
        finally:
            self.nlu.set_provider(orig_provider)

    def test_12_deterministic_currency_parsing(self):
        """Verify Indian currency parsing across variations (lakh, lac, L, raw number)."""
        det = DeterministicRuleBasedNLUProvider()
        self.assertEqual(det._parse_currency("2.5 lakh"), 250000.0)
        self.assertEqual(det._parse_currency("3 lakhs"), 300000.0)
        self.assertEqual(det._parse_currency("1.4 lac"), 140000.0)
        self.assertEqual(det._parse_currency("500000"), 500000.0)
        self.assertEqual(det._parse_currency("₹80,000"), 80000.0)

    def test_13_pydantic_schema_validation(self):
        """Verify Pydantic models reject invalid inputs."""
        # Short query (< 3 chars)
        res_short = self.client.post("/api/ai/extract-profile", json={"query": "ab"})
        self.assertEqual(res_short.status_code, 422)

        # Missing query field entirely
        res_empty = self.client.post("/api/ai/extract-profile", json={})
        self.assertEqual(res_empty.status_code, 422)

    def test_14_fastapi_endpoint_integration(self):
        """Verify POST /api/ai/extract-profile returns HTTP 200 and schema-compliant JSON."""
        payload = {
            "query": "I am an SC woman from Karnataka earning ₹2.5 lakh per year wanting to start a ₹3 lakh tailoring unit."
        }
        res = self.client.post("/api/ai/extract-profile", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("extracted_profile", data)
        self.assertIn("detected_intent", data)
        self.assertIn("confidence_score", data)
        self.assertIn("summary_interpretation", data)
        self.assertIn("missing_critical_fields", data)
        self.assertIn("uncertain_fields", data)
        self.assertIn("ready_for_matching", data)
        self.assertIn("provider_used", data)
        self.assertEqual(data["extracted_profile"]["social_category"], "SC")
        self.assertEqual(data["extracted_profile"]["gender"], "Female")
        self.assertEqual(data["extracted_profile"]["state"], "Karnataka")


if __name__ == "__main__":
    unittest.main()
