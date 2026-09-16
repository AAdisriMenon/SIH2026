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
    business_idea: str = Field(default="Tailoring and boutique micro business")
    business_sector: str = Field(default="Tailoring/Garments")
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
    semantic_score: float = 0.0  # 0 to 100
    composite_rank_score: float = 0.0
    verdicts: List[RuleClauseResult] = []
    borderline_guidance: List[str] = []
    financial_summary: Dict[str, Any] = {}
    documents: List[Dict[str, Any]] = []
    application_process: List[str] = []
    official_url: str = ""
    last_verified: str = ""

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
    interest_rate_percent: float = 6.0
    tenure_years: int = 5

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
