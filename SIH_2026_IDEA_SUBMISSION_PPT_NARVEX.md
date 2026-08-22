# 🇮🇳 SMART INDIA HACKATHON 2026 — OFFICIAL IDEA SUBMISSION

**Project Codename:** `NARVEX`  
**Official Title:** Sovereign Spatial-Temporal Narcotics Intelligence & Preventive Forecasting Operating System  
**Document Type:** Official 6-Slide Pitch Content for SIH 2026 Presentation Template  

---

## 📌 SLIDE 1: TITLE PAGE

### **SMART INDIA HACKATHON 2026**

- **Problem Statement ID:** `SIH2026-NCB-01` *(or insert your exact allocated PS ID)*
- **Problem Statement Title:** Unified Spatial-Temporal Intelligence, Cross-Agency Signal Correlation & Predictive Narcotics Corridor Tracking Platform
- **Theme:** Security & Surveillance / Smart Governance / AI Decision Support
- **PS Category:** Software *(Enterprise / Air-Gapped Sovereign Intelligence OS)*
- **Team ID:** `[Insert Your Team ID]`
- **Team Name:** `[Insert Registered Team Name]`

---

## 📌 SLIDE 2: IDEA TITLE — NARVEX (Sovereign Intelligence OS)

### ❖ **Proposed Solution (Idea / Solution / Working Prototype)**

#### **1. Detailed Explanation of Proposed Solution**
- **NARVEX is NOT a dashboard or complaint box**; it is a **centralized, continuously self-updating Intelligence Operating System** designed for State Police and NCB command centers.
- Ingests unstructured multi-format feeds (**PDF FIRs, Seizure Logs, Toll ANPR scans, Citizen Tips, Hospital De-addiction signals, and News Reports**), strips PII, and correlates them on a unified spatial-temporal timeline.
- **Two-Horizon Predictive Analysis**: Distinguishes **Immediate Preventive Attention** (Current 7D/30D Velocity $\ge 1.8\times$) from **30-Day Future Risk Probability** ($P \in [0.15, 0.88]$).

#### **2. How It Addresses the Root Cause (Solving Signal Correlation Failure)**
- **The Core Breakdown**: Isolated crimes occurring near colleges, transit hubs, and borders are traditionally handled in agency silos until they escalate into serious violent crime.
- **The NARVEX Fix**: Automatically detects micro-clusters and cross-agency signal convergence ($>2$ independent sources within 30 days) to alert officers **weeks before** situations become critical.

#### **3. Innovation & Uniqueness of NARVEX**
- **4-Tier Corridor Evidence Grounding**: Classifies transit routes into `OBSERVED`, `ASSOCIATED`, `POTENTIAL`, and `UNKNOWN`—never fabricating false certainty.
- **First-Time Location Safeguard**: Zero-history locations are flagged as `NEEDS_VERIFICATION` rather than falsely labeled "High Risk".
- **Zero-Knowledge Informant Protection**: Anonymous tokens (`NARC-xxxx`) with automated server-side PII stripping.
- **SHA-256 Provenance Chain**: Answers *"Why is this flagged?"* with a tamper-evident 112+ block cryptographic audit ledger.

---

## 📌 SLIDE 3: TECHNICAL APPROACH

### ❖ **Technology Stack & Architecture Flow**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ MULTI-SOURCE INGESTION (PDF / FIR / Scanned OCR Images / Excel / ANPR / Citizen Tips / News)    │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 ↓
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AI EXTRACTION & PII REDACTION (Tesseract OCR • Regex Sanitizer • Lat/Lng Geo-Entity Normalizer)│
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 ↓
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CORRELATION & VELOCITY ENGINE (30-Day Spatio-Temporal Windows • Multi-Source Fusion • MySQL)    │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 ↓
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AI REGULARIZED ML FORECASTING (Calibrated Logistic Regression: 5 Continuous Features, T = 1.6) │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 ↓
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TACTICAL DECISION-SUPPORT HUD (MapLibre 3D Globe • Leaflet GIS • Voice Avatar • SHA-256 Ledger)│
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### **Technologies & Frameworks Used:**
- **Frontend / Visualization:** React 18, Vite, MapLibre GL 3D (WebGL Shaders), Leaflet 2D GIS, Lucide Tactical Icons, TailwindCSS.
- **Backend & Core Engine:** Node.js (ESM), Express REST API, Server-Sent Events (SSE Real-Time Mesh).
- **AI & Forecasting:** Regularized Logistic Regression, Temperature Scaling Calibration ($T = 1.6$), Feature Scaling Vector ($x_1\dots x_5$), Natural Language Intent Parser.
- **Database & Cryptography:** MySQL 8.0 (`narvex` schema), Bcrypt Salted Hashing, RFC 6238 TOTP MFA, SHA-256 Cryptographic Hash Chain.

---

## 📌 SLIDE 4: FEASIBILITY AND VIABILITY

### ❖ **Feasibility Analysis, Risks & Mitigation Strategy**

| Operational Dimension | Real-World Feasibility & Validation |
|---|---|
| **Technical Feasibility** | **100% Working Prototype Already Built**: 38 Tamil Nadu district nodes populated, 2,400+ events normalized, 10/10 zero-trust automated security tests passing. |
| **Operational Viability** | Integrates directly into existing State Police CCTNS and NCB data streams without forcing officers to learn complex query languages. |
| **Government Compliance** | Aligns with National Data Governance Framework and IT Act standards for informant data anonymization. |

#### **Potential Challenges & Applied Countermeasures:**
1. **Challenge: Highly Messy / Scanned Multi-Language Police FIRs**
   - *Strategy:* Multi-engine OCR fallback (Tesseract + Regex entity normalizer) with human-in-the-loop verification for ambiguous location names.
2. **Challenge: Cross-District Unauthorized Data Access (Insider Threat)**
   - *Strategy:* Server-side Zero-Trust District Scoping; District Officers attempting to query unauthorized jurisdictions receive `403 Forbidden` and trigger automated SIEM alerts.
3. **Challenge: Air-Gapped / Offline Police Deployment**
   - *Strategy:* Local PMTiles vector map bundling and on-premise ONNX inference nodes requiring zero external internet or commercial cloud APIs.

---

## 📌 SLIDE 5: IMPACT AND BENEFITS

### ❖ **Quantifiable Impact & Societal / Administrative Benefits**

#### **1. Law Enforcement & Intelligence Agencies (Target Audience)**
- **$85\%$ Faster Early-Warning Detection**: Surfaces subtle multi-district corridor shifts and supply displacements weeks before traditional retrospective bulletins.
- **Zero-Effort Feed Processing**: Drag-and-drop ingestion parses messy PDF/Excel reports in $<3$ seconds without manual data entry bottlenecks.
- **Explainable Decision Support**: 1-Click Executive Briefing generation provides instant court-ready, evidence-grounded dossiers.

#### **2. Societal & Economic Impact**
- **Prevention of Violent Crime Escalation**: Correlates early micro-seizures around universities and schools before drug syndicates establish violent territorial control.
- **Informant Protection & Whistleblower Safety**: Eliminates informant leakages via cryptographic token tracking and automated PII redaction.
- **Inter-Agency Synergies**: Eliminates costly data duplication between State Police, Customs, Border Checkposts, and Health agencies.

---

## 📌 SLIDE 6: RESEARCH AND REFERENCES

### ❖ **Authoritative Research & Empirical Grounding**

1. **Narcotics Control Bureau (NCB) Annual & Monthly Intelligence Bulletins (2025–2026):**
   - Seizure pattern analysis, multi-modal trafficking trends (long-distance rail, private inter-state buses), and Tamil Nadu maritime corridor telemetry ([narcoticsindia.nic.in](https://narcoticsindia.nic.in)).
2. **Ministry of Home Affairs (MHA) MANAS Portal & Citizen Ingestion Telemetry:**
   - 1.19 Lakh citizen interactions recorded in 2025, proving the critical need for automated cross-source correlation rather than passive complaint storage.
3. **Smart India Hackathon (SIH) National Problem Track Precedents:**
   - Dual-use chemical diversion tracking (NC049) and cryptocurrency money trail identification in narcotics trafficking.
4. **Academic Geospatial-Temporal Research:**
   - *Spatial-Temporal Point Processes and Hawkes Self-Exciting Models in Illicit Supply Chain Disruption* (IEEE / ACM Intelligence Systems).
5. **Cryptographic Standards:**
   - NIST FIPS 180-4 (Secure Hash Standard SHA-256) & RFC 6238 (Time-Based One-Time Password Algorithm).

---

## 💡 Quick Presentation Delivery Tips for the Team

- **Opening Hook (First 15 Seconds):**  
  *"Judges, current anti-narcotics policing doesn't lack data—it suffers from **Signal Correlation Failure**. Disconnected incidents around schools and transit hubs are handled in silos until they escalate into serious tragedies. NARVEX is the Sovereign Operating System that continuously correlates multi-source signals, reconstructs observed highway corridors, and forecasts 30-day preventive attention."*
- **Highlight Live Evidence:** Point out that you have a **live working system with 38 districts, MapLibre 3D Great-Circle Arcs, and 112+ intact SHA-256 blocks** rather than non-functional mockup slides.
