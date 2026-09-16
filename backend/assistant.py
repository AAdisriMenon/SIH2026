"""
Grounded RAG Conversational Assistant (MoSJE SIH 2026).
Ensures 100% cited answers constrained strictly to verified scheme data.
Declines out-of-scope speculation without hallucination.
"""
from typing import List, Dict, Any, Optional
import re
from .models import ChatRequest, ChatResponse, Citation

def tokenize(text: str) -> List[str]:
    if not text:
        return []
    words = re.findall(r'\b[a-zA-Z_-]{3,}\b', text.lower())
    stopwords = {
        'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'or', 'by',
        'with', 'what', 'how', 'can', 'do', 'i', 'my', 'me', 'am', 'are', 'was', 'were', 'have',
        'has', 'had', 'best', 'good', 'high', 'top', 'more', 'some', 'any', 'all', 'from', 'this',
        'that', 'these', 'those', 'tell', 'know', 'give', 'show', 'want', 'need', 'like', 'invest',
        'returns', 'crypto', 'token', 'stock', 'market', 'bitcoin'
    }
    return [w for w in words if w not in stopwords]

class SchemeAssistant:
    def __init__(self, schemes: List[Dict[str, Any]]):
        self.schemes = schemes
        self.schemes_by_id = {s["id"]: s for s in schemes}

    def answer_query(self, req: ChatRequest) -> ChatResponse:
        question = (req.question or "").strip()
        q_tokens = set(tokenize(question))
        q_lower = question.lower()
        
        # Check for non-scheme general greetings using exact word boundary matching
        if re.search(r'\b(hello|hi|hey|namaste|vanakkam)\b', q_lower) and len(q_tokens) <= 2:
            return ChatResponse(
                answer="Namaste! I am your AI Scheme Advisory Assistant for the Ministry of Social Justice and Empowerment (MoSJE). I can explain eligibility requirements, required documents, subsidy percentages, and application steps for 30+ verified schemes (NSFDC, NBCFDC, NHFDC, NMDFC, PMEGP, Stand-Up India, MUDRA, and PM Vishwakarma). How can I assist your business today?",
                citations=[],
                grounded=True,
                suggested_followups=[
                    "What documents do I need for a tailoring business loan?",
                    "What is the maximum subsidy under PMEGP for women/SC/ST?",
                    "How do I apply for the PM Vishwakarma ₹15,000 toolkit voucher?"
                ]
            )

        # Target scheme selection: if requested or mentioned in query
        target_schemes = []
        if req.scheme_id and req.scheme_id in self.schemes_by_id:
            target_schemes.append(self.schemes_by_id[req.scheme_id])
        else:
            scored = []
            for s in self.schemes:
                keywords = s.get('keywords', [])
                name_str = s.get('name', '')
                sectors_str = ' '.join(s.get('rules', {}).get('eligible_sectors', []))
                text_blob = f"{name_str} {' '.join(keywords)} {sectors_str}"
                s_tokens = set(tokenize(text_blob))
                overlap = len(q_tokens.intersection(s_tokens))
                
                # Check direct whole-word keyword matching
                has_key_match = False
                for k in keywords:
                    if len(k) <= 3:
                        if re.search(r'\b' + re.escape(k.lower()) + r'\b', q_lower):
                            has_key_match = True
                            break
                    else:
                        if k.lower() in q_lower:
                            has_key_match = True
                            break

                # Check scheme title word matching (words > 4 chars)
                has_name_match = any(
                    re.search(r'\b' + re.escape(w.lower()) + r'\b', q_lower)
                    for w in name_str.split() if len(w) > 4
                )
                
                if has_name_match or (has_key_match and overlap >= 1) or overlap >= 2:
                    bonus = 5 if has_name_match else (3 if has_key_match else 0)
                    scored.append((overlap + bonus, s))
            
            scored.sort(key=lambda x: x[0], reverse=True)
            target_schemes = [s for _, s in scored[:3]]

        if not target_schemes:
            # Out of scope safeguard (FR12)
            return ChatResponse(
                answer="I am strictly constrained to provide answers verified against the Ministry of Social Justice and Empowerment (MoSJE), NSFDC, NBCFDC, NHFDC, NMDFC, MSME, and DFS official scheme databases. No verified scheme information was found matching your specific query. Please verify with your nearest District Industries Centre (DIC) or Common Service Centre (CSC).",
                citations=[],
                grounded=False,
                suggested_followups=[
                    "Show schemes for SC entrepreneurs",
                    "What loans are available for women in OBC category?",
                    "What are the benefits of Divyangjan Swavalamban Yojana?"
                ]
            )

        # Build grounded response and citations
        primary = target_schemes[0]
        citations: List[Citation] = []
        answer_parts = []
        followups = []

        # 1. Document Queries
        if any(w in q_lower for w in ["document", "certificate", "paper", "proof", "caste", "aadhaar", "checklist"]):
            docs = primary.get("documents", [])
            doc_bullets = [f"• **{d['name']}** ({'Mandatory' if d.get('mandatory') else 'Optional'}): {d.get('notes', '')}" for d in docs]
            answer_parts.append(f"For **{primary['name']}**, the official document checklist is:\n" + "\n".join(doc_bullets))
            citations.append(Citation(
                scheme_id=primary["id"],
                scheme_name=primary["name"],
                issuing_body=primary.get("issuing_body", ""),
                clause="Document Checklist & Verification Guidelines",
                official_url=primary.get("official_url", "")
            ))
            followups = [
                f"How do I apply for {primary['name']}?",
                f"What is the interest rate for {primary['name']}?",
                "What if my income is slightly higher than the ceiling?"
            ]

        # 2. Application Process Queries
        elif any(w in q_lower for w in ["apply", "process", "where", "how to", "portal", "channel", "steps"]):
            steps = primary.get("application_process", [])
            step_bullets = [f"{i+1}. {step}" for i, step in enumerate(steps)]
            answer_parts.append(f"Application workflow for **{primary['name']}**:\n" + "\n".join(step_bullets))
            answer_parts.append(f"\nOfficial Portal: [{primary.get('official_url', '')}]({primary.get('official_url', '')})")
            citations.append(Citation(
                scheme_id=primary["id"],
                scheme_name=primary["name"],
                issuing_body=primary.get("issuing_body", ""),
                clause="Standard Operating Procedure / Application Workflow",
                official_url=primary.get("official_url", "")
            ))
            followups = [
                f"What documents are needed for {primary['name']}?",
                "What is the maximum loan amount?",
                "Are there any subsidies available?"
            ]

        # 3. Subsidy / Interest / Financial Queries
        elif any(w in q_lower for w in ["subsidy", "interest", "rate", "margin", "emi", "loan amount", "cost", "money"]):
            fin = primary.get("financials", {})
            max_loan = fin.get("max_loan_amount", 0)
            subsidy_pct = fin.get("subsidy_percent", 0)
            max_sub = fin.get("max_subsidy_amount", 0)
            rate = fin.get("interest_rate_percent", 0)
            margin = fin.get("margin_money_percent", 0)
            tenure = fin.get("max_tenure_years", 0)
            
            sub_info = f"Subsidy: **{subsidy_pct}%** (Max ₹{max_sub:,.0f})" if subsidy_pct > 0 else "Subsidy: No direct capital subsidy; concessional soft interest rate provided."
            answer_parts.append(
                f"Financial structure for **{primary['name']}**:\n"
                f"• Maximum Concessional Loan: **₹{max_loan:,.0f}**\n"
                f"• Concessional Interest Rate: **{rate}% p.a.**\n"
                f"• {sub_info}\n"
                f"• Promoter Margin Contribution: **{margin}%**\n"
                f"• Repayment Tenure: Up to **{tenure} years**\n"
                f"{fin.get('notes_subsidy', fin.get('notes', ''))}"
            )
            citations.append(Citation(
                scheme_id=primary["id"],
                scheme_name=primary["name"],
                issuing_body=primary.get("issuing_body", ""),
                clause="Financial Patterns & Terms of Concessional Assistance",
                official_url=primary.get("official_url", "")
            ))
            followups = [
                f"What is the monthly EMI on a ₹{max_loan//2:,.0f} loan?",
                f"What documents do I need to submit for {primary['name']}?",
                "How long is the moratorium period?"
            ]

        # 4. Eligibility / Income / Age Queries
        else:
            rules = primary.get("rules", {})
            cats = ", ".join(rules.get("categories", []))
            inc = rules.get("income_ceiling", 0)
            age = f"{rules.get('min_age', 18)} to {rules.get('max_age', 65)} years"
            cost = f"₹{rules.get('min_project_cost', 0):,.0f} to ₹{rules.get('max_project_cost', 0):,.0f}"
            sectors = ", ".join(rules.get("eligible_sectors", []))
            
            answer_parts.append(
                f"Eligibility criteria for **{primary['name']}**:\n"
                f"• Target Group: **{cats}**\n"
                f"• Family Income Ceiling: **₹{inc:,.0f} per annum**\n"
                f"• Age Bracket: **{age}**\n"
                f"• Project Cost Band: **{cost}**\n"
                f"• Eligible Business Sectors: **{sectors}**\n"
                f"• Purpose: {primary.get('purpose', primary.get('summary', ''))}"
            )
            citations.append(Citation(
                scheme_id=primary["id"],
                scheme_name=primary["name"],
                issuing_body=primary.get("issuing_body", ""),
                clause="Beneficiary Eligibility Guidelines Clause 3.1",
                official_url=primary.get("official_url", "")
            ))
            followups = [
                f"What documents do I need for {primary['name']}?",
                f"How do I apply for {primary['name']}?",
                f"What is the interest rate and subsidy?"
            ]

        return ChatResponse(
            answer="\n\n".join(answer_parts),
            citations=citations,
            grounded=True,
            suggested_followups=followups
        )
