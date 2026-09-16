"""
Unit Tests for Financial & Live EMI Calculator (MoSJE SIH 2026).
Verifies:
1. Promoter Margin Contribution
2. Capital Subsidy Application & Caps
3. Reducing-Balance EMI Formula Accuracy
4. Year-by-Year Amortization Schedule Continuity
5. Zero Interest Rate Edge Cases
"""
import unittest
import sys
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.calculator import calculate_finance

class TestCalculator(unittest.TestCase):
    def test_standard_emi_calculation(self):
        """Verify reducing-balance EMI against standard mathematical benchmark."""
        # Principal: ₹1,00,000, Rate: 6.0% p.a., Tenure: 5 years (60 months), Margin: 0%, Subsidy: 0%
        res = calculate_finance(
            project_cost=100000.0,
            custom_margin_pct=0.0,
            custom_subsidy_pct=0.0,
            interest_rate_pct=6.0,
            tenure_years=5
        )
        
        self.assertEqual(res.loan_amount, 100000.0)
        # Standard benchmark for ₹1L at 6% for 5y is ₹1,933.28
        self.assertAlmostEqual(res.monthly_emi, 1933.28, delta=1.0)
        self.assertAlmostEqual(res.total_repayment, 1933.28 * 60, delta=10.0)
        self.assertAlmostEqual(res.total_interest, 15996.80, delta=10.0)

    def test_margin_and_subsidy(self):
        """Verify margin money and subsidy deductions from loan principal."""
        # Cost: ₹5,00,000, Margin: 10% (₹50k), Subsidy: 35% (₹1,75,000)
        # Expected Loan = 5,00,000 - 50,000 - 1,75,000 = ₹2,75,000
        res = calculate_finance(
            project_cost=500000.0,
            custom_margin_pct=10.0,
            custom_subsidy_pct=35.0,
            interest_rate_pct=8.5,
            tenure_years=5
        )

        self.assertEqual(res.margin_money_amount, 50000.0)
        self.assertEqual(res.subsidy_amount, 175000.0)
        self.assertEqual(res.loan_amount, 275000.0)
        self.assertTrue(res.monthly_emi > 0)

    def test_amortization_schedule(self):
        """Verify year-by-year amortization continuity."""
        res = calculate_finance(
            project_cost=200000.0,
            custom_margin_pct=10.0,
            custom_subsidy_pct=0.0,
            interest_rate_pct=5.0,
            tenure_years=3
        )
        
        self.assertEqual(len(res.yearly_schedule), 3)
        # Opening balance of year 1 must match loan amount
        self.assertEqual(res.yearly_schedule[0].opening_balance, res.loan_amount)
        # Closing balance of final year must reach 0
        self.assertAlmostEqual(res.yearly_schedule[-1].closing_balance, 0.0, delta=1.0)

    def test_zero_interest_scheme(self):
        """Verify 0% interest rate (e.g. Mahila Coir equipment subsidy)."""
        res = calculate_finance(
            project_cost=50000.0,
            custom_margin_pct=10.0,
            custom_subsidy_pct=0.0,
            interest_rate_pct=0.0,
            tenure_years=2
        )
        
        # Loan = ₹45,000, months = 24 -> EMI = 45000 / 24 = ₹1,875.0
        self.assertEqual(res.monthly_emi, 1875.0)
        self.assertEqual(res.total_interest, 0.0)
        self.assertEqual(res.total_repayment, 45000.0)

    def test_moratorium_handling(self):
        """Verify moratorium months, explanatory note, and loan category deduction."""
        # 1. Micro Finance with 6 months moratorium
        res_micro = calculate_finance(
            project_cost=100000.0,
            moratorium_months=6,
            interest_rate_pct=5.0,
            tenure_years=3
        )
        self.assertEqual(res_micro.moratorium_months, 6)
        self.assertEqual(res_micro.loan_category, "Micro Finance")
        self.assertIn("6 Months Repayment Moratorium", res_micro.moratorium_note)

        # 2. Educational Loan with official moratorium wording
        res_edu = calculate_finance(
            project_cost=1500000.0,
            moratorium_months=12,
            interest_rate_pct=6.5,
            tenure_years=10,
            loan_category="Educational Loan"
        )
        self.assertEqual(res_edu.moratorium_months, 12)
        self.assertEqual(res_edu.loan_category, "Educational Loan")
        self.assertIn("Course duration + 1 year, or up to 6 months where repayment has started", res_edu.moratorium_note)

if __name__ == "__main__":
    unittest.main()
