# Overview

ADLVS replaces a 24-hour manual lead verification process with an automated engine that runs in under 3 hours. It checks every lead across five data points — email, phone, identity, address, and company — and outputs a clean, scored list.

---

## The Pipeline

Every lead goes through five stages. Stages 2–4 are fully automated.

```mermaid
flowchart LR
    A["📥 Upload\nCSV or JSON"]
    B["🔍 Verify\n5 data points\nin parallel"]
    C["🧠 Score\n0–100%"]
    D["✅ Decide\nAuto / Review / Fail"]
    E["📤 Export\nVerified list"]

    A --> B --> C --> D --> E

    style A fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
    style B fill:#fef9c3,stroke:#ca8a04,color:#713f12
    style C fill:#f3e8ff,stroke:#9333ea,color:#4a1d96
    style D fill:#dcfce7,stroke:#16a34a,color:#14532d
    style E fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
```

---

## What Gets Verified

Each field on a lead is checked against an external trusted source.

```mermaid
flowchart TD
    L["📋 Lead Record"]
    L --> E["📧 Email — SMTP + ZeroBounce"]
    L --> P["📞 Phone — AI voice bot calls the number"]
    L --> I["👤 Job Title — LinkedIn cross-match via AI"]
    L --> C["🏢 Company — Glassdoor / Bloomberg"]
    L --> A["📍 Address — Google Maps"]

    style L fill:#f3e8ff,stroke:#9333ea,color:#4a1d96
```

---

## How a Lead Gets Processed

```mermaid
sequenceDiagram
    actor User
    participant System as ADLVS
    participant APIs as External APIs

    User->>System: Upload leads (CSV / JSON)
    System->>APIs: Verify all 5 fields in parallel
    APIs-->>System: Return results
    System->>System: Calculate confidence score
    System-->>User: Leads ready — review queue + auto-approved list
    User->>System: Approve flagged items
    System-->>User: Download verified export
```

---

## Score Outcomes

| Score | Decision | Action |
|---|---|---|
| ≥ 85% | ✅ Auto-Approved | Exported immediately, no human needed |
| 50–84% | 🔍 Human Review | Quick sanity check — typically 10 seconds |
| < 50% | ❌ Failed | Flagged for user correction |
