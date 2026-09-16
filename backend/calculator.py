"""
Interactive Financial Calculator (MoSJE SIH 2026).
Computes Promoter Margin, Capital Subsidy, Concessional Loan,
and Reducing-Balance Monthly EMI Amortization Schedule.
"""
from typing import Dict, Any, List, Optional
from .models import FinancialCalculationRequest, FinancialCalculationResult, AmortizationYear

def calculate_finance(
    project_cost: float,
    scheme_financials: Optional[Dict[str, Any]] = None,
    custom_margin_pct: Optional[float] = None,
    custom_subsidy_pct: Optional[float] = None,
    interest_rate_pct: float = 8.0,
    tenure_years: int = 7,
    moratorium_months: Optional[int] = None,
    loan_category: Optional[str] = None
) -> FinancialCalculationResult:
    """
    Computes reducing-balance EMI, capital subsidy, promoter margin contribution,
    moratorium tenure, and year-by-year amortization.
    """
    sf = scheme_financials or {}

    # 1. Determine Margin Money Amount
    margin_pct = custom_margin_pct if custom_margin_pct is not None else sf.get("margin_money_percent", 10.0)
    margin_amount = round(project_cost * (margin_pct / 100.0), 2)

    # 2. Determine Capital Subsidy
    subsidy_pct = custom_subsidy_pct if custom_subsidy_pct is not None else sf.get("subsidy_percent", 0.0)
    max_subsidy_cap = sf.get("max_subsidy_amount", 0.0)
    
    raw_subsidy = project_cost * (subsidy_pct / 100.0)
    if max_subsidy_cap > 0:
        subsidy_amount = round(min(raw_subsidy, max_subsidy_cap), 2)
    else:
        subsidy_amount = round(raw_subsidy, 2)

    # 3. Determine Sanctioned Loan Amount
    max_loan_cap = sf.get("max_loan_amount", 50000000.0)
    calculated_loan = max(0.0, project_cost - margin_amount - subsidy_amount)
    loan_amount = round(min(calculated_loan, max_loan_cap), 2)

    # 4. Interest Rate & Tenure
    if "interest_rate_percent" in sf and custom_margin_pct is None and custom_subsidy_pct is None:
        effective_rate = sf.get("interest_rate_percent", interest_rate_pct)
    else:
        effective_rate = interest_rate_pct

    tenure_y = max(1, min(tenure_years, sf.get("max_tenure_years", 10)))
    total_months = tenure_y * 12

    # 5. Moratorium & Category Handling (PS #26092 Micro Finance <= 1.40L vs Term Loan)
    moratorium_m = moratorium_months if moratorium_months is not None else sf.get("moratorium_months", 0)
    loan_cat = loan_category or sf.get("loan_category") or ("Micro Finance" if loan_amount <= 140000.0 else "Term Loan")
    
    if loan_cat == "Educational Loan":
        moratorium_note = "Course duration + 1 year, or up to 6 months where repayment has started"
    elif moratorium_m > 0:
        moratorium_note = f"{moratorium_m} Months Repayment Moratorium (Repayment holiday post-sanction)"
    else:
        moratorium_note = "Standard monthly repayment cycle without moratorium"

    # 6. Reducing Balance Monthly EMI calculation
    if loan_amount <= 0:
        monthly_emi = 0.0
        total_interest = 0.0
        total_repayment = 0.0
        yearly_schedule = []
    elif effective_rate <= 0:
        monthly_emi = round(loan_amount / total_months, 2)
        total_interest = 0.0
        total_repayment = loan_amount
        yearly_schedule = _build_amortization(loan_amount, 0.0, tenure_y, monthly_emi)
    else:
        monthly_rate = (effective_rate / 100.0) / 12.0
        emi_factor = (1.0 + monthly_rate) ** total_months
        monthly_emi = round(loan_amount * monthly_rate * (emi_factor / (emi_factor - 1.0)), 2)
        total_repayment = round(monthly_emi * total_months, 2)
        total_interest = round(max(0.0, total_repayment - loan_amount), 2)
        yearly_schedule = _build_amortization(loan_amount, monthly_rate, tenure_y, monthly_emi)

    return FinancialCalculationResult(
        project_cost=project_cost,
        margin_money_amount=margin_amount,
        margin_money_percent=margin_pct,
        subsidy_amount=subsidy_amount,
        subsidy_percent=subsidy_pct,
        loan_amount=loan_amount,
        monthly_emi=monthly_emi,
        total_interest=total_interest,
        total_repayment=total_repayment,
        tenure_years=tenure_y,
        interest_rate_percent=effective_rate,
        moratorium_months=moratorium_m,
        moratorium_note=moratorium_note,
        loan_category=loan_cat,
        yearly_schedule=yearly_schedule
    )

def _build_amortization(principal: float, monthly_rate: float, tenure_years: int, monthly_emi: float) -> List[AmortizationYear]:
    """Builds year-by-year amortization breakdown."""
    schedule = []
    balance = principal
    
    for year in range(1, tenure_years + 1):
        opening = balance
        year_principal = 0.0
        year_interest = 0.0
        
        for _ in range(12):
            if balance <= 0:
                break
            interest_month = balance * monthly_rate
            principal_month = min(balance, monthly_emi - interest_month)
            if principal_month < 0:
                principal_month = 0.0
            
            year_interest += interest_month
            year_principal += principal_month
            balance -= principal_month

        closing = max(0.0, round(balance, 2))
        schedule.append(AmortizationYear(
            year=year,
            opening_balance=round(opening, 2),
            principal_paid=round(year_principal, 2),
            interest_paid=round(year_interest, 2),
            closing_balance=closing
        ))
        
    return schedule
