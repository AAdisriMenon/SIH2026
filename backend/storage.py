"""
Scheme Data Storage & Dynamic Administration (MoSJE SIH 2026).
Supports runtime scheme CRUD, rule threshold modifications,
and privacy-preserving anonymized analytics logging (FR13, FR14, FR16).
"""
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "schemes_seed.json")

class SchemeStorage:
    def __init__(self, data_path: str = DATA_PATH):
        self.data_path = data_path
        self.schemes: List[Dict[str, Any]] = []
        self.analytics_events: List[Dict[str, Any]] = []
        self.audit_log: List[Dict[str, Any]] = []
        self.load()

    def load(self):
        if os.path.exists(self.data_path):
            with open(self.data_path, "r", encoding="utf-8") as f:
                self.schemes = json.load(f)
        else:
            self.schemes = []

    def save(self):
        with open(self.data_path, "w", encoding="utf-8") as f:
            json.dump(self.schemes, f, indent=2, ensure_ascii=False)

    def get_all(self, active_only: bool = False) -> List[Dict[str, Any]]:
        if active_only:
            return [s for s in self.schemes if s.get("is_active", True)]
        return self.schemes

    def get_by_id(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        for s in self.schemes:
            if s["id"] == scheme_id:
                return s
        return None

    def update_rules(self, scheme_id: str, updates: Dict[str, Any], auditor: str = "Admin") -> Optional[Dict[str, Any]]:
        scheme = self.get_by_id(scheme_id)
        if not scheme:
            return None

        rules = scheme.setdefault("rules", {})
        financials = scheme.setdefault("financials", {})
        
        # Apply rule updates
        if "income_ceiling" in updates and updates["income_ceiling"] is not None:
            rules["income_ceiling"] = float(updates["income_ceiling"])
        if "max_project_cost" in updates and updates["max_project_cost"] is not None:
            rules["max_project_cost"] = float(updates["max_project_cost"])
        if "interest_rate_percent" in updates and updates["interest_rate_percent"] is not None:
            financials["interest_rate_percent"] = float(updates["interest_rate_percent"])
        if "subsidy_percent" in updates and updates["subsidy_percent"] is not None:
            financials["subsidy_percent"] = float(updates["subsidy_percent"])
        if "is_active" in updates and updates["is_active"] is not None:
            scheme["is_active"] = bool(updates["is_active"])

        # Timestamp and audit entry
        today_str = datetime.now().strftime("%Y-%m-%d")
        scheme["last_verified"] = today_str
        self.audit_log.append({
            "timestamp": datetime.now().isoformat(),
            "scheme_id": scheme_id,
            "scheme_name": scheme["name"],
            "auditor": auditor,
            "changes": updates
        })

        self.save()
        return scheme

    def log_match_event(self, category: str, gender: str, sector: str, income: float, cost: float, eligible_count: int):
        """FR16: Anonymized uptake logging without personally identifiable data."""
        self.analytics_events.append({
            "timestamp": datetime.now().isoformat(),
            "category": category,
            "gender": gender,
            "sector": sector,
            "income_bracket": self._income_bracket(income),
            "cost_bracket": self._cost_bracket(cost),
            "eligible_count": eligible_count
        })

    def get_analytics(self) -> Dict[str, Any]:
        total_evaluations = len(self.analytics_events)
        category_counts: Dict[str, int] = {}
        sector_counts: Dict[str, int] = {}
        gender_counts: Dict[str, int] = {}
        
        for ev in self.analytics_events:
            c = ev["category"]
            category_counts[c] = category_counts.get(c, 0) + 1
            s = ev["sector"]
            sector_counts[s] = sector_counts.get(s, 0) + 1
            g = ev["gender"]
            gender_counts[g] = gender_counts.get(g, 0) + 1

        return {
            "total_matches_run": total_evaluations,
            "total_schemes_configured": len(self.schemes),
            "demographic_distribution": category_counts,
            "popular_sectors": sector_counts,
            "gender_distribution": gender_counts,
            "recent_audit_trail": self.audit_log[-10:]
        }

    def _income_bracket(self, inc: float) -> str:
        if inc <= 150000:
            return "Below ₹1.5L (BPL/Low)"
        elif inc <= 300000:
            return "₹1.5L - ₹3.0L (Concessional Band)"
        elif inc <= 800000:
            return "₹3.0L - ₹8.0L (Middle/Credit Line 2)"
        return "Above ₹8.0L"

    def _cost_bracket(self, cost: float) -> str:
        if cost <= 50000:
            return "Micro/Shishu (Up to ₹50k)"
        elif cost <= 500000:
            return "Kishore/Small (₹50k - ₹5L)"
        elif cost <= 2500000:
            return "Tarun/Medium (₹5L - ₹25L)"
        return "Large/Greenfield (Above ₹25L)"
