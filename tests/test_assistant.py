"""
Unit Tests for Grounded RAG Conversational Assistant (MoSJE SIH 2026).
Verifies:
1. Grounded answers on verified scheme guidelines
2. Strict source citation delivery
3. Out-of-scope question refusal (Zero-Hallucination Guard)
"""
import unittest
from backend.models import ChatRequest
from backend.assistant import SchemeAssistant
from backend.storage import SchemeStorage

class TestAssistant(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.storage = SchemeStorage()
        cls.assistant = SchemeAssistant(cls.storage.get_all())

    def test_document_query_with_citations(self):
        """Verify that document queries return checklist and citations."""
        req = ChatRequest(
            question="What documents are needed for NSFDC Term Loan Scheme?",
            scheme_id="nsfdc-term-loan"
        )
        resp = self.assistant.answer_query(req)
        self.assertTrue(resp.grounded)
        self.assertIn("Caste Certificate", resp.answer)
        self.assertIn("Aadhaar Card", resp.answer)
        self.assertTrue(len(resp.citations) > 0)
        self.assertEqual(resp.citations[0].scheme_id, "nsfdc-term-loan")

    def test_subsidy_query(self):
        """Verify financial query answers."""
        req = ChatRequest(
            question="What is the subsidy percentage under PMEGP?",
            scheme_id="pmegp-scheme"
        )
        resp = self.assistant.answer_query(req)
        self.assertTrue(resp.grounded)
        self.assertIn("35%", resp.answer)
        self.assertTrue(len(resp.citations) > 0)

    def test_out_of_scope_refusal(self):
        """FR12: Assistant declines to answer rather than guess when no matching scheme data exists."""
        req = ChatRequest(
            question="What is the best crypto token to invest in for high returns in 2026?"
        )
        resp = self.assistant.answer_query(req)
        self.assertFalse(resp.grounded)
        self.assertIn("strictly constrained", resp.answer)
        self.assertEqual(len(resp.citations), 0)

if __name__ == "__main__":
    unittest.main()
