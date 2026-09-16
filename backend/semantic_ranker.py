"""
Semantic Ranking Layer for Scheme Discovery (MoSJE SIH 2026).
Ranks eligible and borderline schemes based on relevance to the entrepreneur's
business description and sector, without altering deterministic eligibility verdicts.
"""
import math
import re
from typing import List, Dict, Any

def tokenize(text: str) -> List[str]:
    """Lowercase tokenization and punctuation stripping."""
    if not text:
        return []
    words = re.findall(r'\b[a-zA-Z0-9_-]{2,}\b', text.lower())
    # Common stop words to exclude
    stopwords = {
        'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for',
        'of', 'or', 'by', 'with', 'as', 'from', 'this', 'that', 'it', 'are',
        'be', 'up', 'all', 'any', 'under', 'per', 'also', 'will', 'can', 'not'
    }
    return [w for w in words if w not in stopwords]

class SemanticRanker:
    def __init__(self, schemes: List[Dict[str, Any]]):
        self.schemes = schemes
        self.corpus_docs = []
        self.doc_freq: Dict[str, int] = {}
        self.num_docs = len(schemes)
        self._build_index()

    def _build_index(self):
        for s in self.schemes:
            # Combine all textual fields into a rich document representation
            doc_text = f"{s.get('name', '')} {s.get('summary', '')} {s.get('purpose', '')} " \
                       f"{' '.join(s.get('keywords', []))} " \
                       f"{' '.join(s.get('rules', {}).get('eligible_sectors', []))}"
            tokens = set(tokenize(doc_text))
            self.corpus_docs.append(tokenize(doc_text))
            for t in tokens:
                self.doc_freq[t] = self.doc_freq.get(t, 0) + 1

    def compute_similarity(self, query_text: str, sector: str, scheme: Dict[str, Any]) -> float:
        """
        Computes hybrid TF-IDF cosine similarity + domain boost.
        Returns a score from 0.0 to 100.0.
        """
        query_tokens = tokenize(f"{query_text} {sector}")
        if not query_tokens:
            return 50.0

        scheme_doc_tokens = tokenize(
            f"{scheme.get('name', '')} {scheme.get('summary', '')} {scheme.get('purpose', '')} "
            f"{' '.join(scheme.get('keywords', []))} "
            f"{' '.join(scheme.get('rules', {}).get('eligible_sectors', []))}"
        )

        scheme_token_set = set(scheme_doc_tokens)
        
        # Calculate TF-IDF matching score
        score = 0.0
        for token in query_tokens:
            if token in scheme_token_set:
                # IDF weight: log((N - n + 0.5) / (n + 0.5) + 1)
                df = self.doc_freq.get(token, 1)
                idf = math.log(1.0 + (self.num_docs / (df + 0.5)))
                # Frequency in scheme text
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
        
        # Normalize dynamically between 25.0% and 98.0%
        normalized = 25.0 + (73.0 * (1.0 - math.exp(-raw_total / 60.0)))
        return round(min(98.5, max(15.0, normalized)), 1)

    def rank_matches(self, query_text: str, sector: str, matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculates semantic similarity for each match and assigns composite sorting scores.
        """
        for m in matches:
            scheme = m.get("scheme_obj", {})
            semantic_score = self.compute_similarity(query_text, sector, scheme)
            m["semantic_score"] = semantic_score
            
            # Composite rank:
            # ELIGIBLE: 1000 + semantic_score
            # BORDERLINE: 500 + semantic_score
            # INELIGIBLE: semantic_score
            status = m.get("eligibility_status", "INELIGIBLE")
            if status == "ELIGIBLE":
                m["composite_rank_score"] = 1000.0 + semantic_score
            elif status == "BORDERLINE":
                m["composite_rank_score"] = 500.0 + semantic_score
            else:
                m["composite_rank_score"] = semantic_score

        # Sort descending by composite_rank_score
        matches.sort(key=lambda x: x["composite_rank_score"], reverse=True)
        return matches
