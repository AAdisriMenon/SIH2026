"""
Hybrid Semantic Ranking Layer for Scheme Discovery (MoSJE SIH 2026).
Combines dense vector embeddings (via modular EmbeddingService) with
TF-IDF lexical relevance and domain sector alignment.
Seamlessly falls back to deterministic TF-IDF if embeddings are unavailable.
Preserves the Zero-Authority AI Principle: statutory eligibility remains 100% deterministic.
"""
import math
import re
from typing import List, Dict, Any, Optional

def tokenize(text: str) -> List[str]:
    """Lowercase tokenization and punctuation stripping."""
    if not text:
        return []
    words = re.findall(r'\b[a-zA-Z0-9_-]{2,}\b', text.lower())
    stopwords = {
        'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for',
        'of', 'or', 'by', 'with', 'as', 'from', 'this', 'that', 'it', 'are',
        'be', 'up', 'all', 'any', 'under', 'per', 'also', 'will', 'can', 'not'
    }
    return [w for w in words if w not in stopwords]

# Configurable Hybrid Fusion Weights (MoSJE SIH 2026 Section K)
DEFAULT_HYBRID_WEIGHTS = {
    "gemini": 0.60,
    "huggingface": 0.25,
    "lexical": 0.15
}

class SemanticRanker:
    def __init__(
        self,
        schemes: List[Dict[str, Any]],
        embedding_service: Optional[Any] = None,
        weights: Optional[Dict[str, float]] = None
    ):
        self.schemes = schemes
        self.weights = weights or DEFAULT_HYBRID_WEIGHTS.copy()
        self.embedding_service = embedding_service
        if self.embedding_service is None:
            try:
                from .embedding_service import EmbeddingService
                self.embedding_service = EmbeddingService.get_instance()
            except Exception:
                self.embedding_service = None

        # Build classical TF-IDF index as deterministic fallback
        self.corpus_docs = []
        self.doc_freq: Dict[str, int] = {}
        self.num_docs = len(schemes)
        self._build_index()

    def _build_index(self):
        for s in self.schemes:
            doc_text = f"{s.get('name', '')} {s.get('summary', '')} {s.get('purpose', '')} " \
                       f"{' '.join(s.get('keywords', []))} " \
                       f"{' '.join(s.get('rules', {}).get('eligible_sectors', []))}"
            tokens = set(tokenize(doc_text))
            self.corpus_docs.append(tokenize(doc_text))
            for t in tokens:
                self.doc_freq[t] = self.doc_freq.get(t, 0) + 1

    def compute_similarity_details(self, query_text: str, sector: str, scheme: Dict[str, Any]) -> Dict[str, float]:
        """
        Computes granular similarity scores across Gemini, Hugging Face, and Lexical TF-IDF.
        Returns: { 'hybrid': float, 'gemini': float, 'huggingface': float, 'lexical': float }
        """
        full_query = f"{query_text} {sector}".strip()
        sid = scheme.get("id") or scheme.get("scheme_id", "")

        # 1. Dual Neural Vectors (Gemini + Hugging Face)
        gemini_score = 50.0
        hf_score = 50.0
        if self.embedding_service:
            try:
                scores = self.embedding_service.compute_multimodel_similarity(full_query, sid, scheme)
                gemini_score = scores.get("gemini", 50.0)
                hf_score = scores.get("huggingface", 50.0)
            except Exception:
                pass

        # 2. Lexical TF-IDF + Sector Alignment
        query_tokens = tokenize(full_query)
        scheme_doc_tokens = tokenize(
            f"{scheme.get('name', '')} {scheme.get('summary', '')} {scheme.get('purpose', '')} "
            f"{' '.join(scheme.get('keywords', []))} "
            f"{' '.join(scheme.get('rules', {}).get('eligible_sectors', []))}"
        )
        scheme_token_set = set(scheme_doc_tokens)
        
        score = 0.0
        if query_tokens:
            for token in query_tokens:
                if token in scheme_token_set:
                    df = self.doc_freq.get(token, 1)
                    idf = math.log(1.0 + (self.num_docs / (df + 0.5)))
                    tf = scheme_doc_tokens.count(token) / (len(scheme_doc_tokens) + 1e-5)
                    score += (tf * idf) * 1000.0

        # Exact sector match boost
        eligible_sectors = [s.lower() for s in scheme.get('rules', {}).get('eligible_sectors', [])]
        user_sector_clean = (sector or '').lower()
        
        sector_boost = 0.0
        if "all" in eligible_sectors:
            sector_boost = 15.0
        elif any(user_sector_clean in es or es in user_sector_clean for es in eligible_sectors):
            sector_boost = 35.0

        # Keyword match boost
        keywords = [k.lower() for k in scheme.get('keywords', [])]
        query_set = set(query_tokens)
        matching_keywords = query_set.intersection(set(keywords))
        keyword_boost = len(matching_keywords) * 10.0

        raw_total = (score * 5.0) + sector_boost + keyword_boost
        normalized = 25.0 + (73.0 * (1.0 - math.exp(-raw_total / 60.0)))
        tfidf_score = round(min(98.5, max(15.0, normalized)), 1)

        # 3. Transparent Hybrid Fusion (0.60 Gemini + 0.25 Hugging Face + 0.15 Lexical)
        w_g = self.weights.get("gemini", 0.60)
        w_hf = self.weights.get("huggingface", 0.25)
        w_lex = self.weights.get("lexical", 0.15)
        total_w = w_g + w_hf + w_lex
        if total_w <= 0:
            total_w = 1.0

        hybrid = ((w_g * gemini_score) + (w_hf * hf_score) + (w_lex * tfidf_score)) / total_w
        hybrid_score = round(min(98.5, max(15.0, hybrid)), 1)

        return {
            "hybrid": hybrid_score,
            "gemini": gemini_score,
            "huggingface": hf_score,
            "lexical": tfidf_score
        }

    def compute_similarity(self, query_text: str, sector: str, scheme: Dict[str, Any]) -> float:
        """Returns hybrid similarity score in [15.0, 98.5]."""
        details = self.compute_similarity_details(query_text, sector, scheme)
        return details["hybrid"]

    def rank_matches(self, query_text: str, sector: str, matches: List[Dict[str, Any]], user_category: str = "General") -> List[Dict[str, Any]]:
        """
        Calculates hybrid semantic similarity and assigns composite sorting scores.
        Statutory eligibility is a HARD GATE: Ineligible schemes can never outrank Eligible ones.
        Zero arbitrary social-category ranking bonuses (PS #26092).
        """
        for m in matches:
            scheme = m.get("scheme_obj", {})
            details = self.compute_similarity_details(query_text, sector, scheme)
            
            m["semantic_score"] = details["hybrid"]
            m["gemini_similarity"] = details["gemini"]
            m["hf_similarity"] = details["huggingface"]
            m["lexical_score"] = details["lexical"]

            # Institutional Mandate Prioritization:
            # On the MoSJE / NSFDC platform, active NSFDC apex corporation schemes
            # are the core statutory mandate for qualifying beneficiaries.
            # External schemes (PMMY, PMEGP, PM Vishwakarma) are related secondary options.
            is_nsfdc = scheme.get("is_nsfdc_scheme", False) or str(m.get("scheme_id", "")).startswith("nsfdc-")
            is_current = scheme.get("is_current", True)
            
            nsfdc_priority = 100.0 if (is_nsfdc and is_current) else 0.0
            historical_demote = -5.0 if not is_current else 0.0

            status = m.get("eligibility_status", "INELIGIBLE")
            if status == "ELIGIBLE":
                m["composite_rank_score"] = 1000.0 + nsfdc_priority + historical_demote + details["hybrid"]
            elif status == "BORDERLINE":
                m["composite_rank_score"] = 500.0 + nsfdc_priority + historical_demote + details["hybrid"]
            else:
                m["composite_rank_score"] = details["hybrid"] + historical_demote

        # Sort descending by composite_rank_score
        matches.sort(key=lambda x: x["composite_rank_score"], reverse=True)
        return matches

