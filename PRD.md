# Product Requirements Document (PRD)

## AI-Driven Scheme Matching for Marginalised Entrepreneurs
**Smart India Hackathon 2026 — Problem Statement #26092**
**Ministry:** Ministry of Social Justice and Empowerment (MoSJE)
**Theme:** Smart Automation | **Category:** Software

**Document version:** 1.0 | **Date:** 15 September 2026 | **Status:** Draft for team review

---

## 1. Problem Statement Summary

India runs 1,000+ central and state government schemes offering loans, subsidies, grants, and skill-development support to entrepreneurs — particularly women, SC/ST/OBC communities, minorities, and Persons with Disabilities (PwD). Despite this abundance, uptake is low because:

- Schemes are scattered across ministries, NSFDC/NBCFDC/NHFDC/NMDFC, state corporations, and portals like MyScheme, with no single point of discovery.
- Eligibility criteria (income caps, caste category, business type, project cost, location, gender) are written in dense bureaucratic/legal language.
- Marginalised entrepreneurs often have low digital literacy, limited English proficiency, and no access to a financial/legal advisor to interpret rules.
- Manual matching against 1,000+ schemes is infeasible for an individual, and generic search engines/chatbots hallucinate eligibility or interest-rate details, eroding trust.
- As a result, concessional finance meant for this population frequently goes unclaimed even when the person genuinely qualifies.

## 2. Goal & Vision

Build an AI-driven platform that takes a small set of structured facts about an entrepreneur (identity category, income, location, gender, disability status, business idea/sector, project cost) and returns a **ranked, explainable, and verifiable** shortlist of government schemes they are actually eligible for — along with what documents they need and how to apply — in their own language.

**Vision statement:** No eligible marginalised entrepreneur should miss out on a government scheme because they didn't know it existed or couldn't understand if they qualified.

## 3. Objectives (What success looks like)

1. Reduce the time to discover relevant schemes from days of manual research to under 2 minutes.
2. Achieve matching precision the user can trust: zero fabricated eligibility claims (deterministic rule engine as source of truth, AI only for ranking/explanation/language).
3. Serve users in at least English + Hindi + 2–3 regional languages at MVP, with a path to 10+ languages.
4. Work for low-literacy, low-bandwidth users via voice input/output and a simple, accessible UI.
5. Give a defensible, auditable "why you matched / why you didn't" explanation for every scheme shown.

## 4. Target Users & Personas

| Persona | Description | Key need |
|---|---|---|
| **Rekha, 34** | Woman entrepreneur, tailoring micro-business, class 8 pass, Hindi speaker, smartphone user | Wants to know if she qualifies for a loan without visiting 5 offices |
| **Suresh, 41** | SC entrepreneur, wants an NSFDC term loan for a small workshop | Needs eligibility + EMI calculation before committing |
| **Imran, 29** | Minority entrepreneur, first-generation, moderate digital literacy | Needs document checklist + application walkthrough |
| **Anita, 26** | PwD, home-based business, uses screen reader | Needs an accessible, WCAG-compliant interface |
| **Field facilitator / CSC operator** | Assists multiple entrepreneurs at common service centres | Needs a fast bulk/assisted-mode workflow |

## 5. Scope

### 5.1 In scope (MVP for hackathon build)
- Structured intake form (+ optional voice input) capturing: category (SC/ST/OBC/Minority/Women/PwD/General), state/district, annual income, business sector/description, project cost, education, existing loans.
- **Deterministic rules engine** encoding eligibility for a curated seed set of ~30–50 real schemes (NSFDC, NBCFDC, NHFDC, NMDFC, PMEGP, Stand-Up India, Mudra, state-level schemes) sourced from MyScheme / official scheme documents.
- **Semantic ranking layer** (e.g., Sentence-BERT / embeddings) to rank eligible schemes by relevance to the user's stated business description, and to surface "close matches" where the user narrowly misses one criterion.
- Explainable match cards: eligible / not-eligible / borderline, with the exact clause that decided it.
- Financial calculator: loan amount, margin money %, subsidy %, indicative EMI (reducing balance) where scheme data defines these.
- Multilingual UI + scheme summaries (start with English + Hindi + 2 more).
- Document checklist and "how to apply" steps per scheme, linking to the official application channel.
- Basic chatbot assistant for scheme-specific Q&A, constrained to retrieval over the verified scheme database (RAG with citations) — never freeform hallucinated answers.
- Admin/back-office view to add or update a scheme's rules without redeploying code.

### 5.2 Out of scope (MVP)
- Submitting the actual application on the user's behalf to government portals (no official API access in most cases).
- Full coverage of all 1,000+ schemes (seed set only; architecture must support scaling).
- Loan disbursement, KYC, or handling of actual financial transactions.
- Legal/financial advice beyond what is stated in official scheme documents.

### 5.3 Future scope (post-MVP / production roadmap)
- Full scheme catalogue via a live feed/partnership with MyScheme / NSFDC / state portals.
- SMS/IVR channel for feature-phone users.
- Integration with DigiLocker for auto-filling documents (caste certificate, income certificate).
- Application-status tracking once a user applies.
- Facilitator/CSC dashboard for bulk assisted matching.

## 6. User Journey (MVP)

1. **Entry:** User opens web/mobile app, selects language, chooses "Speak" or "Type."
2. **Profile capture:** Guided conversational form collects category, location, income, business idea, project cost — 5–7 questions, one at a time, voice-enabled.
3. **Matching:** Rules engine filters the scheme database to hard-eligible / borderline / ineligible; semantic model ranks eligible + borderline schemes by relevance to the business description.
4. **Results:** Ranked list of scheme cards — name, one-line summary, why matched, loan/subsidy amount, EMI estimate if applicable.
5. **Deep dive:** Tap a scheme → full eligibility breakdown, document checklist, application steps/link, voice playback of summary.
6. **Assistant:** User asks the chatbot a follow-up ("Do I need a caste certificate?") → RAG-grounded answer with citation to the scheme document.
7. **Exit / save:** User can save/download the shortlist (PDF) or share via WhatsApp.

## 7. Functional Requirements

### 7.1 Eligibility & Matching Engine
- FR1: System shall maintain a structured scheme database (JSON/DB) with machine-readable eligibility rules per scheme (category, income ceiling, age, gender, sector, location, project-cost band, business stage).
- FR2: System shall evaluate a user profile against all schemes deterministically and classify each as Eligible / Not Eligible / Borderline (missing/near-threshold data).
- FR3: System shall rank Eligible + Borderline schemes using semantic similarity between the user's business description and each scheme's purpose/sector tags.
- FR4: System shall never present a scheme as eligible based on AI inference alone — eligibility labels always trace to a rule evaluation, not a language-model guess.
- FR5: System shall show the specific rule(s) that produced each Eligible/Not-Eligible/Borderline outcome (explainability).

### 7.2 Financial Calculator
- FR6: For schemes with defined loan/subsidy structures, system shall compute loan amount, margin money, subsidy amount, and an indicative reducing-balance EMI schedule.
- FR7: Calculator inputs (project cost, tenure) shall be user-adjustable with results recalculated live.

### 7.3 Multilingual & Accessibility
- FR8: UI and scheme summaries shall be available in English, Hindi, and at least 2 additional regional languages at MVP.
- FR9: System shall support voice input for profile capture and voice/audio playback of scheme summaries.
- FR10: UI shall meet WCAG 2.1 AA basics (screen-reader labels, sufficient contrast, scalable text).

### 7.4 Conversational Assistant
- FR11: Chatbot shall answer scheme-specific questions using retrieval-augmented generation constrained to the verified scheme database, with the source scheme cited for every answer.
- FR12: Chatbot shall decline to answer (rather than guess) when no matching scheme data exists.

### 7.5 Content Management
- FR13: An authorised admin shall be able to add/update/deactivate a scheme's rules and content through an admin UI without a code deployment.
- FR14: System shall version scheme data and log when a rule was last verified against the official source.

### 7.6 Data & Output
- FR15: User shall be able to export their shortlist as a shareable PDF/WhatsApp message.
- FR16: System shall log anonymised match outcomes (for future analytics on scheme uptake gaps) without storing personally identifiable data beyond the active session unless the user opts to create an account.

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Match results returned in < 3 seconds for a profile against the full seed scheme set |
| Accuracy/Trust | 100% of eligibility verdicts traceable to an explicit rule; 0% hallucinated eligibility |
| Availability | Usable on 2G/3G networks; graceful degradation without voice/AI features if offline |
| Accessibility | WCAG 2.1 AA target; PwD-friendly navigation |
| Privacy | No mandatory account creation for basic matching; explicit consent before storing profile data; no sharing of caste/income data with third parties |
| Scalability | Scheme database schema must support scaling from ~50 to 1,000+ schemes without redesign |
| Security | HTTPS everywhere; input validation; admin panel behind authentication and audit logging |
| Localization | Language packs decoupled from core logic so new languages can be added without code changes |

## 9. Proposed System Architecture

```
┌────────────────────┐     ┌──────────────────────┐     ┌───────────────────────┐
│   Client (Web/PWA)  │────▶│   API Gateway /       │────▶│  Matching Service      │
│  React + i18n +     │     │   Backend (FastAPI)   │     │  - Rules engine (rule  │
│  voice input/output │◀────│                       │◀────│    JSON per scheme)   │
└────────────────────┘     └──────────────────────┘     │  - Semantic ranker     │
                                     │                     │    (Sentence-BERT)    │
                                     ▼                     └───────────────────────┘
                            ┌──────────────────────┐
                            │  Scheme Database       │
                            │  (Postgres/MongoDB)    │
                            │  - eligibility rules   │
                            │  - scheme metadata     │
                            │  - multilingual content│
                            └──────────────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │  RAG Chatbot Service   │
                            │  (retrieval over       │
                            │   verified scheme docs)│
                            └──────────────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │  Admin Console         │
                            │  (scheme CRUD, audit)  │
                            └──────────────────────┘
```

**Key architectural principle — "zero-authority AI":** eligibility decisions come only from the deterministic rules engine against verified scheme data; AI/ML components (semantic ranking, chatbot, translation) are used only for relevance, explanation, and language, never as the source of a yes/no eligibility claim.

## 10. Suggested Tech Stack

- **Frontend:** React (PWA for offline-friendly, installable experience), i18next for localization, Web Speech API / a TTS-STT service for voice.
- **Backend:** FastAPI (Python) — matches your existing pipeline/bioinformatics-tooling experience with Python services.
- **Rules engine:** Simple JSON-rule schema evaluated in Python (or a lightweight rules library) — deliberately not a black-box model.
- **Semantic matching:** Sentence-BERT / any open embedding model for scheme-vs-business-description similarity, run locally to avoid per-request API cost.
- **Database:** PostgreSQL for structured rules + metadata; optionally a vector store (FAISS/pgvector) for the semantic layer.
- **Chatbot/RAG:** Retrieval over the same verified scheme corpus; generation model constrained with citations.
- **Data source:** MyScheme.gov.in, NSFDC/NBCFDC/NHFDC/NMDFC official scheme pages, PMEGP/Stand-Up India/Mudra guidelines — manually curated + verified for the seed dataset.
- **Deployment:** Docker containers; cloud-agnostic (works on AWS/GCP/Azure free-tier for hackathon demo).

## 11. Data Requirements

- Seed dataset of 30–50 real schemes, each with: name, issuing body, eligibility rules (category, income, age, gender, location, sector, project-cost band), benefit structure (loan/subsidy/grant amounts, interest rate, margin %), required documents, application process/link, and a "last verified" date/source.
- No live government API is assumed to exist at MVP; data is curated by the team and refreshed periodically. This should be explicitly flagged in the UI ("data verified as of [date]") to manage trust.

## 12. Success Metrics (for hackathon demo & beyond)

| Metric | Target |
|---|---|
| Time to first match result | < 2 minutes from landing to shortlist |
| Eligibility accuracy on seed set (manual audit) | 100% match with official criteria |
| Languages supported at demo | ≥ 3 (English + 2 more) |
| Chatbot answers correctly grounded/cited | 100% of answers cite a source scheme |
| Accessibility check (basic WCAG audit) | Passes automated Lighthouse a11y score ≥ 90 |
| Judge-facing differentiator | Clear demo of "why eligible" / "why not" explainability vs. generic chatbot competitors |

## 13. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Scheme data becomes outdated | "Last verified" timestamp shown; admin panel for quick updates; roadmap to official data partnership |
| AI hallucinates eligibility or amounts | Hard architectural separation: eligibility/amounts always come from the rules engine, never generated text |
| Low trust from target users | Explainable match reasoning, official links, no dark patterns, no forced account creation |
| Regional language quality | Start with fewer, well-verified languages rather than many poor-quality ones |
| Scope creep to cover all 1,000+ schemes in 36 hours | MVP explicitly scoped to a curated seed set with a scalable schema |
| Judges expect live government data | Be upfront in the demo about data source/curation approach and the roadmap to live integration |

## 14. Milestones (Hackathon Build Plan — indicative)

| Phase | Deliverable |
|---|---|
| Day 0 (prep) | Finalise seed scheme dataset (30–50 schemes) and rule schema |
| Day 1 AM | Backend: rules engine + scheme DB + matching API |
| Day 1 PM | Frontend: intake form + results UI (English first) |
| Day 2 AM | Semantic ranking layer, financial calculator, multilingual pass |
| Day 2 PM | Chatbot (RAG), voice I/O, accessibility pass, polish & demo script |

## 15. Open Questions for the Team

1. Which seed set of schemes gives the strongest, most relatable demo for the judges — national (NSFDC/PMEGP/Stand-Up India) vs. a mix with a state scheme for local relevance?
2. Do we build our own OCR/document-checklist verification, or keep documents as a static checklist for MVP?
3. How much offline/low-bandwidth support is realistic to demo in 36 hours vs. described as roadmap?
4. Team skill split — who owns rules engine vs. frontend vs. chatbot/RAG vs. multilingual content?
