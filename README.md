# MoSJE AI-Driven Scheme Matching Platform
**Smart India Hackathon 2026 — Problem Statement #26092**  
**Ministry:** Ministry of Social Justice and Empowerment (MoSJE)  
**Theme:** Smart Automation | **Category:** Software

An AI-driven, explainable, zero-hallucination platform that matches marginalised entrepreneurs (SC, ST, OBC, Minorities, Women, and Persons with Benchmark Disabilities / Divyangjan) to verified central and state government concessional finance schemes.

---

## Key Highlights

1. **Deterministic Zero-Authority Rules Engine**:
   - 100% auditable, clause-by-clause explainability (`PASS`, `BORDERLINE`, `FAIL`).
   - Zero hallucination guarantee: eligibility verdicts are derived strictly from deterministic rule evaluation against official guidelines, never language-model inference.

2. **Semantic Ranking Layer**:
   - Hybrid TF-IDF vector similarity and sector-boost ranking that orders eligible schemes based on relevance to the entrepreneur's stated business description.

3. **Curated Seed Knowledge Base (32 Verified Schemes)**:
   - **NSFDC**: Term Loan, Mahila Samriddhi Yojana (MSY), Micro Credit Finance (MCF), Green Business Scheme, Laghu Vyavasay Yojana (LVY), Mahila Adhikarita Yojana (MAY).
   - **NBCFDC**: New Swarnima for Women, General Term Loan, Shilp Sampada for Artisans, Saksham for Young Professionals, Krishi Sampada.
   - **NHFDC / DEPwD**: Divyangjan Swavalamban Yojana, Micro Credit Scheme for PwD, Scheme for Young Professionals with Disabilities, Assistive Device / Retrofitted Commercial Vehicle Loans.
   - **NMDFC**: Term Loan Scheme (Credit Line 1 & Line 2), Virasat Scheme for Artisans, Mahila Samridhi, Micro Financing Scheme.
   - **Flagship Central Programs**: PMEGP (KVIC), Stand-Up India (DFS/SIDBI), PM MUDRA Yojana (Shishu, Kishore, Tarun), PM Vishwakarma, PM SVANidhi, CGTMSE Guarantee, Venture Capital Fund for SC (VCF-SC), Mahila Coir Yojana, SIDBI Mahila Udyam Nidhi, Dr. B.R. Ambedkar Special Assistance Scheme.

4. **Live Reducing-Balance Financial & EMI Calculator**:
   - Dynamic promoter margin money %, capital subsidy %, and concessional loan amounts.
   - Live reducing-balance EMI schedule with interactive project cost and tenure sliders.
   - Year-by-year amortization breakdown.

5. **Grounded Conversational RAG Assistant**:
   - Scheme Q&A strictly constrained to verified official guidelines.
   - Mandatory source citations on every response (`[Source: {Scheme} - {Clause}]`).
   - Refusal safeguards for out-of-scope or speculative queries.

6. **Accessibility & Multilingual UI (WCAG 2.1 AA)**:
   - Available in **English**, **Hindi (हिंदी)**, **Marathi (मराठी)**, and **Tamil (தமிழ்)**.
   - **Speech-to-Text (STT)**: Voice profile dictation via Web Speech API.
   - **Text-to-Speech (TTS)**: Voice readout of scheme summaries in chosen regional language.

7. **Admin Console & Verification Auditing**:
   - Dynamic rule editing (income ceilings, interest rates, cost bands) without redeploying code.
   - Privacy-preserving, anonymized uptake analytics logging (FR16).
   - One-click WhatsApp sharing and clean printable PDF export.

---

## Project Structure

```
SIH/
├── PRD.md                        # Official Product Requirements Document
├── requirements.txt              # Dependencies
├── run.py                        # Root server startup launcher
├── backend/
│   ├── main.py                   # FastAPI REST API & PWA static delivery
│   ├── models.py                 # Pydantic v2 schemas
│   ├── rules_engine.py           # Deterministic eligibility evaluator & explainability
│   ├── semantic_ranker.py        # TF-IDF & keyword relevance ranker
│   ├── calculator.py             # Subsidy, margin, & reducing-balance EMI engine
│   ├── assistant.py              # Grounded RAG conversational assistant
│   ├── storage.py                # Scheme CRUD, dynamic rule edits, & analytics
│   └── data/
│       ├── schemes_seed.json     # 32 verified schemes database
│       └── seed_builder.py       # Seed dataset compiler
├── frontend/
│   ├── index.html                # High-contrast accessible Single-Page Application
│   ├── app.js                    # Web Speech STT/TTS, reactive state, live calculators
│   ├── translations.js           # Multilingual dictionary (EN, HI, MR, TA)
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service Worker for offline shell caching
└── tests/
    ├── test_rules_engine.py      # Unit tests across 4 PRD personas & borderline buffer
    ├── test_calculator.py        # Benchmark tests for EMI & amortization formulas
    ├── test_assistant.py         # Grounded RAG citation & refusal tests
    ├── test_api.py               # Integration tests for FastAPI endpoints
    └── run_tests.py              # Single-command test runner
```

---

## Quick Start

### 1. Run Automated Test Suite
Verify all unit and integration tests:
```powershell
python tests/run_tests.py
```

### 2. Launch the Application Server
Start the unified FastAPI server and PWA:
```powershell
python run.py
```
- Open your browser at: **`http://localhost:8000`**
- Interactive Swagger API Documentation: **`http://localhost:8000/docs`**

---

## Verified Target Personas (SIH PRD Section 4)

| Persona | Demographics & Business | Target Schemes Matched |
|---|---|---|
| **Rekha, 34** | OBC Woman, Tailoring micro-business, ₹1.5L Income, ₹1.5L Cost | NBCFDC New Swarnima, PMEGP, MUDRA Kishore, PM Vishwakarma (Tailoring Trade), SIDBI Mahila Udyam Nidhi |
| **Suresh, 41** | SC Male, Workshop & metal fabrication, ₹2.5L Income, ₹5L Cost | NSFDC Term Loan, NSFDC Green Business, NSFDC LVY, PMEGP, Dr. Ambedkar Special Assistance |
| **Imran, 29** | Minority Male, Traditional brassware artisan, ₹1.8L Income, ₹1.5L Cost | NMDFC Virasat Scheme, NMDFC Term Loan Line 1, NMDFC Micro Finance, PM Vishwakarma |
| **Anita, 26** | PwD (50% Benchmark Disability), Woman, Home Crafts & Kiosk, ₹1.0L Income, ₹70k Cost | NHFDC Micro Credit Scheme for PwD, PM Vishwakarma, Mahila Coir Yojana, SIDBI Mahila Udyam Nidhi |

---

## Architectural Principles

- **Zero-Authority AI**: AI/ML models are used exclusively for semantic ranking and conversational assistance. Eligibility verdicts (`ELIGIBLE`, `BORDERLINE`, `INELIGIBLE`) are 100% deterministic and trace directly to statutory clauses.
- **Privacy-First**: No mandatory account creation; match events logged for analytics are completely anonymized without storing personally identifiable data.
- **Auditable Scheme Management**: Scheme administrators can update rules and income thresholds dynamically via the admin panel without redeploying code.
