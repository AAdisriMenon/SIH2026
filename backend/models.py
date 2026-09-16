from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    name: Optional[str] = "Entrepreneur"
    category: str = Field(description="Social category: SC, ST, OBC, Minority, General, PwD")
    gender: str = Field(description="Gender: Female, Male, Transgender")
    age: int = Field(default=30, ge=16, le=100)
    annual_income: float = Field(default=200000.0, ge=0.0)
    is_pwd: bool = Field(default=False)
    pwd_percent: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)
    state: str = Field(default="All")
    district: Optional[str] = "General"
    pincode: Optional[str] = ""
    business_idea: str = Field(default="Tailoring and boutique micro business")
    business_sector: str = Field(default="Tailoring/Garments")
    loan_purpose: Optional[str] = "business"  # "business" or "education"
    loan_category_preference: Optional[str] = "All"  # "All", "Micro Finance", "Term Loan", "Educational Loan"
    project_cost: float = Field(default=150000.0, gt=0.0)
    education: str = Field(default="Class 8")
    business_stage: str = Field(default="New")
    has_existing_loans: bool = Field(default=False)

class RuleClauseResult(BaseModel):
    criterion: str
    status: str  # "PASS", "BORDERLINE", "FAIL"
    user_value: str
    scheme_requirement: str
    reason: str

class MatchOutcome(BaseModel):
    scheme_id: str
    scheme_name: str
    issuing_body: str
    summary: str
    purpose: str
    eligibility_status: str  # "ELIGIBLE", "BORDERLINE", "INELIGIBLE"
    loan_category: str = "Term Loan"  # "Micro Finance", "Term Loan", "Educational Loan"
    moratorium_months: int = 0
    semantic_score: float = 0.0  # 0 to 100
    composite_rank_score: float = 0.0
    verdicts: List[RuleClauseResult] = []
    borderline_guidance: List[str] = []
    financial_summary: Dict[str, Any] = {}
    documents: List[Dict[str, Any]] = []
    application_process: List[str] = []
    official_url: str = ""
    last_verified: str = ""
    suggested_partner_reason: Optional[str] = None
    suggested_partner: Optional[Dict[str, Any]] = None
    why_matched_explanation: Optional[Dict[str, Any]] = None
    is_nsfdc_scheme: bool = True
    scheme_classification: str = "MoSJE / NSFDC Scheme"
    is_current: bool = True
    source_type: Optional[str] = "official_faq"
    source_url: Optional[str] = None
    source_date: Optional[str] = None

class MatchResponse(BaseModel):
    user_summary: Dict[str, Any]
    total_evaluated: int
    eligible_count: int
    borderline_count: int
    ineligible_count: int
    matches: List[MatchOutcome]

class FinancialCalculationRequest(BaseModel):
    project_cost: float
    scheme_id: Optional[str] = None
    custom_subsidy_percent: Optional[float] = None
    custom_margin_percent: Optional[float] = None
    interest_rate_percent: float = 8.0
    tenure_years: int = 7
    moratorium_months: Optional[int] = None

class AmortizationYear(BaseModel):
    year: int
    opening_balance: float
    principal_paid: float
    interest_paid: float
    closing_balance: float

class FinancialCalculationResult(BaseModel):
    project_cost: float
    margin_money_amount: float
    margin_money_percent: float
    subsidy_amount: float
    subsidy_percent: float
    loan_amount: float
    monthly_emi: float
    total_interest: float
    total_repayment: float
    tenure_years: int
    interest_rate_percent: float
    moratorium_months: int = 0
    moratorium_note: str = ""
    loan_category: str = "Term Loan"
    yearly_schedule: List[AmortizationYear] = []

class ChatRequest(BaseModel):
    question: str
    scheme_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []

class Citation(BaseModel):
    scheme_id: str
    scheme_name: str
    issuing_body: str
    clause: str
    official_url: str

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation] = []
    grounded: bool = True
    suggested_followups: List[str] = []

class SchemeRuleUpdate(BaseModel):
    income_ceiling: Optional[float] = None
    max_project_cost: Optional[float] = None
    interest_rate_percent: Optional[float] = None
    subsidy_percent: Optional[float] = None
    is_active: Optional[bool] = True
    verified_by: Optional[str] = "Admin Auditor"

class ChannelPartner(BaseModel):
    id: str
    name: str
    type: str  # "State Channelizing Agency (SCA)", "Public Sector Bank (PSB)", "Regional Rural Bank (RRB)", "NBFC-MFI", "Small Finance Bank", "Cooperative Bank"
    state: str
    district: str
    address: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    supported_loan_categories: List[str] = []
    supported_schemes: List[str] = []
    official_source: str
    verification_date: str
    contact_info: Optional[Dict[str, Any]] = {}
    authorization_status: str
    rrb_eligibility_criteria: Optional[Dict[str, Any]] = {}
    live_status_note: str
    coordinate_precision: Optional[str] = "Approximate Nodal HQ"
    network_coverage_note: Optional[str] = "Verified sample record from NSFDC 102-partner channel network"
    distance_km: Optional[float] = None

class PartnerSearchResponse(BaseModel):
    total_found: int
    partners: List[ChannelPartner]
    filter_applied: Dict[str, Any]
    disclaimer: str

# ----------------------------------------------------
# Stage 2: Natural-Language Intake & Intent Extraction
# ----------------------------------------------------
class ProfileExtractionRequest(BaseModel):
    query: str = Field(..., description="Natural-language description of beneficiary profile and aspirations", min_length=3)

class ExtractedProfileData(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None  # "Female", "Male", "Transgender", "Other"
    social_category: Optional[str] = None  # "SC", "ST", "OBC", "Minority", "General", "EWS"
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    sector: Optional[str] = None
    purpose: Optional[str] = None
    project_cost: Optional[float] = None
    education_level: Optional[str] = None
    course: Optional[str] = None
    is_pwd: Optional[bool] = None

class ProfileExtractionResponse(BaseModel):
    extracted_profile: ExtractedProfileData
    detected_intent: str = "business_finance"  # "business_finance", "micro_finance", "term_loan", "educational_loan", "scheme_information", "scheme_comparison", "partner_information", "unknown"
    intent_display: str = "Income-generating business / Term Loan"
    confidence_score: float = 0.0  # 0.0 to 1.0
    summary_interpretation: str = ""
    missing_critical_fields: List[str] = []
    uncertain_fields: List[str] = []
    ready_for_matching: bool = False
    provider_used: str = "Gemini"

# ----------------------------------------------------
# Stage 3: Grounded Scheme Comparison Models
# ----------------------------------------------------
class SchemeComparisonRequest(BaseModel):
    scheme_ids: List[str] = Field(..., min_length=1, max_length=5, description="List of scheme IDs to compare")
    user_context: Optional[str] = Field(None, description="Optional natural-language or demographic context")

class SchemeVerifiedFact(BaseModel):
    scheme_id: str
    scheme_name: str
    issuing_body: str
    purpose: str
    target_beneficiaries: str
    eligibility_summary: str
    project_cost_range: str
    max_loan_amount: str
    interest_rate_percent: str
    tenure_years: str
    moratorium_months: str
    margin_percent: str
    subsidy_percent: str
    restrictions: List[str] = []
    channel_partners: List[str] = []
    official_source: str
    verification_date: str

class SchemeComparisonResponse(BaseModel):
    compared_schemes: List[SchemeVerifiedFact]
    key_differences: List[str]
    suitability_guidance: str
    tradeoff_summary: Dict[str, str] = {}
    evidence_sources: List[Dict[str, str]] = []
    missing_or_invalid_ids: List[str] = []
    ai_disclaimer: str
    provider_used: str

# ----------------------------------------------------
# Real Semantic Search & AI Architecture Models
# ----------------------------------------------------
class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Natural-language requirement or business description")
    top_k: int = Field(5, ge=1, le=20)
    category_filter: Optional[str] = None
    loan_category_filter: Optional[str] = None

class SemanticSearchResultItem(BaseModel):
    scheme_id: str
    scheme_name: str
    similarity_score: float  # Hybrid fusion score [0, 100]
    gemini_similarity: float
    hf_similarity: float
    lexical_score: float
    loan_category: str
    purpose: str
    summary: str
    semantic_evidence: str
    source_metadata: Dict[str, Any]

class SemanticSearchResponse(BaseModel):
    query: str
    total_found: int
    results: List[SemanticSearchResultItem]
    providers_used: Dict[str, str]

class AIProviderStatusResponse(BaseModel):
    gemini_status: str  # "ACTIVE" or "FALLBACK"
    gemini_generative_model: str
    gemini_embedding_model: str
    huggingface_status: str  # "ACTIVE" or "FALLBACK"
    huggingface_model: str
    rag_status: str  # "ACTIVE"
    rules_engine_status: str  # "ACTIVE (AUTHORITATIVE)"
    active_providers_summary: str
