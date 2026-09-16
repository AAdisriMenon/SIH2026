# -*- coding: utf-8 -*-
"""
Master Automated Verification Suite for SIH 2026 Problem Statement #26092:
MoSJE / NSFDC Smart Scheme Matching Platform - AI Architecture Upgrade

Verifies:
1. GET /api/ai/status (truthful multi-provider transparency: Gemini 3.8 Flash, Emb-2, HF MiniLM, RAG, Rules Engine)
2. POST /api/ai/search (multi-model semantic search with Gemini, HF, and TF-IDF breakdown)
3. Multi-Model Hybrid Fusion Mathematics (0.60 Gemini + 0.25 HF + 0.15 TF-IDF)
4. Hard statutory eligibility tier gating (+1000 Eligible, +500 Borderline)
5. Zero arbitrary social-category ranking bonuses
6. Partner routing enrichment in POST /api/match (suggested_partner, suggested_partner_reason)
7. Explainable AI breakdown in POST /api/match (why_matched_explanation)
8. Grounded RAG Assistant factual responses with source citations
9. Multi-scheme grounded comparison (POST /api/ai/compare)
"""

import unittest
import sys
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi.testclient import TestClient
from backend.main import app
from backend.embedding_service import EmbeddingService
from backend.semantic_ranker import SemanticRanker
from backend.storage import SchemeStorage

client = TestClient(app)
storage = SchemeStorage()
schemes = storage.get_all()
embedding_service = EmbeddingService.get_instance()
semantic_ranker = SemanticRanker(schemes, embedding_service=embedding_service)

class TestMasterAIUpgrade(unittest.TestCase):

    def test_01_ai_provider_status_endpoint(self):
        """Verify GET /api/ai/status returns truthful status for all providers."""
        res = client.get("/api/ai/status")
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # 1. Gemini
        self.assertIn("gemini_generative_model", data)
        self.assertEqual(data["gemini_generative_model"], "gemini-3.8-flash")
        self.assertEqual(data["gemini_embedding_model"], "gemini-embedding-2")
        self.assertIn("gemini_status", data)

        # 2. Hugging Face
        self.assertIn("huggingface_model", data)
        self.assertEqual(data["huggingface_model"], "sentence-transformers/all-MiniLM-L6-v2")
        self.assertIn("huggingface_status", data)

        # 3. Grounded RAG
        self.assertIn("rag_status", data)
        self.assertTrue("ACTIVE" in data["rag_status"])

        # 4. Rules Engine
        self.assertIn("rules_engine_status", data)
        self.assertTrue("AUTHORITATIVE" in data["rules_engine_status"])
        self.assertIn("active_providers_summary", data)

    def test_02_semantic_search_endpoint(self):
        """Verify POST /api/ai/search returns multi-model similarity scores and ranked schemes."""
        req = {
            "query": "tailoring boutique with sewing machines for women garments",
            "top_k": 5
        }
        res = client.post("/api/ai/search", json=req)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["query"], req["query"])
        self.assertGreater(data["total_found"], 0)
        results = data["results"]
        self.assertLessEqual(len(results), 5)

        prev_score = 100.0
        for item in results:
            self.assertIn("scheme_id", item)
            self.assertIn("scheme_name", item)
            self.assertIn("similarity_score", item)
            self.assertIn("gemini_similarity", item)
            self.assertIn("hf_similarity", item)
            self.assertIn("lexical_score", item)

            sim = item["similarity_score"]
            self.assertLessEqual(sim, prev_score + 1e-6, "Results must be sorted descending by similarity_score")
            prev_score = sim

            # Verify scores are bounded [0, 100]
            self.assertGreaterEqual(item["gemini_similarity"], 0.0)
            self.assertLessEqual(item["gemini_similarity"], 100.0)
            self.assertGreaterEqual(item["hf_similarity"], 0.0)
            self.assertLessEqual(item["hf_similarity"], 100.0)
            self.assertGreaterEqual(item["lexical_score"], 0.0)
            self.assertLessEqual(item["lexical_score"], 100.0)

    def test_03_hybrid_fusion_mathematics(self):
        """Verify the multi-model hybrid fusion formula: 0.60 Gemini + 0.25 HF + 0.15 TF-IDF."""
        query = "higher education computer engineering master degree"
        edu_scheme = storage.get_by_id("nsfdc-education-loan")
        self.assertIsNotNone(edu_scheme)

        details = semantic_ranker.compute_similarity_details(query, "Education", edu_scheme)

        self.assertIn("gemini", details)
        self.assertIn("huggingface", details)
        self.assertIn("lexical", details)
        self.assertIn("hybrid", details)

        g_score = details["gemini"]
        hf_score = details["huggingface"]
        tf_score = details["lexical"]
        hybrid = details["hybrid"]

        expected_fused = (0.60 * g_score) + (0.25 * hf_score) + (0.15 * tf_score)
        expected_score = round(min(98.5, max(15.0, expected_fused)), 1)
        self.assertAlmostEqual(hybrid, expected_score, places=1)

    def test_04_hard_statutory_eligibility_tier_gating(self):
        """Verify that hard eligibility tiers strictly gate ranking (+1000 Eligible, +500 Borderline)."""
        test_matches = [
            {"scheme_id": "s1", "eligibility_status": "ELIGIBLE", "scheme_obj": schemes[0]},
            {"scheme_id": "s2", "eligibility_status": "BORDERLINE", "scheme_obj": schemes[1]},
            {"scheme_id": "s3", "eligibility_status": "INELIGIBLE", "scheme_obj": schemes[2]}
        ]
        ranked = semantic_ranker.rank_matches("general shop", "General", test_matches)
        
        # ELIGIBLE scheme must have score >= 1000
        self.assertGreaterEqual(ranked[0]["composite_rank_score"], 1000.0)
        self.assertEqual(ranked[0]["eligibility_status"], "ELIGIBLE")

        # BORDERLINE scheme must have score >= 500 and < 1000
        self.assertGreaterEqual(ranked[1]["composite_rank_score"], 500.0)
        self.assertLess(ranked[1]["composite_rank_score"], 1000.0)
        self.assertEqual(ranked[1]["eligibility_status"], "BORDERLINE")

        # INELIGIBLE scheme must have score < 500
        self.assertLess(ranked[2]["composite_rank_score"], 500.0)
        self.assertEqual(ranked[2]["eligibility_status"], "INELIGIBLE")

    def test_05_zero_arbitrary_category_bonuses(self):
        """Verify that passing user_category='SC' vs 'General' does NOT inject arbitrary ranking bonuses."""
        test_match_sc = [{"scheme_id": "s1", "eligibility_status": "ELIGIBLE", "scheme_obj": schemes[0]}]
        test_match_gen = [{"scheme_id": "s1", "eligibility_status": "ELIGIBLE", "scheme_obj": schemes[0]}]

        ranked_sc = semantic_ranker.rank_matches("small grocery shop", "General", test_match_sc, user_category="SC")
        ranked_gen = semantic_ranker.rank_matches("small grocery shop", "General", test_match_gen, user_category="General")

        self.assertEqual(
            ranked_sc[0]["composite_rank_score"],
            ranked_gen[0]["composite_rank_score"],
            "Social category must NEVER inject arbitrary semantic ranking boost"
        )

    def test_06_partner_routing_in_match_endpoint(self):
        """Verify that POST /api/match enriches eligible schemes with suggested_partner and why_matched_explanation."""
        rekha_payload = {
            "name": "Rekha",
            "category": "OBC",
            "gender": "Female",
            "age": 28,
            "annual_income": 150000.0,
            "is_pwd": False,
            "pwd_percent": 0.0,
            "state": "Karnataka",
            "district": "Bangalore",
            "pincode": "",
            "business_idea": "Starting a tailoring boutique to sew designer garments, ladies blouses, and uniforms.",
            "business_sector": "Tailoring/Garments",
            "loan_purpose": "business",
            "project_cost": 150000.0,
            "education": "Class 8"
        }
        res = client.post("/api/match", json=rekha_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        matches = data.get("matches", [])
        self.assertGreater(len(matches), 0)

        for m in matches:
            # Check for explainable AI breakdown
            self.assertIn("why_matched_explanation", m)
            self.assertIsNotNone(m["why_matched_explanation"])
            self.assertIn("statutory_status", m["why_matched_explanation"])

            # Check for suggested partner
            self.assertIn("suggested_partner", m)
            self.assertIn("suggested_partner_reason", m)
            if m["eligibility_status"] in ["ELIGIBLE", "BORDERLINE"]:
                self.assertIsNotNone(m["suggested_partner"], f"Scheme {m['scheme_id']} should have a suggested partner")
                self.assertIsNotNone(m["suggested_partner_reason"])

    def test_07_pooja_education_loan_partner_routing(self):
        """Verify Pooja persona (Educational Loan) routes to a partner handling educational credit."""
        pooja_payload = {
            "name": "Pooja",
            "category": "SC",
            "gender": "Female",
            "age": 22,
            "annual_income": 200000.0,
            "is_pwd": False,
            "pwd_percent": 0.0,
            "state": "Uttar Pradesh",
            "district": "Varanasi",
            "pincode": "",
            "business_idea": "Higher education in Computer Science M.Tech degree tuition fees and laptop.",
            "business_sector": "Education",
            "loan_purpose": "education",
            "project_cost": 800000.0,
            "education": "Graduate"
        }
        res = client.post("/api/match", json=pooja_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        matches = data.get("matches", [])
        edu_matches = [m for m in matches if m["scheme_id"] == "nsfdc-education-loan"]
        self.assertGreater(len(edu_matches), 0, "NSFDC Educational Loan should be in matches")
        edu = edu_matches[0]
        self.assertEqual(edu["eligibility_status"], "ELIGIBLE")
        self.assertIsNotNone(edu["suggested_partner"])
        self.assertIn("Educational", edu["suggested_partner_reason"])

    def test_08_grounded_rag_assistant_with_citations(self):
        """Verify conversational RAG assistant provides factual answers with verified citations."""
        # 1. Term Loan interest query -> 8%
        res1 = client.post("/api/assistant/chat", json={"question": "What is the interest rate for NSFDC Term Loan?"})
        self.assertEqual(res1.status_code, 200)
        self.assertIn("8.0%", res1.json()["answer"])
        self.assertGreater(len(res1.json()["citations"]), 0)

        # 2. Maximum Educational Loan -> ₹40 Lakh or 90%
        res2 = client.post("/api/assistant/chat", json={"question": "What is the maximum Educational Loan?"})
        self.assertEqual(res2.status_code, 200)
        self.assertTrue("40" in res2.json()["answer"] or "90%" in res2.json()["answer"])

        # 3. Income ceiling -> ₹5 Lakh
        res3 = client.post("/api/assistant/chat", json={"question": "What is the NSFDC income ceiling?"})
        self.assertEqual(res3.status_code, 200)
        self.assertIn("5.00 Lakh", res3.json()["answer"])

        # 4. Direct application to NSFDC -> No
        res4 = client.post("/api/assistant/chat", json={"question": "Can I apply directly to NSFDC?"})
        self.assertEqual(res4.status_code, 200)
        self.assertTrue("no" in res4.json()["answer"].lower())

        # 5. Historical MSY query -> labeled historical, not current guidance
        res5 = client.post("/api/assistant/chat", json={"question": "What is the interest rate and maximum loan for Mahila Samriddhi Yojana?"})
        self.assertEqual(res5.status_code, 200)
        self.assertTrue("historical" in res5.json()["answer"].lower() or "archived" in res5.json()["answer"].lower())
        self.assertIn("6.5%", res5.json()["answer"])

    def test_09_multi_scheme_comparison(self):
        """Verify POST /api/ai/compare returns side-by-side grounded comparison for selected schemes."""
        compare_req = {
            "scheme_ids": ["nsfdc-term-loan", "nsfdc-msy"],
            "user_context": "SC female entrepreneur wanting to start tailoring"
        }
        res = client.post("/api/ai/compare", json=compare_req)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(len(data["compared_schemes"]), 2)
        self.assertIn("key_differences", data)
        self.assertIn("suitability_guidance", data)
        self.assertIn("ai_disclaimer", data)
        self.assertIn("FACT FROM VERIFIED DATA", data["ai_disclaimer"])

        term_loan = next(s for s in data["compared_schemes"] if s["scheme_id"] == "nsfdc-term-loan")
        self.assertEqual(term_loan["interest_rate_percent"], "8.0% per annum")

    def test_10_current_official_financial_data(self):
        """Verify current official NSFDC financial data integrity across dataset and calculator."""
        # 1. Term Loan Calculator check (8.0%, 7 years, 10% margin on ₹3L)
        calc_res = client.post("/api/calculate", json={"project_cost": 300000.0, "scheme_id": "nsfdc-term-loan"})
        self.assertEqual(calc_res.status_code, 200)
        calc_data = calc_res.json()
        self.assertEqual(calc_data["interest_rate_percent"], 8.0)
        self.assertEqual(calc_data["loan_amount"], 270000.0)
        self.assertEqual(calc_data["margin_money_amount"], 30000.0)
        self.assertEqual(calc_data["tenure_years"], 7)
        self.assertIn("6 Months", calc_data["moratorium_note"])

        # 2. Dataset rules check: NSFDC family income ceiling = ₹5,00,000
        tl_scheme = storage.get_by_id("nsfdc-term-loan")
        self.assertEqual(tl_scheme["rules"]["income_ceiling"], 500000.0)
        self.assertEqual(tl_scheme["financials"]["interest_rate_percent"], 8.0)
        self.assertEqual(tl_scheme["financials"]["max_tenure_years"], 7)

        mcf_scheme = storage.get_by_id("nsfdc-mcf")
        self.assertEqual(mcf_scheme["financials"]["interest_rate_percent"], 6.5)
        self.assertEqual(mcf_scheme["financials"]["max_loan_amount"], 125000.0)

        msy_scheme = storage.get_by_id("nsfdc-msy")
        self.assertFalse(msy_scheme.get("is_current", True))

    def test_11_demo_nsfdc_prioritization_and_intent(self):
        """Verify ₹3L SC tailoring demo prioritizes NSFDC Term Loan and formats intent correctly."""
        # 1. Test NLU intent display
        nlu_res = client.post("/api/ai/extract-profile", json={
            "query": "I'm an SC woman from Karnataka earning ₹2.5 lakh per year. I want to start a ₹3 lakh tailoring business from home."
        })
        self.assertEqual(nlu_res.status_code, 200)
        nlu_data = nlu_res.json()
        self.assertEqual(nlu_data["detected_intent"], "term_loan")
        self.assertIn("NSFDC Term Loan", nlu_data["intent_display"])
        self.assertIn("NSFDC Term Loan", nlu_data["summary_interpretation"])

        # 2. Test Match endpoint surfaces NSFDC Term Loan as #1
        match_res = client.post("/api/match", json={
            "name": "Beneficiary",
            "category": "SC",
            "gender": "Female",
            "age": 30,
            "annual_income": 250000.0,
            "state": "Karnataka",
            "business_sector": "Tailoring/Garments",
            "business_idea": "Tailoring business from home",
            "project_cost": 300000.0,
            "loan_category_preference": "All"
        })
        self.assertEqual(match_res.status_code, 200)
        matches = match_res.json()["matches"]
        self.assertGreater(len(matches), 0)

        # Top match MUST be NSFDC Term Loan
        top_match = matches[0]
        self.assertEqual(top_match["scheme_id"], "nsfdc-term-loan")
        self.assertEqual(top_match["scheme_classification"], "MoSJE / NSFDC Scheme")
        self.assertTrue(top_match["is_nsfdc_scheme"])
        self.assertEqual(top_match["suggested_partner"]["name"], "Dr. B.R. Ambedkar Development Corporation Ltd.")

        # External schemes must be classified as 'Related external government scheme'
        mudra = next(m for m in matches if m["scheme_id"] == "mudra-kishore")
        self.assertEqual(mudra["scheme_classification"], "Related external government scheme")
        self.assertFalse(mudra["is_nsfdc_scheme"])
        self.assertIn("not routed through nsfdc", mudra["suggested_partner_reason"].lower())

if __name__ == "__main__":
    unittest.main()
