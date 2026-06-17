# Key Features

---

## AI Voice Bot — Phone Verification

Instead of staff manually calling to verify a lead's phone number, an AI bot does it automatically during business hours. The bot asks a simple yes/no question, transcribes the answer, and records the outcome.

```mermaid
sequenceDiagram
    participant System as ADLVS
    participant Bot as Vapi / Bland AI
    participant Person as Lead Person

    System->>Bot: Trigger call (phone, name, job title, company)
    Bot->>Person: "Is [Name] still the [Job Title] at [Company]?"

    alt Confirmed — "Yes"
        Person-->>Bot: Yes
        Bot-->>System: ✅ Confirmed — score: 100%
    else Denied — "No"
        Person-->>Bot: No
        Bot-->>System: ❌ Invalid — score: 0%
    else No answer / Voicemail
        Bot-->>System: Retry in 60 minutes (max 1 retry)
    else Ambiguous response
        Bot-->>System: 🔍 Uncertain — flag for human review
    end

    Bot-->>System: Store recording + transcript
```

---

## Confidence Score — How Leads Are Scored

Every verified field contributes a weighted score. The total decides what happens to the lead.

```mermaid
flowchart LR
    E["📧 Email\n30%"]
    I["👤 Identity\n25%"]
    P["📞 Phone\n20%"]
    C["🏢 Company\n15%"]
    A["📍 Address\n10%"]

    E & I & P & C & A --> S["🧠 Total Score\n0–100%"]

    S -->|"≥ 85%"| X["✅ Auto-Approved"]
    S -->|"50–84%"| Y["🔍 Human Review"]
    S -->|"< 50%"| Z["❌ Failed"]

    style X fill:#dcfce7,stroke:#16a34a,color:#14532d
    style Y fill:#fef9c3,stroke:#ca8a04,color:#713f12
    style Z fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

### Weight Reference

| Data Point | Weight | Verified By |
|---|---|---|
| Email | 30% | SMTP check + ZeroBounce API |
| Job Title / Identity | 25% | LinkedIn profile via AI matcher |
| Phone | 20% | AI voice bot |
| Company size & industry | 15% | Glassdoor / Bloomberg |
| Address | 10% | Google Maps |

### Worked Example — Catch-All Email Lead

| Check | Result | Points |
|---|---|---|
| Email — catch-all domain (risky) | 50% | 15 |
| Identity — LinkedIn confirmed | 100% | 25 |
| Phone — AI bot confirmed | 100% | 20 |
| Company — matched | 100% | 15 |
| Address — partial match | 70% | 7 |
| **Total** | | **82% → Human Review** |

A human glances at this for 10 seconds and confirms. No 20-minute manual search needed.

> Weights are stored in the database per campaign — not hardcoded. Different campaigns can use different scoring profiles.

---

## Mismatch Handling — Not Binary Pass or Fail

When a field doesn't exactly match, the system does **not** fail the lead outright. Instead it creates a **comparison record** and routes the lead to human review.

**Example:** Lead says "IT Manager" — LinkedIn says "Infrastructure Manager". A human would recognise these as the same role. The system flags the mismatch with an AI similarity note and lets a human confirm rather than auto-failing a valid lead.

```mermaid
flowchart LR
    V["Verification\nreturns a result"]

    V -->|"Exact match"| A["Score: 100%\nNo flag"]
    V -->|"Close match\ne.g. IT Mgr ≈ Infra Mgr"| B["Score: partial\nComparison record created\nRouted to human review"]
    V -->|"No match\nor unverifiable"| C["Score: 0%\nFlagged for correction"]

    style A fill:#dcfce7,stroke:#16a34a,color:#14532d
    style B fill:#fef9c3,stroke:#ca8a04,color:#713f12
    style C fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

---

## Telemarketing Mode

For telemarketing leads, the AI bot runs in an extended mode — the full call is recorded and the transcript is stored alongside the lead record. Both are available in the export and human review screens.

| Mode | Bot behaviour | Output |
|---|---|---|
| **Standard verification** | Short script, yes/no answer, ends call | Confirmed / Invalid / Uncertain |
| **Telemarketing** | Full conversation recorded | Recording file + full transcript attached to lead |

---

## Admin Configuration

Admins can configure which verification tool to use for each data point, per campaign. This means different clients or campaigns can use different providers without changing any code.

| What can be configured | Example |
|---|---|
| Email verifier | Choose ZeroBounce, NeverBounce, or SMTP-only |
| Identity source | LinkedIn, company website, or both |
| Scoring weights | Adjust per-campaign (e.g. weight phone higher for sales campaigns) |
| Score thresholds | Change the auto-approve and review cutoffs |
| Rate limits | Set per-service concurrency limits to match subscription tier |
