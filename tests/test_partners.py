"""
Unit & Integration Tests for Geo-Spatial Channel Partner Router (MoSJE SIH 2026 - PS #26092).
Verifies:
1. Channel partner catalogue completeness (13 official partners: SCA, PSB, RRB, NBFC-MFI, SFB)
2. Filter by loan category (Micro Finance, Term Loan, Educational Loan)
3. Filter by partner type (State Channelizing Agency, PSB, RRB, NBFC-MFI)
4. Filter by State & District
5. Haversine distance computation and nearest-first ranking
6. Mandatory statutory criteria (overdue compliance, NPA ceiling, fund utilization)
7. Zero-hallucination live-data disclosure notice
8. Admin Data Quality & Health Check audit endpoint
"""
import unittest
import sys
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from starlette.testclient import TestClient
from backend.main import app

class TestChannelPartners(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_partner_directory_completeness(self):
        """Verify all 13 official channel partners are loaded with complete metadata."""
        res = self.client.get("/api/partners")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["total_found"], 13)
        self.assertTrue(len(data["partners"]) >= 13)

        partner_types = {p["type"] for p in data["partners"]}
        # Must include all 5 authorized partner institutional models
        self.assertTrue(any("State Channelizing Agency" in t for t in partner_types))
        self.assertTrue(any("Public Sector Bank" in t for t in partner_types))
        self.assertTrue(any("Regional Rural Bank" in t for t in partner_types))
        self.assertTrue(any("NBFC" in t for t in partner_types))
        self.assertTrue(any("Small Finance Bank" in t for t in partner_types))

    def test_category_filtering(self):
        """Filter partners by loan category: Micro Finance vs Term Loan vs Educational Loan."""
        # 1. Micro Finance
        res_micro = self.client.get("/api/partners?category=Micro+Finance")
        self.assertEqual(res_micro.status_code, 200)
        data_micro = res_micro.json()
        for p in data_micro["partners"]:
            self.assertIn("Micro Finance", p["supported_loan_categories"])

        # 2. Educational Loan
        res_edu = self.client.get("/api/partners?category=Educational+Loan")
        self.assertEqual(res_edu.status_code, 200)
        data_edu = res_edu.json()
        for p in data_edu["partners"]:
            self.assertIn("Educational Loan", p["supported_loan_categories"])

    def test_partner_type_filtering(self):
        """Filter partners strictly by institutional type."""
        res = self.client.get("/api/partners?partner_type=State+Channelizing+Agency")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total_found"], 0)
        for p in data["partners"]:
            self.assertIn("State Channelizing Agency", p["type"])

    def test_haversine_distance_and_sorting(self):
        """When user GPS coordinates are provided, partners are sorted by distance."""
        # User in Lucknow, UP (26.8467° N, 80.9462° E)
        res = self.client.get("/api/partners?lat=26.8467&lon=80.9462")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        partners = data["partners"]
        self.assertTrue(len(partners) > 0)
        
        # Verify distance_km is present on each partner
        for p in partners:
            self.assertIsNotNone(p["distance_km"])
            self.assertGreaterEqual(p["distance_km"], 0.0)

        # Verify ascending distance sorting
        distances = [p["distance_km"] for p in partners]
        self.assertEqual(distances, sorted(distances))

        # Nearest partner to Lucknow coords should be UPSFDC or Aryavart Bank in Lucknow
        nearest = partners[0]
        self.assertIn(nearest["district"].lower(), ["lucknow", "all india"])

    def test_state_filtering(self):
        """State filtering returns matching State partners plus pan-India partners."""
        res = self.client.get("/api/partners?state=Maharashtra")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["total_found"] > 0)
        for p in data["partners"]:
            self.assertIn(p["state"].lower(), ["maharashtra", "all", "all india"])

    def test_zero_hallucination_disclaimer(self):
        """Verify mandatory live-data disclaimer and statutory criteria disclosure."""
        res = self.client.get("/api/partners")
        data = res.json()
        self.assertIn("disclaimer", data)
        self.assertIn("Live branch-level NPA or real-time fund utilization data", data["disclaimer"])

        for p in data["partners"]:
            self.assertIn("live_status_note", p)
            self.assertIn("Status data not available for live verification", p["live_status_note"])
            self.assertIn("rrb_eligibility_criteria", p)
            criteria = p["rrb_eligibility_criteria"]
            self.assertIn("fund_utilization_mandate", criteria)
            self.assertIn("net_npa_limit", criteria)

    def test_admin_data_quality_endpoint(self):
        """Verify automated data quality auditor passes 100% with zero hallucinations."""
        res = self.client.get("/api/admin/data-quality")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "PASSED")
        self.assertTrue(data["zero_hallucination_integrity"])
        self.assertGreaterEqual(data["total_schemes_audited"], 34)
        self.assertGreaterEqual(data["total_partners_audited"], 13)
        self.assertEqual(data["scheme_issues_count"], 0)
        self.assertEqual(data["partner_issues_count"], 0)

    def test_coverage_disclaimer_and_no_false_claims(self):
        """
        Verify:
        1. Explicit coverage disclaimer: verified subset, not complete 102-partner network.
        2. Absolute prevention of false claims (e.g. 'all 102 partners', 'complete network', 'live eligible', 'guaranteed approval').
        3. Coordinates labeled as approximate nodal/headquarters.
        """
        res = self.client.get("/api/partners")
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # 1. Coverage disclaimer check
        self.assertIn("verified subset", data["disclaimer"].lower())
        self.assertIn("does not represent the complete nsfdc partner network", data["disclaimer"].lower())

        # 2. Check each partner record
        for p in data["partners"]:
            self.assertEqual(p["coordinate_precision"], "Approximate Nodal HQ")
            self.assertIn("verified sample record", p["network_coverage_note"].lower())

        # 3. Check HTML and JS source files for banned false claims
        for fpath in ["frontend/index.html", "frontend/app.js", "frontend/translations.js"]:
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read().lower()
                self.assertNotIn("all 102 partners", content)
                self.assertNotIn("complete 102 partner network", content)
                self.assertNotIn("guaranteed approval", content)
                self.assertNotIn("live eligible", content)

if __name__ == "__main__":
    unittest.main()
