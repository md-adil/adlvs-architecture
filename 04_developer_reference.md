# Developer Reference

---

## API & Lead Lifecycle

```mermaid
sequenceDiagram
    actor User
    participant API as API Gateway
    participant Queue
    participant DB as PostgreSQL

    User->>API: POST /leads/upload (CSV)
    API->>DB: INSERT leads, status = pending
    API->>Queue: Enqueue batch
    API-->>User: 202 Accepted {job_id}

    Queue->>Queue: Run 5 verifiers in parallel
    Queue->>DB: UPDATE score + status

    alt pending_review
        User->>API: PATCH /leads/{id}/review
        API->>DB: UPDATE status + write audit log
    end

    User->>API: POST /export
    API-->>User: Download URL
```

### Lead Status Transitions

```mermaid
flowchart LR
    A[pending] --> B[processing]
    B --> C[auto_approved]
    B --> D[pending_review]
    B --> E[failed]
    D --> C
    D --> E
    C & E --> F[exported]
```

### Key API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/leads/upload` | Upload CSV/JSON batch |
| GET | `/leads/status/{job_id}` | Poll processing progress |
| GET | `/leads/review-queue` | Fetch items for human review |
| PATCH | `/leads/{id}/review` | Submit human decision |
| POST | `/export` | Generate CSV/Excel export |

---

## Database Schema

Key design decision: `verification_results` is a separate table from `leads`. Adding a new verifier (e.g. Twitter check) requires zero changes to the leads schema.

```mermaid
erDiagram
    LEADS {
        uuid id PK
        uuid campaign_id FK
        string email
        string phone
        string job_title
        string company_name
        string physical_address
        decimal confidence_score
        string status "pending|processing|auto_approved|pending_review|failed|exported"
        timestamp created_at
    }

    VERIFICATION_RESULTS {
        uuid id PK
        uuid lead_id FK
        string data_point "email|phone|identity|company|address"
        string tool_used
        string primary_value
        string found_value
        decimal match_score "0.00–1.00"
        string status "verified|mismatch|unverifiable"
        jsonb raw_response
    }

    CALL_RECORDS {
        uuid id PK
        uuid lead_id FK
        string call_status "confirmed|invalid|uncertain|no_answer|unreachable"
        string recording_url
        string transcript_url
        integer retry_count
        timestamp called_at
    }

    SCORING_CONFIG {
        uuid id PK
        uuid campaign_id FK
        string data_point
        decimal weight
        decimal auto_approve_threshold
        decimal manual_review_threshold
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        uuid lead_id FK
        string action
        jsonb before_state
        jsonb after_state
        timestamp created_at
    }

    LEADS ||--o{ VERIFICATION_RESULTS : "has"
    LEADS ||--o| CALL_RECORDS : "has"
    LEADS ||--o{ AUDIT_LOGS : "tracked in"
```

---

## Queue Model & the 3-Hour SLA

The 3-hour target is only achievable by running verifications in parallel **and** respecting each external API's rate limit. Without proxy rotation, LinkedIn alone would take 27 hours.

```mermaid
flowchart LR
    Upload["100k leads\nuploaded"] --> Split["Split into\nbatches of 100"]
    Split --> Redis[("Redis\nTask Queue")]
    Redis --> W["Celery Workers\npool per verifier"]
    W --> Rate["Rate Limit\nController"]
    Rate --> Cache{"Redis Cache\nHit?"}
    Cache -->|Yes — TTL 24h| Result["Return cached\nresult"]
    Cache -->|No| API["Call External\nAPI"]
    API --> Result
```

### Rate Limits per External Service

| Service | Limit | Strategy |
|---|---|---|
| ZeroBounce | 100 req/sec | High parallelism, no proxy needed |
| Google Maps | 50 req/sec | Managed quota |
| Vapi / Bland AI | 10 concurrent calls | Business hours scheduling |
| LinkedIn | 5 req/sec per IP | Proxy rotation × 20 IPs = 100 req/sec |
| Glassdoor / Bloomberg | 3 req/sec | Proxy rotation |

### Why This Hits the SLA

```
500,000 API calls total (100k leads × 5 checks)

Without proxy:  LinkedIn at 5 req/sec = 27 hours  ❌
With 20 proxies: 100 req/sec            = 83 min   ✅
With 20% cache:  400k real calls        = 67 min   ✅
```
