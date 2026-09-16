"""
FastAPI Backend Application (MoSJE SIH 2026 - Problem Statement #26092).
Provides APIs for Deterministic Scheme Matching, Semantic Ranking,
Financial Calculations, Grounded RAG Assistant, and Admin Management.
"""
import os
import json
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any

from .models import (
    UserProfile, MatchResponse, MatchOutcome,
    FinancialCalculationRequest, FinancialCalculationResult,
    ChatRequest, ChatResponse, SchemeRuleUpdate
)
from .rules_engine import evaluate_scheme
from .semantic_ranker import SemanticRanker
from .calculator import calculate_finance
from .assistant import SchemeAssistant
from .storage import SchemeStorage

# Initialize Storage & Engines
storage = SchemeStorage()
ranker = SemanticRanker(storage.get_all())
assistant = SchemeAssistant(storage.get_all())

app = FastAPI(
    title="MoSJE AI-Driven Scheme Matching Platform",
    description="Smart India Hackathon 2026 Problem Statement #26092 - Ministry of Social Justice and Empowerment",
    version="1.0.0"
)

# Enable CORS for development & API access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# 1. Matching & Discovery API
# ----------------------------------------------------
@app.post("/api/match", response_model=MatchResponse)
def match_schemes(profile: UserProfile):
    """
    Evaluates user profile against all schemes deterministically (Zero-Authority AI).
    Ranks results semantically based on business description.
    """
    all_schemes = storage.get_all(active_only=True)
    raw_matches = []
    
    eligible_count = 0
    borderline_count = 0
    ineligible_count = 0

    for s in all_schemes:
        status, verdicts, guidance = evaluate_scheme(profile, s)
        if status == "ELIGIBLE":
            eligible_count += 1
        elif status == "BORDERLINE":
            borderline_count += 1
        else:
            ineligible_count += 1

        match_dict = {
            "scheme_id": s["id"],
            "scheme_name": s["name"],
            "issuing_body": s.get("issuing_body", ""),
            "summary": s.get("summary", ""),
            "purpose": s.get("purpose", ""),
            "eligibility_status": status,
            "verdicts": verdicts,
            "borderline_guidance": guidance,
            "financial_summary": s.get("financials", {}),
            "documents": s.get("documents", []),
            "application_process": s.get("application_process", []),
            "official_url": s.get("official_url", ""),
            "last_verified": s.get("last_verified", ""),
            "scheme_obj": s
        }
        raw_matches.append(match_dict)

    # Apply Semantic Ranking Layer (FR3)
    ranked_matches = ranker.rank_matches(profile.business_idea, profile.business_sector, raw_matches)

    # Convert to MatchOutcome model
    final_outcomes = []
    for rm in ranked_matches:
        final_outcomes.append(MatchOutcome(
            scheme_id=rm["scheme_id"],
            scheme_name=rm["scheme_name"],
            issuing_body=rm["issuing_body"],
            summary=rm["summary"],
            purpose=rm["purpose"],
            eligibility_status=rm["eligibility_status"],
            semantic_score=rm.get("semantic_score", 0.0),
            composite_rank_score=rm.get("composite_rank_score", 0.0),
            verdicts=rm["verdicts"],
            borderline_guidance=rm["borderline_guidance"],
            financial_summary=rm["financial_summary"],
            documents=rm["documents"],
            application_process=rm["application_process"],
            official_url=rm["official_url"],
            last_verified=rm["last_verified"]
        ))

    # Log anonymized metrics for uptake gap tracking (FR16)
    storage.log_match_event(
        category=profile.category,
        gender=profile.gender,
        sector=profile.business_sector,
        income=profile.annual_income,
        cost=profile.project_cost,
        eligible_count=eligible_count
    )

    return MatchResponse(
        user_summary={
            "category": profile.category,
            "gender": profile.gender,
            "income": profile.annual_income,
            "project_cost": profile.project_cost,
            "business_sector": profile.business_sector,
            "is_pwd": profile.is_pwd
        },
        total_evaluated=len(all_schemes),
        eligible_count=eligible_count,
        borderline_count=borderline_count,
        ineligible_count=ineligible_count,
        matches=final_outcomes
    )

# ----------------------------------------------------
# 2. Scheme Catalogue API
# ----------------------------------------------------
@app.get("/api/schemes")
def get_schemes(category: Optional[str] = None, q: Optional[str] = None):
    """Lists all configured schemes with optional filters."""
    schemes = storage.get_all()
    if category:
        c_upper = category.upper()
        schemes = [s for s in schemes if c_upper in [c.upper() for c in s.get("rules", {}).get("categories", [])]]
    if q:
        q_lower = q.lower()
        schemes = [s for s in schemes if q_lower in s["name"].lower() or q_lower in s.get("summary", "").lower() or any(q_lower in k.lower() for k in s.get("keywords", []))]
    return schemes

@app.get("/api/schemes/{scheme_id}")
def get_scheme_detail(scheme_id: str):
    """Fetches full specifications for a single scheme."""
    scheme = storage.get_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme

GENERAL_BENEFITS_PATH = os.path.join(os.path.dirname(__file__), "data", "general_benefits.json")

@app.get("/api/general-benefits")
def get_general_benefits(category: Optional[str] = None, q: Optional[str] = None):
    """
    Returns verified pan-India and state government benefits across agriculture,
    health, housing, women/child welfare, pensions, and energy (Tier 2 discovery layer).
    """
    if not os.path.exists(GENERAL_BENEFITS_PATH):
        return []
    with open(GENERAL_BENEFITS_PATH, "r", encoding="utf-8") as f:
        benefits = json.load(f)
    if category and category.lower() != "all":
        c_lower = category.lower()
        benefits = [b for b in benefits if c_lower in b.get("category", "").lower() or c_lower in b.get("sector", "").lower()]
    if q:
        q_lower = q.lower()
        benefits = [b for b in benefits if q_lower in b.get("name", "").lower() or q_lower in b.get("summary", "").lower() or q_lower in b.get("state", "").lower()]
    return benefits


# ----------------------------------------------------
# 3. Interactive Financial Calculator API
# ----------------------------------------------------
@app.post("/api/calculate", response_model=FinancialCalculationResult)
def calculate_financials(req: FinancialCalculationRequest):
    """
    Computes Loan amount, Margin Money, Capital Subsidy, and Reducing Balance Monthly EMI schedule.
    """
    scheme_financials = None
    if req.scheme_id:
        scheme = storage.get_by_id(req.scheme_id)
        if scheme:
            scheme_financials = scheme.get("financials", {})

    return calculate_finance(
        project_cost=req.project_cost,
        scheme_financials=scheme_financials,
        custom_subsidy_pct=req.custom_subsidy_percent,
        custom_margin_pct=req.custom_margin_percent,
        interest_rate_pct=req.interest_rate_percent,
        tenure_years=req.tenure_years
    )

# ----------------------------------------------------
# 4. Grounded RAG Chatbot Assistant API
# ----------------------------------------------------
@app.post("/api/assistant/chat", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest):
    """
    Retrieval-Augmented Generation assistant with 100% cited source grounding (FR11, FR12).
    """
    return assistant.answer_query(req)

# ----------------------------------------------------
# 5. Admin & Analytics API
# ----------------------------------------------------
@app.get("/api/admin/schemes")
def get_admin_schemes():
    return storage.get_all()

@app.put("/api/admin/schemes/{scheme_id}")
def update_scheme_rules(scheme_id: str, updates: SchemeRuleUpdate):
    """Allows admins to update income caps, costs, and interest rates without redeployment (FR13, FR14)."""
    updated = storage.update_rules(scheme_id, updates.model_dump(exclude_unset=True), auditor=updates.verified_by or "Admin")
    if not updated:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    # Refresh ranker and assistant in-memory
    global ranker, assistant
    ranker = SemanticRanker(storage.get_all())
    assistant = SchemeAssistant(storage.get_all())
    
    return {"message": "Scheme rules successfully updated", "scheme": updated}

@app.get("/api/admin/analytics")
def get_analytics():
    """Returns anonymized uptake statistics and audit log (FR16)."""
    return storage.get_analytics()

# ----------------------------------------------------
# 6. Static Web & PWA Delivery
# ----------------------------------------------------
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/")
    def serve_frontend_root():
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

    @app.get("/manifest.json")
    def serve_manifest():
        return FileResponse(os.path.join(FRONTEND_DIR, "manifest.json"))

    @app.get("/sw.js")
    def serve_sw():
        return FileResponse(os.path.join(FRONTEND_DIR, "sw.js"))
