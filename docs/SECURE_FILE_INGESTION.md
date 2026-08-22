# NARVEX — Secure File Ingestion & Multi-Format Pipeline

## 1. Untrusted Ingestion Protocol
All incoming feeds (CSVs, Excel spreadsheets, PDF FIRs, OCR images, citizen text tips) are treated as untrusted external inputs.

---

## 2. Ingestion Defense Pipeline

```text
INCOMING MULTI-PART UPLOAD
          ↓
1. FILE SIZE BOUNDS (< 10 MB per file, max 100 files per batch)
          ↓
2. MIME & EXTENSION VALIDATION (.csv, .xlsx, .pdf, .docx, .png, .jpg)
          ↓
3. FILENAME SANITIZATION (Stripping directory traversal path separators ../)
          ↓
4. PARSER SANDBOXING (Memory buffer parsing with papaparse / pdf-parse / xlsx)
          ↓
5. PII DETECTION & REDACTION (Automated regex masking of phone numbers, Aadhaar, email)
          ↓
6. ENTITY & GEOGRAPHIC RESOLUTION (Deterministic string-hash spatial placement)
          ↓
7. DUPLICATE FUSION CHECK (Matching against 30-day temporal locality clusters)
          ↓
8. SHA-256 PROVENANCE FINGERPRINTING & PERSISTENCE
```
