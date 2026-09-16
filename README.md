# MoSJE / NSFDC Smart Scheme Matching Platform
**Smart India Hackathon 2026 — Problem Statement #26092**  
**Ministry:** Ministry of Social Justice and Empowerment (MoSJE)  
**Implementing Agency:** National Scheduled Castes Finance and Development Corporation (NSFDC)  
**Theme:** Smart Automation | **Category:** Software  
**Platform Classification:** Hybrid Explainable AI Scheme Recommendation & Channel Partner Routing Platform

---

## 1. Problem Statement & Executive Summary

### Problem Statement #26092
Marginalised citizens (Scheduled Castes, Scheduled Tribes, Other Backward Classes, Minorities, Women, and Persons with Benchmark Disabilities / Divyangjan) face systemic hurdles in accessing government concessional credit and social welfare:
1. **Information Asymmetry & Scheme Opacity:** Over 34 concessional credit schemes and 41 allied welfare programs exist, each with nuanced income ceilings, project cost caps, sector restrictions, promoter margin requirements, and moratorium windows. Beneficiaries struggle to identify suitable schemes.
2. **Channel Partner Misrouting:** Even after identifying a scheme, applicants do not know *where* to apply. Schemes are implemented through diverse institutional intermediaries: State Channelising Agencies (SCAs), Public Sector Banks (PSBs), Regional Rural Banks (RRBs), NBFC-MFIs, and Small Finance Banks (SFBs). Many applicants face rejection simply for applying at unauthorized or non-participating institutions.
3. **Language & Literacy Barriers:** Complex administrative terminology in standard English/Hindi forms excludes regional applicants across India.
4. **Chatbot Hallucination Risk:** Standard generative chatbots frequently invent eligibility criteria, fabricate loan amounts, hallucinate non-existent subsidies, and mislead vulnerable citizens.

### Our Solution
A **Hybrid Explainable AI Scheme Recommendation Platform** adhering to the **Zero-Authority AI Principle**:
- **Zero-Authority AI:** Language models interpret natural-language requests and extract structured profiles, but **NEVER decide statutory eligibility**.
- **100% Deterministic Rules Engine:** Evaluates statutory age, gender, social category, income ceiling (with 15% borderline buffer), project cost ceiling, and sector constraints with clause-by-clause audit trails.
- **Provider-Agnostic Multi-Model Semantic Ranking:** Dense vector embeddings using Google Gemini Embedding 2 (GA Sept 2026), open-source Hugging Face MiniLM (`sentence-transformers/all-MiniLM-L6-v2`), and lexical TF-IDF.
- **Geo-Spatial Channel Partner Routing:** Computes Haversine great-circle distance to 13 verified institutional channel partners and matches loan categories.
- **Live Reducing-Balance Financial Calculator:** Computes exact EMI, promoter margin money, and capital subsidy deductions with statutory moratoria (including NSFDC Educational Loan course duration + 1 year rule).
- **Pan-India 23-Language Multilingual UI:** Full localization across English + all 22 Eighth Schedule Indian languages with Web Speech voice STT/TTS.

---

## 2. System Architecture & 9-Step Recommendation Pipeline

```
[Beneficiary]
      │ (Free-text requirement or Regional Voice STT)
      ▼
┌────────────────────────────────────────────────────────┐
│ 1. BENEFICIARY INTAKE                                  │
│ Natural-language need description via Text or Voice    │
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ 2. DUAL-LLM NLU EXTRACTION                             │
│ Gemini 3.8 Flash (GA) & Hugging Face Provider          │
│ Extracts Demographics, Financials & Intent Taxonomy    │
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ 3. PYDANTIC TYPE-SAFE VALIDATION                       │
│ Strict schema bounds: Age [16-100], Income, Cost       │
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ 4. HUMAN-IN-THE-LOOP (HITL) CONFIRMATION              │
│ "Here's what I understood" editable review card       │
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ 5. DETERMINISTIC STATUTORY RULES ENGINE               │
│ backend/rules_engine.py (100% Authoritative)          │
│ Partitions schemes: ELIGIBLE / BORDERLINE / INELIGIBLE │
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ 6. MULTI-MODEL SEMANTIC RANKING (HYBRID FUSION)        │
│ 0.60 Gemini Emb-2 + 0.25 HF MiniLM + 0.15 Lexical TF   │
│ Hard Gating: +1000 Eligible, +500 Borderline           │
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ 7. FINANCIAL VIABILITY VERIFICATION                    │
│ Reducing-balance amortization, Margin & Subsidy check  │
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ 8. GEODESIC CHANNEL PARTNER ROUTING                    │
│ Haversine formula to 13 verified institutional partners│
└─────────────────────────┬──────────────────────────────┘
                          ▼
┌────────────────────────────────────────────────────────┐
│ 9. EXPLAINABLE RECOMMENDATION & EXPORT                 │
│ Clause-level audit trail, Why-Matched & WhatsApp/PDF   │
└────────────────────────────────────────────────────────┘
```

### The 9-Step Recommendation Flow:
1. **Beneficiary Intake:** Beneficiary provides their need in natural language via text input or voice STT in any of 23 supported Indian languages.
2. **Dual-LLM NLU Extraction:** Multi-provider NLU extracts explicit demographic attributes, financial numbers, and operational intent (`micro_finance`, `term_loan`, `educational_loan`, `scheme_information`, `partner_information`, `calculator`).
3. **Pydantic Validation:** Strict schema enforcement ensures numerical boundaries and flags missing critical fields (`social_category`, `gender`, `annual_income`, `state`, `project_cost`).
4. **Human-in-the-Loop Confirmation:** Interactive review card allows the citizen to inspect and correct extracted data before any matching occurs.
5. **Deterministic Statutory Rules Engine:** Evaluates legal eligibility deterministically. Zero AI discretion. Every decision outputs a clause-by-clause audit trail.
6. **Multi-Model Semantic Ranking:** Dense vector embeddings score scheme relevance to the business description within statutory tiers.
7. **Financial Viability Verification:** Computes promoter margin money, subsidy deductions, net loan amount, and reducing-balance EMI with statutory moratoria.
8. **Geodesic Channel Partner Routing:** Maps the scheme's loan category and beneficiary GPS location to authorized channel partners using Haversine great-circle distance.
9. **Explainable Recommendation Delivery:** Displays status badges, audit verdicts, "Why this scheme?", suggested partner with justification, and PDF/WhatsApp export.

---

## 3. Production Technical Algorithms (8 Algorithms)

The platform operates on 8 distinct mathematical and deterministic algorithms:

### Algorithm 1: Deterministic Rule-Based Filtering (`backend/rules_engine.py`)
Evaluates applicant profile against statutory criteria:
- **Age Bounds:** $	ext{min\_age} \le 	ext{age} \le 	ext{max\_age}$
- **Social Category:** $	ext{category} \in 	ext{scheme.categories}$
- **Gender:** $	ext{gender} \in 	ext{scheme.gender} \lor 	ext{"Any"} \in 	ext{scheme.gender}$
- **Income Ceiling:**
  $$	ext{status} = egin{cases} 	ext{PASS} & 	ext{if } 	ext{income} \le C_{income} \ 	ext{BORDERLINE} & 	ext{if } C_{income} < 	ext{income} \le 1.15 \cdot C_{income} \ 	ext{FAIL} & 	ext{if } 	ext{income} > 1.15 \cdot C_{income} \end{cases}$$
- **Project Cost Ceiling:** $C_{min\_cost} \le 	ext{cost} \le C_{max\_cost}$ (with 10% borderline buffer)
- **Zero-Authority AI Principle:** Rules engine is 100% authoritative; language models have zero power to override statutory verdicts.

### Algorithm 2: Gemini Embedding 2 Dense Semantic Retrieval (`backend/embedding_service.py`)
- Projects natural-language business descriptions and scheme documents into a 768-dimensional normalized vector space.
- Utilizes Google Gemini Embedding 2 (`gemini-embedding-2`, GA Sept 2, 2026).
- Computes vector cosine similarity:
  $$\cos(ec{u}, ec{v}) = rac{ec{u} \cdot ec{v}}{\|ec{u}\|_2 \|ec{v}\|_2}$$
- Smoothly normalized to $[15.0\%, 98.5\%]$ benchmark score.

### Algorithm 3: Hugging Face MiniLM Dense Embeddings (`backend/embedding_service.py`)
- Open-source semantic representation using `sentence-transformers/all-MiniLM-L6-v2`.
- Decouples platform from single-vendor lock-in.
- Multi-tier execution: Local lazy-loaded `sentence-transformers` $ightarrow$ Remote Hugging Face Inference API $ightarrow$ Deterministic 768-dim semantic projection fallback.

### Algorithm 4: Lexical TF-IDF Vector Space Analysis (`backend/semantic_ranker.py`)
- Sublinear term frequency-inverse document frequency vectorizer matching specialized domain vocabulary (e.g., "powerloom", "coir", "cnc lathe", "tuition fees"):
  $$	ext{tf-idf}(t, d) = (1 + \ln(	ext{tf}(t, d))) \cdot \ln\left(1 + rac{N}{	ext{df}(t)}ight)$$

### Algorithm 5: Multi-Model Reciprocal Rank Hybrid Fusion (`backend/semantic_ranker.py`)
- Combines semantic scores with deterministic tier gating:
  $$S_{fused} = 0.60 \cdot S_{Gemini} + 0.25 \cdot S_{HF} + 0.15 \cdot S_{Lexical}$$
- **Hard Statutory Tier Gating:**
  $$	ext{Composite Score} = egin{cases} 1000.0 + S_{fused} & 	ext{if } 	ext{ELIGIBLE} \ 500.0 + S_{fused} & 	ext{if } 	ext{BORDERLINE} \ S_{fused} & 	ext{if } 	ext{INELIGIBLE} \end{cases}$$
- **Zero Arbitrary Social-Category Ranking Bonus:** Scoring strictly reflects business relevance; no arbitrary bonuses are added based on applicant caste.

### Algorithm 6: Reducing-Balance Amortization with Statutory Moratorium (`backend/calculator.py`)
- Monthly reducing-balance Equated Monthly Installment (EMI):
  $$	ext{EMI} = P \cdot rac{r \cdot (1 + r)^n}{(1 + r)^n - 1}$$
  where $P = 	ext{Principal} = 	ext{Project Cost} - 	ext{Margin Money} - 	ext{Capital Subsidy}$, $r = 	ext{monthly interest rate} = rac{R}{12 \cdot 100}$, and $n = 	ext{tenure in months}$.
- **Moratorium Logic:** Incorporates official repayment holiday (e.g., NSFDC Educational Loan: course duration + 1 year, or up to 6 months where repayment has started).

### Algorithm 7: Haversine Great-Circle Geodesic Partner Routing (`backend/main.py`)
- Calculates shortest spherical surface distance between applicant $(\phi_1, \lambda_1)$ and channel partner $(\phi_2, \lambda_2)$:
  $$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$
  $$a = \sin^2\left(rac{\Delta\phi}{2}ight) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(rac{\Delta\lambda}{2}ight)$$
  $$d = 2 R rcsin(\sqrt{a}) \quad (R = 6371 	ext{ km})$$

### Algorithm 8: Grounded Structured Knowledge RAG (`backend/assistant.py`)
- Knowledge chunks retrieved by structured ID, keywords, and semantic similarity from verified scheme and partner catalogs.
- Synthesizes answers strictly using retrieved context with mandatory clause-level citations.
- Includes strict refusal mechanisms for out-of-scope or unverified inquiries.

---

## 4. Grounded RAG Architecture

Our platform implements **Grounded Structured Knowledge Retrieval & Fact Synthesis**:
- **Document Store:** Authoritative seed records in `backend/data/schemes_seed.json` (34 schemes) and `backend/data/channel_partners.json` (13 verified partners).
- **Zero Hallucination Guarantee:**
  - Fact extraction builds strictly from verified schema attributes.
  - If a parameter is missing in official records, it is explicitly rendered as: *"Information not available in the verified scheme data."*
  - AI-generated comparative synthesis is visually and structurally demarcated from statutory facts.
- **Mandatory Source Citations:** Every conversational response includes clickable source badges linking to official issuing bodies and verification dates.

---

## 5. Technology Stack Justification

| Layer | Technology | Architectural Justification |
|---|---|---|
| **Backend Framework** | **Python (FastAPI)** | High-performance asynchronous REST API, native Pydantic v2 data validation, OpenAPI specification, and rich ML ecosystem integration. |
| **Generative LLM** | **Google Gemini 3.8 Flash (GA)** | Released GA September 2, 2026. Native JSON structured output schema support, sub-second latency, high reasoning quality, and cost efficiency. |
| **Embedding Engine** | **Gemini Embedding 2** | State-of-the-art 768-dimensional normalized vector representations optimized for multilingual semantic search and text retrieval. |
| **Open-Source AI** | **Hugging Face (`all-MiniLM-L6-v2`)** | Guarantees vendor independence, open-source model portability, and zero-network local projection fallback. |
| **Deterministic Core** | **Custom Python Rules Engine** | 100% predictable statutory evaluation, auditable clause breakdown, zero hallucination, sub-millisecond execution. |
| **Frontend & UI** | **Modern Vanilla JS + Tailwind CSS** | Ultra-lightweight, zero build-step overhead, runs offline via Service Worker PWA, accessible on low-end rural mobile devices. |
| **Localization** | **23 Languages Dictionary** | English + all 22 Eighth Schedule Indian Languages, ensuring true pan-India accessibility without external translation latency. |
| **Engineering Tooling** | **Antigravity (Google DeepMind)** | Advanced agentic coding assistant enabling rigorous automated test-driven development, continuous verification, and rapid refactoring. |

---

## 6. Automated Testing & Verification Suite

The repository features **76 comprehensive automated unit, integration, and browser QA tests** across 12 test suites with **100% pass rate**:

```bash
$ python tests/run_tests.py
======================================================================
 Running Full Automated Test Suite (MoSJE SIH 2026 - Problem #26092)
======================================================================
test_01_ai_provider_status_endpoint ... ok
test_02_semantic_search_endpoint ... ok
test_03_hybrid_fusion_mathematics ... ok
test_04_hard_statutory_eligibility_tier_gating ... ok
test_05_zero_arbitrary_category_bonuses ... ok
test_06_partner_routing_in_match_endpoint ... ok
test_07_pooja_education_loan_partner_routing ... ok
test_08_grounded_rag_assistant_with_citations ... ok
test_09_multi_scheme_comparison ... ok
test_all_23_languages_loaded_and_complete ... ok
test_no_undefined_in_modal_and_cards_across_languages ... ok
test_multilingual_browser_qa ... ok
test_admin_data_quality_endpoint ... ok
test_haversine_distance_and_sorting ... ok
test_partner_directory_completeness ... ok
... (76 tests in total)
----------------------------------------------------------------------
Ran 76 tests in 7.412s

OK
======================================================================
 ALL TESTS PASSED! (Zero errors, Zero regressions)
======================================================================
```

---

## 7. Responsible AI, Ethics & Statutory Disclaimers

1. **Zero-Authority AI Principle:** AI systems on this platform are advisory and interpretative tools designed to facilitate discovery. Language models do not possess statutory authority to grant, reject, or modify government loan or subsidy applications.
2. **Statutory Application Routing:** All financial sanctions, promoter margin approvals, interest subventions, and fund disbursements are subject to formal verification by authorized State Channelizing Agencies (SCAs), Public Sector Banks (PSBs), or the MoSJE PM-SURAJ portal (`pmsuraj.dosje.gov.in`).
3. **Data Quality Guarantee:** Scheme rules, loan limits, income ceilings, and moratorium guidelines are compiled from official MoSJE, NSFDC, NBCFDC, NMDFC, and DEPwD policy notifications.
4. **Partner Directory Scope:** The partner locator includes a verified subset of authorized channel intermediaries for demonstration purposes and clearly discloses when live operational status feeds are unavailable.

---

## 8. Getting Started

### Prerequisites
- Python 3.10+
- (Optional) `GEMINI_API_KEY` in `.env` for live Gemini 3.8 Flash NLU and Gemini Embedding 2. (The system runs 100% offline with zero external dependencies via deterministic fallback).

### Quickstart
```bash
# 1. Clone repository
git clone https://github.com/AAdisriMenon/SIH2026.git
cd SIH2026

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run all 76 automated tests
python tests/run_tests.py

# 4. Start local development server
python run.py
```
Open `http://127.0.0.1:8000` in your web browser.
