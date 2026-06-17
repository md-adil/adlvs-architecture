# System Architecture

The architecture uses three levels of zoom. Read them top to bottom — each one reveals more detail than the last.

| Level | Shows | Audience |
|---|---|---|
| **Context** | What the system connects to externally | Everyone |
| **Containers** | What services and databases exist inside | Tech lead, DevOps |
| **Components** | How the verification engine works internally | Developers |

---

## Level 1 — System Context

What ADLVS connects to. Every box outside the centre is an external dependency.

```mermaid
C4Context
    title System Context — ADLVS

    Person(user, "Business User", "Uploads leads, reviews exceptions, exports results")
    Person(admin, "System Admin", "Configures tools, manages users, sets API keys")

    System(adlvs, "ADLVS", "Multi-source AI-driven lead verification engine")

    System_Ext(zerobounce, "ZeroBounce / NeverBounce", "Email verification")
    System_Ext(linkedin, "LinkedIn / Sales Navigator", "Identity & company data")
    System_Ext(googlemaps, "Google Maps API", "Address validation")
    System_Ext(vapi, "Vapi / Bland AI", "AI voice bot for phone verification")
    System_Ext(bloomberg, "Glassdoor / Bloomberg", "Company data")
    System_Ext(techconnectr, "TechConnectr 2.0", "Source CRM & export target")

    Rel(user, adlvs, "Upload, review, export", "HTTPS")
    Rel(admin, adlvs, "Configure & manage", "HTTPS")
    Rel(adlvs, zerobounce, "Email check", "REST")
    Rel(adlvs, linkedin, "Identity & company scrape", "Playwright + Proxy")
    Rel(adlvs, googlemaps, "Address check", "REST")
    Rel(adlvs, vapi, "Phone call trigger", "REST")
    Rel(adlvs, bloomberg, "Company data", "REST")
    Rel(adlvs, techconnectr, "Export verified leads", "REST")
```

---

## Level 2 — Containers

The key services and data stores. Each box is a separately deployable unit.

```mermaid
flowchart TB
    User(["👤 User"])

    subgraph ADLVS["ADLVS System"]
        WEB["Web App\nReact / Next.js"]
        API["API Gateway\nFastAPI"]
        QUEUE["Queue Manager\nCelery + Redis"]
        WORKERS["Verification Workers\n5 independent services"]
        SCORE["Score Engine"]
        REVIEW["Human Review Service"]
        PG[("PostgreSQL")]
        REDIS[("Redis\nQueue + Cache")]
        BLOB[("Blob Storage\nRecordings & Exports")]
    end

    User --> WEB --> API
    API --> QUEUE --> WORKERS --> SCORE
    SCORE --> PG
    SCORE --> REVIEW
    QUEUE --> REDIS
    WORKERS --> BLOB
```

---

## Level 3 — Inside the Verification Engine

Each verifier runs independently. They all report back to the Score Engine.

```mermaid
flowchart TD
    QM["⚙️ Queue Manager\nDispatches parallel tasks"]

    QM --> EV["📧 Email Verifier\nSMTP + ZeroBounce"]
    QM --> PV["📞 Phone Verifier\nVapi AI Bot + Retry"]
    QM --> IV["👤 Identity Verifier\nLinkedIn + NLP matcher"]
    QM --> CV["🏢 Company Verifier\nGlassdoor / Bloomberg"]
    QM --> AV["📍 Address Verifier\nGoogle Maps API"]

    EV & PV & IV & CV & AV --> SE["🧠 Score Engine\nWeighted score → Auto / Review / Fail"]
```

---

## Data Flow

How a lead record moves and changes state through the system.

```mermaid
flowchart LR
    A[("CSV / JSON\nUpload")] --> B["Ingestion\nNormalise & validate"]
    B --> C[("PostgreSQL\nstatus: pending")]
    C --> D["Queue Manager"]

    D --> W["5 Verifiers\nin parallel"]
    W --> S["Score Engine\nAggregate results"]

    S --> AP[("status: auto_approved")]
    S --> PR[("status: pending_review")]
    S --> FA[("status: failed")]

    PR --> R["Human Review"]
    R --> AP

    AP & FA --> EXP["Export Service"]
    EXP --> OUT[("CSV / Excel\nDownload")]
```
