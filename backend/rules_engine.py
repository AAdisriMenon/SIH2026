"""
Deterministic Rules Engine for Scheme Eligibility (MoSJE SIH 2026).
Ensures 100% zero-hallucination, clause-by-clause explainability.
"""
from typing import Dict, Any, List, Tuple
from .models import UserProfile, RuleClauseResult

EDUCATION_LEVELS = {
    "none": 0,
    "class 8": 1,
    "class 10": 2,
    "class 12": 3,
    "graduate": 4,
    "postgraduate": 5
}

def normalize_text(text: str) -> str:
    return (text or "").strip().lower()

def evaluate_scheme(profile: UserProfile, scheme: Dict[str, Any]) -> Tuple[str, List[RuleClauseResult], List[str]]:
    """
    Evaluates a user profile against a scheme's deterministic rules.
    Returns:
      - status: "ELIGIBLE" | "BORDERLINE" | "INELIGIBLE"
      - verdicts: List[RuleClauseResult]
      - borderline_guidance: List[str]
    """
    rules = scheme.get("rules", {})
    verdicts: List[RuleClauseResult] = []
    borderline_guidance: List[str] = []
    
    has_fail = False
    has_borderline = False

    # 1. Social Category & Affirmative Action Group
    target_categories = [c.upper() for c in rules.get("categories", ["ALL"])]
    user_cat = (profile.category or "General").upper()
    
    cat_match = False
    if "ALL" in target_categories or "GENERAL" in target_categories:
        cat_match = True
    elif user_cat in target_categories:
        cat_match = True
    elif "WOMEN" in target_categories and profile.gender.lower() == "female":
        # Scheme explicitly targets women across communities (e.g. Stand-Up India, SIDBI MUN, Mahila Coir)
        cat_match = True
    elif "PWD" in target_categories and profile.is_pwd:
        cat_match = True

    if cat_match:
        verdicts.append(RuleClauseResult(
            criterion="Social Category",
            status="PASS",
            user_value=profile.category,
            scheme_requirement=f"Targeted at: {', '.join(rules.get('categories', []))}",
            reason=f"Applicant category ({profile.category}) qualifies under beneficiary eligibility."
        ))
    else:
        has_fail = True
        verdicts.append(RuleClauseResult(
            criterion="Social Category",
            status="FAIL",
            user_value=profile.category,
            scheme_requirement=f"Reserved for {', '.join(rules.get('categories', []))}",
            reason=f"Applicant belongs to {profile.category}, whereas this scheme is exclusively designated for {', '.join(rules.get('categories', []))} communities."
        ))

    # 2. Gender Criterion
    allowed_genders = [g.lower() for g in rules.get("gender", ["any"])]
    user_gender = profile.gender.lower()
    if "any" in allowed_genders or user_gender in allowed_genders:
        verdicts.append(RuleClauseResult(
            criterion="Gender",
            status="PASS",
            user_value=profile.gender,
            scheme_requirement=f"Allowed: {', '.join(rules.get('gender', []))}",
            reason=f"Applicant gender ({profile.gender}) meets the eligibility requirement."
        ))
    else:
        has_fail = True
        verdicts.append(RuleClauseResult(
            criterion="Gender",
            status="FAIL",
            user_value=profile.gender,
            scheme_requirement=f"Reserved for: {', '.join(rules.get('gender', []))}",
            reason=f"Scheme is exclusively targeted at {', '.join(rules.get('gender', []))} entrepreneurs."
        ))

    # 3. Disability Requirement
    disability_required = rules.get("disability_required", False)
    min_disability_pct = rules.get("min_disability_percent", 40)
    
    if disability_required:
        if profile.is_pwd and (profile.pwd_percent or 40) >= min_disability_pct:
            verdicts.append(RuleClauseResult(
                criterion="Disability (Divyangjan)",
                status="PASS",
                user_value=f"PwD ({profile.pwd_percent or 40}%)",
                scheme_requirement=f"Benchmark disability >= {min_disability_pct}% with UDID card",
                reason=f"Applicant satisfies the benchmark disability requirement ({profile.pwd_percent or 40}% >= {min_disability_pct}%)."
            ))
        elif profile.is_pwd and (profile.pwd_percent or 0) < min_disability_pct:
            has_borderline = True
            borderline_guidance.append(f"Your stated disability is {profile.pwd_percent}%, while statutory benchmark is {min_disability_pct}%. A medical board review or UDID reassessment may qualify you.")
            verdicts.append(RuleClauseResult(
                criterion="Disability (Divyangjan)",
                status="BORDERLINE",
                user_value=f"PwD ({profile.pwd_percent}%)",
                scheme_requirement=f"Benchmark disability >= {min_disability_pct}%",
                reason=f"Disability percentage ({profile.pwd_percent}%) is near the {min_disability_pct}% statutory benchmark."
            ))
        else:
            has_fail = True
            verdicts.append(RuleClauseResult(
                criterion="Disability (Divyangjan)",
                status="FAIL",
                user_value="Non-PwD",
                scheme_requirement="Valid UDID card with >= 40% benchmark disability",
                reason="This scheme is exclusively reserved for Persons with Benchmark Disabilities (Divyangjan)."
            ))
    else:
        verdicts.append(RuleClauseResult(
            criterion="Disability (Divyangjan)",
            status="PASS",
            user_value=f"PwD: {profile.is_pwd}",
            scheme_requirement="Open to all physical ability statuses",
            reason="Scheme has no mandatory disability prerequisite."
        ))

    # 4. Annual Income Ceiling
    income_ceiling = rules.get("income_ceiling", 50000000)
    user_income = profile.annual_income
    
    if user_income <= income_ceiling:
        verdicts.append(RuleClauseResult(
            criterion="Annual Family Income",
            status="PASS",
            user_value=f"₹{user_income:,.0f}",
            scheme_requirement=f"Max ₹{income_ceiling:,.0f} per annum",
            reason=f"Income of ₹{user_income:,.0f} is within the prescribed limit of ₹{income_ceiling:,.0f}."
        ))
    elif user_income <= income_ceiling * 1.15:
        # Borderline: Within 15% of ceiling
        has_borderline = True
        diff = user_income - income_ceiling
        borderline_guidance.append(f"Your family income of ₹{user_income:,.0f} exceeds the ceiling by ₹{diff:,.0f} (within 15% buffer). You may qualify by deducting allowable medical/educational expenses or under Credit Line 2.")
        verdicts.append(RuleClauseResult(
            criterion="Annual Family Income",
            status="BORDERLINE",
            user_value=f"₹{user_income:,.0f}",
            scheme_requirement=f"Ceiling: ₹{income_ceiling:,.0f} (within 15% margin)",
            reason=f"Income ₹{user_income:,.0f} slightly exceeds ₹{income_ceiling:,.0f}; subject to standard deductions or alternative tier."
        ))
    else:
        has_fail = True
        verdicts.append(RuleClauseResult(
            criterion="Annual Family Income",
            status="FAIL",
            user_value=f"₹{user_income:,.0f}",
            scheme_requirement=f"Ceiling: ₹{income_ceiling:,.0f}",
            reason=f"Family income ₹{user_income:,.0f} exceeds the maximum allowable limit of ₹{income_ceiling:,.0f}."
        ))

    # 5. Age Limits
    min_age = rules.get("min_age", 18)
    max_age = rules.get("max_age", 65)
    user_age = profile.age
    
    if min_age <= user_age <= max_age:
        verdicts.append(RuleClauseResult(
            criterion="Age Criteria",
            status="PASS",
            user_value=f"{user_age} years",
            scheme_requirement=f"Between {min_age} and {max_age} years",
            reason=f"Age ({user_age} years) falls within the eligible bracket of {min_age}–{max_age} years."
        ))
    elif (user_age == min_age - 1) or (user_age == max_age + 1):
        has_borderline = True
        borderline_guidance.append(f"Your age ({user_age}) is 1 year from the limit ({min_age}–{max_age}). Age relaxation may apply for special categories or co-borrowers.")
        verdicts.append(RuleClauseResult(
            criterion="Age Criteria",
            status="BORDERLINE",
            user_value=f"{user_age} years",
            scheme_requirement=f"{min_age}–{max_age} years",
            reason=f"Age is on the boundary of the allowed age range ({min_age}–{max_age} years)."
        ))
    else:
        has_fail = True
        verdicts.append(RuleClauseResult(
            criterion="Age Criteria",
            status="FAIL",
            user_value=f"{user_age} years",
            scheme_requirement=f"{min_age}–{max_age} years",
            reason=f"Applicant age ({user_age} years) is outside the eligible range ({min_age}–{max_age} years)."
        ))

    # 6. Project Cost Limits
    min_cost = rules.get("min_project_cost", 0)
    max_cost = rules.get("max_project_cost", 100000000)
    user_cost = profile.project_cost
    
    if min_cost <= user_cost <= max_cost:
        verdicts.append(RuleClauseResult(
            criterion="Project Cost Band",
            status="PASS",
            user_value=f"₹{user_cost:,.0f}",
            scheme_requirement=f"₹{min_cost:,.0f} to ₹{max_cost:,.0f}",
            reason=f"Project cost of ₹{user_cost:,.0f} is within the sanctionable limits of the scheme."
        ))
    elif user_cost < min_cost and user_cost >= min_cost * 0.7:
        has_borderline = True
        borderline_guidance.append(f"Your project cost ₹{user_cost:,.0f} is slightly below the minimum band of ₹{min_cost:,.0f}. You can expand working capital or inventory to qualify.")
        verdicts.append(RuleClauseResult(
            criterion="Project Cost Band",
            status="BORDERLINE",
            user_value=f"₹{user_cost:,.0f}",
            scheme_requirement=f"Min ₹{min_cost:,.0f} - Max ₹{max_cost:,.0f}",
            reason=f"Project cost ₹{user_cost:,.0f} is near the lower threshold of ₹{min_cost:,.0f}."
        ))
    elif user_cost > max_cost and user_cost <= max_cost * 1.25:
        has_borderline = True
        borderline_guidance.append(f"Your project cost ₹{user_cost:,.0f} exceeds maximum scheme cap ₹{max_cost:,.0f}. You can apply for the maximum cap of ₹{max_cost:,.0f} and fund the remaining balance through own equity.")
        verdicts.append(RuleClauseResult(
            criterion="Project Cost Band",
            status="BORDERLINE",
            user_value=f"₹{user_cost:,.0f}",
            scheme_requirement=f"Max ₹{max_cost:,.0f}",
            reason=f"Cost slightly exceeds ₹{max_cost:,.0f}; partial financing up to the cap is viable."
        ))
    else:
        has_fail = True
        verdicts.append(RuleClauseResult(
            criterion="Project Cost Band",
            status="FAIL",
            user_value=f"₹{user_cost:,.0f}",
            scheme_requirement=f"₹{min_cost:,.0f} to ₹{max_cost:,.0f}",
            reason=f"Project cost ₹{user_cost:,.0f} is significantly outside the scheme bracket (₹{min_cost:,.0f} – ₹{max_cost:,.0f})."
        ))

    # 7. Sector Eligibility
    eligible_sectors = [s.lower() for s in rules.get("eligible_sectors", ["all"])]
    user_sector = (profile.business_sector or "").lower()
    
    sector_match = False
    if "all" in eligible_sectors:
        sector_match = True
    else:
        for es in eligible_sectors:
            if es in user_sector or user_sector in es:
                sector_match = True
                break
        # Also check business idea keywords
        idea_lower = (profile.business_idea or "").lower()
        for es in eligible_sectors:
            if any(k in idea_lower for k in es.split('/')):
                sector_match = True
                break

    if sector_match:
        verdicts.append(RuleClauseResult(
            criterion="Business Sector",
            status="PASS",
            user_value=profile.business_sector,
            scheme_requirement=f"Supported sectors: {', '.join(rules.get('eligible_sectors', []))}",
            reason=f"Applicant's proposed activity ({profile.business_sector}) is recognized under this scheme."
        ))
    else:
        has_borderline = True
        borderline_guidance.append(f"Scheme focuses on {', '.join(rules.get('eligible_sectors', []))}. You may align your proposal under related service or trading categories.")
        verdicts.append(RuleClauseResult(
            criterion="Business Sector",
            status="BORDERLINE",
            user_value=profile.business_sector,
            scheme_requirement=f"Target sectors: {', '.join(rules.get('eligible_sectors', []))}",
            reason=f"Proposed sector ({profile.business_sector}) may require re-classification under eligible activities."
        ))

    # 8. Minimum Education
    min_edu_str = rules.get("min_education", "None")
    user_edu_str = profile.education or "None"
    
    min_edu_val = EDUCATION_LEVELS.get(min_edu_str.lower(), 0)
    user_edu_val = EDUCATION_LEVELS.get(user_edu_str.lower(), 1)
    
    if user_edu_val >= min_edu_val:
        verdicts.append(RuleClauseResult(
            criterion="Minimum Education",
            status="PASS",
            user_value=profile.education,
            scheme_requirement=f"Minimum required: {min_edu_str}",
            reason=f"Educational attainment ({profile.education}) satisfies requirement ({min_edu_str})."
        ))
    else:
        has_fail = True
        verdicts.append(RuleClauseResult(
            criterion="Minimum Education",
            status="FAIL",
            user_value=profile.education,
            scheme_requirement=f"Minimum required: {min_edu_str}",
            reason=f"Applicant education ({profile.education}) does not meet the mandatory qualification of {min_edu_str}."
        ))

    # Determine Final Status
    if has_fail:
        final_status = "INELIGIBLE"
    elif has_borderline:
        final_status = "BORDERLINE"
    else:
        final_status = "ELIGIBLE"

    return final_status, verdicts, borderline_guidance
