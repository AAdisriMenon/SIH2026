"""
Stage 3 Test Suite: Scheme Comparison & Grounded RAG (MoSJE SIH 2026).
Verifies:
1. Valid two-scheme comparison with verified facts vs AI explanation separation.
2. Multi-scheme comparison (3+ schemes).
3. Invalid / missing scheme IDs error handling (404 and partial filtering).
4. Incomplete scheme data handling ('Information not available in the verified scheme data.').
5. Strict evidence/source referencing and zero hallucination.
6. Automatic fallback resilience when AI provider encounters failure.
7. Provider-agnostic abstraction and pluggability.
"""
import unittest
from starlette.testclient import TestClient

from backend.main import app
from backend.models import (
    SchemeComparisonRequest,
    SchemeComparisonResponse,
    SchemeVerifiedFact
)
from backend.comparison_service import (
    ComparisonService,
    BaseComparisonProvider,
    DeterministicRuleBasedComparisonProvider,
    build_verified_fact,
    NOT_AVAILABLE_MSG
)


class MockFailingComparisonProvider(BaseComparisonProvider):
    """Simulates an upstream API gateway timeout or crash."""
    def compare_schemes(self, schemes, all_partners, user_context=None):
        raise ConnectionError("Simulated LLM API Gateway 504 Timeout")

    def get_provider_name(self) -> str:
        return "MockFailingComparisonProvider"

    def is_available(self) -> bool:
        return True


class MockCustomComparisonProvider(BaseComparisonProvider):
    """Simulates a custom open-source model provider."""
    def compare_schemes(self, schemes, all_partners, user_context=None):
        facts = [build_verified_fact(s, all_partners) for s in schemes]
        return SchemeComparisonResponse(
            compared_schemes=facts,
            key_differences=["Mock difference 1", "Mock difference 2"],
            suitability_guidance="Mock custom suitability guidance.",
            tradeoff_summary={},
            evidence_sources=[],
            missing_or_invalid_ids=[],
            ai_disclaimer="Mock custom disclaimer",
            provider_used="MockCustomComparisonProvider"
        )

    def get_provider_name(self) -> str:
        return "MockCustomComparisonProvider"

    def is_available(self) -> bool:
        return True


class TestAIComparison(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.service = ComparisonService.get_instance()

    def test_01_valid_two_schemes_comparison(self):
        """Test comparing NSFDC Term Loan and Mahila Samriddhi Yojana (MSY)."""
        payload = {
            "scheme_ids": ["nsfdc-term-loan", "nsfdc-msy"],
            "user_context": "SC woman looking for tailoring finance"
        }
        res = self.client.post("/api/ai/compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        
        # Verify 2 schemes compared
        self.assertEqual(len(data["compared_schemes"]), 2)
        sids = [s["scheme_id"] for s in data["compared_schemes"]]
        self.assertIn("nsfdc-term-loan", sids)
        self.assertIn("nsfdc-msy", sids)

        # Verify factual distinction vs AI explanation
        self.assertIn("FACT FROM VERIFIED DATA vs. AI-GENERATED EXPLANATION", data["ai_disclaimer"])
        self.assertTrue(len(data["key_differences"]) > 0)
        self.assertTrue(len(data["suitability_guidance"]) > 0)

        # Verify Term Loan facts
        term_loan = next(s for s in data["compared_schemes"] if s["scheme_id"] == "nsfdc-term-loan")
        self.assertEqual(term_loan["max_loan_amount"], "₹4,500,000")
        self.assertEqual(term_loan["interest_rate_percent"], "8.0% per annum")
        self.assertIn("SC", term_loan["target_beneficiaries"])

        # Verify MSY facts
        msy = next(s for s in data["compared_schemes"] if s["scheme_id"] == "nsfdc-msy")
        self.assertEqual(msy["max_loan_amount"], "₹140,000")
        self.assertEqual(msy["interest_rate_percent"], "4.0% per annum")
        self.assertIn("Female", msy["target_beneficiaries"])

    def test_02_multiple_three_schemes_comparison(self):
        """Test comparing 3 schemes including Educational Loan."""
        payload = {
            "scheme_ids": ["nsfdc-term-loan", "nsfdc-msy", "nsfdc-education-loan"]
        }
        res = self.client.post("/api/ai/compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["compared_schemes"]), 3)
        
        # Verify Educational Loan Moratorium exact wording
        edu = next(s for s in data["compared_schemes"] if s["scheme_id"] == "nsfdc-education-loan")
        self.assertIn("Course duration + 1 year", edu["moratorium_months"])
        self.assertIn("repayment started", edu["moratorium_months"])

    def test_03_invalid_scheme_ids_returns_404(self):
        """When all requested scheme IDs are invalid, endpoint returns HTTP 404."""
        payload = {"scheme_ids": ["non-existent-scheme-12345"]}
        res = self.client.post("/api/ai/compare", json=payload)
        self.assertEqual(res.status_code, 404)
        self.assertIn("None of the requested scheme IDs were found", res.json()["detail"])

    def test_04_partial_invalid_scheme_ids(self):
        """When one ID is valid and one is invalid, valid is returned and invalid listed in missing_or_invalid_ids."""
        payload = {"scheme_ids": ["nsfdc-term-loan", "fake-scheme-id-999"]}
        res = self.client.post("/api/ai/compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["compared_schemes"]), 1)
        self.assertEqual(data["compared_schemes"][0]["scheme_id"], "nsfdc-term-loan")
        self.assertIn("fake-scheme-id-999", data["missing_or_invalid_ids"])

    def test_05_empty_scheme_ids_rejected(self):
        """Empty list of scheme IDs is rejected with HTTP 422."""
        res = self.client.post("/api/ai/compare", json={"scheme_ids": []})
        self.assertEqual(res.status_code, 422)

    def test_06_incomplete_scheme_data_graceful_wording(self):
        """When a scheme has missing fields, build_verified_fact returns the required non-hallucinating string."""
        sparse_scheme = {
            "id": "sparse-test",
            "name": "Sparse Test Scheme",
            "financials": {},
            "rules": {}
        }
        fact = build_verified_fact(sparse_scheme, [])
        self.assertEqual(fact.purpose, NOT_AVAILABLE_MSG)
        self.assertEqual(fact.target_beneficiaries, NOT_AVAILABLE_MSG)
        self.assertEqual(fact.eligibility_summary, NOT_AVAILABLE_MSG)
        self.assertEqual(fact.max_loan_amount, NOT_AVAILABLE_MSG)
        self.assertEqual(fact.interest_rate_percent, NOT_AVAILABLE_MSG)
        self.assertEqual(fact.tenure_years, NOT_AVAILABLE_MSG)
        self.assertEqual(fact.moratorium_months, NOT_AVAILABLE_MSG)

    def test_07_evidence_sources_integrity(self):
        """Verified schemes must include valid official sources and verification dates."""
        payload = {"scheme_ids": ["nsfdc-term-loan", "stand-up-india"]}
        res = self.client.post("/api/ai/compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        for s in data["compared_schemes"]:
            self.assertTrue(s["official_source"].startswith("http"))
            self.assertTrue(len(s["verification_date"]) >= 8)

    def test_08_hallucination_prevention_on_interest_rates(self):
        """Ensure interest rates and subsidy values exactly match verified data."""
        payload = {"scheme_ids": ["nsfdc-msy", "pm-vishwakarma"]}
        res = self.client.post("/api/ai/compare", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        msy = next(s for s in data["compared_schemes"] if s["scheme_id"] == "nsfdc-msy")
        self.assertIn("4.0%", msy["interest_rate_percent"])

    def test_09_api_provider_failure_resilience(self):
        """When active provider raises an exception, service falls back to DeterministicRuleBasedComparisonProvider."""
        orig_p = self.service.provider
        try:
            self.service.set_provider(MockFailingComparisonProvider())
            payload = {"scheme_ids": ["nsfdc-term-loan", "nsfdc-msy"]}
            res = self.client.post("/api/ai/compare", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(len(data["compared_schemes"]), 2)
            self.assertIn("DeterministicRuleBasedComparison", data["provider_used"])
        finally:
            self.service.set_provider(orig_p)

    def test_10_provider_agnostic_abstraction(self):
        """Verify provider can be swapped cleanly without altering client response format."""
        orig_p = self.service.provider
        try:
            self.service.set_provider(MockCustomComparisonProvider())
            payload = {"scheme_ids": ["nsfdc-term-loan", "nsfdc-msy"]}
            res = self.client.post("/api/ai/compare", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["provider_used"], "MockCustomComparisonProvider")
            self.assertIn("Mock custom", data["suitability_guidance"])
        finally:
            self.service.set_provider(orig_p)


if __name__ == "__main__":
    unittest.main()
