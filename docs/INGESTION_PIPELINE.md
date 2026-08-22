# NARVEX Document Ingestion & Extraction Pipeline

NARVEX accepts external file drops and structured intake payloads through an automated ingestion service.

---

## 📥 Supported File Formats
- PDF / Scanned PDF
- JPG / PNG / WEBP
- DOCX / TXT
- CSV / JSON / XLSX

---

## ⚙️ Execution Pipeline

```
FILE DROP
  │
  ├── 1. SHA-256 HASH GENERATION (Deduplication Check)
  ├── 2. FILE TYPE DETECTION & QUALITY VALIDATION
  ├── 3. OCR & TEXT PARSING
  ├── 4. NER EXTRACTION (Locations, Dates, Substances, Quantities, FIR refs)
  ├── 5. MYSQL DATASET INSERTION (`documents`, `document_extractions`, `event_provenance`)
  └── 6. REAL-TIME RECOMPUTATION TRIGGER (`triggerDependencyAwareRecomputation`)
```
