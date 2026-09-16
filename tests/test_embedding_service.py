"""
Stage 1 Unit Tests: Modular Embedding Service & Hybrid Semantic Ranker (MoSJE SIH 2026).
Verifies:
1. All 34 schemes have pre-computed embeddings.
2. Embedding vector dimensions are strictly consistent (768).
3. Cosine similarity mathematical behavior.
4. Provider-agnostic interface (Gemini / HuggingFace / Deterministic).
5. Seamless deterministic TF-IDF fallback.
6. Zero arbitrary social-category ranking bonuses.
7. Preservation of deterministic statutory eligibility tiers.
8. Safe handling of missing/invalid embeddings.
"""
import unittest
import sys
import os
import json
import numpy as np

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.embedding_service import (
    EmbeddingService,
    BaseEmbeddingProvider,
    DeterministicEmbeddingProvider,
    GeminiEmbeddingProvider,
    HuggingFaceEmbeddingProvider,
    cosine_similarity,
    build_scheme_document,
    EMBEDDING_DIMENSION
)
from backend.semantic_ranker import SemanticRanker
from backend.storage import SchemeStorage

class TestEmbeddingServiceAndRanker(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.storage = SchemeStorage()
        cls.schemes = cls.storage.get_all()
        cls.service = EmbeddingService.get_instance()

    def test_all_34_schemes_have_embeddings(self):
        """Verify all 34 schemes in the seed catalogue have precomputed embeddings."""
        self.assertEqual(len(self.schemes), 34)
        cache_path = os.path.join(root_dir, "backend", "data", "schemes_embeddings.json")
        self.assertTrue(os.path.exists(cache_path), "schemes_embeddings.json must exist on disk")

        with open(cache_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        embeddings = data.get("embeddings", {})
        self.assertEqual(len(embeddings), 34, f"Expected 34 scheme embeddings, found {len(embeddings)}")
        
        for s in self.schemes:
            sid = s["id"]
            self.assertIn(sid, embeddings, f"Scheme {sid} missing from embeddings cache")

    def test_consistent_embedding_dimensions(self):
        """Verify that every single cached embedding vector has exactly 768 dimensions and unit norm."""
        cache_path = os.path.join(root_dir, "backend", "data", "schemes_embeddings.json")
        with open(cache_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        embeddings = data["embeddings"]
        for sid, vec in embeddings.items():
            self.assertEqual(len(vec), EMBEDDING_DIMENSION, f"Scheme {sid} vector dimension is {len(vec)}, expected {EMBEDDING_DIMENSION}")
            norm = np.linalg.norm(vec)
            self.assertAlmostEqual(norm, 1.0, places=4, msg=f"Scheme {sid} vector must be normalized to unit length")

    def test_cosine_similarity_mathematics(self):
        """Verify vector cosine similarity behaves according to standard linear algebra."""
        # Orthogonal vectors -> 0.0
        v1 = [1.0, 0.0, 0.0]
        v2 = [0.0, 1.0, 0.0]
        self.assertAlmostEqual(cosine_similarity(v1, v2), 0.0)

        # Identical vectors -> 1.0
        v3 = [0.5, 0.5, 0.7071]
        self.assertAlmostEqual(cosine_similarity(v3, v3), 1.0, places=4)

        # Opposite vectors -> -1.0
        v4 = [-0.5, -0.5, -0.7071]
        self.assertAlmostEqual(cosine_similarity(v3, v4), -1.0, places=4)

    def test_provider_agnostic_abstraction(self):
        """Verify provider interface allows swapping backends without breaking the service."""
        # 1. Deterministic Provider
        p_det = DeterministicEmbeddingProvider(dimension=768)
        self.assertEqual(p_det.get_dimension(), 768)
        self.assertTrue(p_det.is_available())
        vec = p_det.embed_text("Test tailoring business")
        self.assertEqual(len(vec), 768)

        # 2. Hugging Face Provider Interface
        p_hf = HuggingFaceEmbeddingProvider(dimension=384)
        self.assertEqual(p_hf.get_dimension(), 384)
        self.assertIn("HuggingFace", p_hf.get_provider_name())

        # 3. Custom Mock Provider
        class MockCustomProvider(BaseEmbeddingProvider):
            def embed_text(self, text: str):
                return [0.1] * 128
            def embed_batch(self, texts):
                return [[0.1] * 128 for _ in texts]
            def get_dimension(self):
                return 128
            def get_provider_name(self):
                return "CustomMock"
            def is_available(self):
                return True

        svc = EmbeddingService(provider=MockCustomProvider())
        self.assertEqual(svc.get_dimension(), 128)
        self.assertEqual(svc.get_active_provider_name(), "CustomMock")
        q_vec = svc.embed_query("Query test")
        self.assertEqual(len(q_vec), 128)

    def test_tfidf_fallback_when_embedding_service_disabled(self):
        """Verify SemanticRanker functions identically using pure TF-IDF when embedding service is disabled."""
        ranker_tfidf = SemanticRanker(self.schemes, embedding_service=None)
        score = ranker_tfidf.compute_similarity(
            query_text="tailoring garment manufacturing sewing machine",
            sector="Services",
            scheme=self.schemes[0]
        )
        self.assertIsInstance(score, float)
        self.assertGreaterEqual(score, 15.0)
        self.assertLessEqual(score, 98.5)

    def test_hybrid_ranking_preserves_deterministic_eligibility_tiers(self):
        """
        Verify that semantic ranking only orders items WITHIN their eligibility tiers:
        ELIGIBLE schemes (1000 base) > BORDERLINE schemes (500 base) > INELIGIBLE schemes (0 base).
        """
        ranker = SemanticRanker(self.schemes)
        
        matches = [
            {
                "scheme_id": "nsfdc-term-loan",
                "eligibility_status": "INELIGIBLE",
                "scheme_obj": self.schemes[0]
            },
            {
                "scheme_id": "nbcfdc-new-swarnima",
                "eligibility_status": "BORDERLINE",
                "scheme_obj": self.schemes[1]
            },
            {
                "scheme_id": "pmegp",
                "eligibility_status": "ELIGIBLE",
                "scheme_obj": self.schemes[2]
            }
        ]

        ranked = ranker.rank_matches("workshop fabrication", "Manufacturing", matches)
        
        # Rank 1 must be ELIGIBLE
        self.assertEqual(ranked[0]["eligibility_status"], "ELIGIBLE")
        self.assertGreaterEqual(ranked[0]["composite_rank_score"], 1000.0)

        # Rank 2 must be BORDERLINE
        self.assertEqual(ranked[1]["eligibility_status"], "BORDERLINE")
        self.assertGreaterEqual(ranked[1]["composite_rank_score"], 500.0)
        self.assertLess(ranked[1]["composite_rank_score"], 1000.0)

        # Rank 3 must be INELIGIBLE
        self.assertEqual(ranked[2]["eligibility_status"], "INELIGIBLE")
        self.assertLess(ranked[2]["composite_rank_score"], 500.0)

    def test_no_arbitrary_category_bonuses(self):
        """
        Verify that passing user_category='SC' vs 'General' does not inject an arbitrary ranking boost.
        Semantic score must be strictly driven by relevance to stated business activities.
        """
        ranker = SemanticRanker(self.schemes)
        matches_sc = [{
            "scheme_id": "nsfdc-term-loan",
            "eligibility_status": "ELIGIBLE",
            "scheme_obj": self.schemes[0]
        }]
        matches_gen = [{
            "scheme_id": "nsfdc-term-loan",
            "eligibility_status": "ELIGIBLE",
            "scheme_obj": self.schemes[0]
        }]

        ranked_sc = ranker.rank_matches("retail shop", "Trading", matches_sc, user_category="SC")
        ranked_gen = ranker.rank_matches("retail shop", "Trading", matches_gen, user_category="General")

        self.assertEqual(ranked_sc[0]["semantic_score"], ranked_gen[0]["semantic_score"])
        self.assertEqual(ranked_sc[0]["composite_rank_score"], ranked_gen[0]["composite_rank_score"])

    def test_missing_scheme_in_cache_fallback(self):
        """Verify that a scheme not currently present in the vector cache embeds on-the-fly without error."""
        svc = EmbeddingService.get_instance()
        unknown_scheme = {
            "id": "new-sample-scheme-2026",
            "name": "State Micro Solar Equipment Scheme",
            "issuing_body": "State Energy Dept",
            "summary": "Subsidized solar pumping systems for rural farmers",
            "purpose": "Promote solar energy installation in farming cooperatives",
            "category_targets": ["All"],
            "gender_targets": ["Any"],
            "keywords": ["solar", "pump", "irrigation", "farming"]
        }

        score = svc.compute_similarity("solar pump installation", "new-sample-scheme-2026", scheme_obj=unknown_scheme)
        self.assertIsInstance(score, float)
        self.assertGreater(score, 25.0)

if __name__ == "__main__":
    unittest.main()
