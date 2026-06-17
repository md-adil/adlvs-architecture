# Infrastructure

---

## Deployment — Azure (Recommended)

```mermaid
flowchart TB
    User(["👤 Users"]) --> WAF["Application Gateway + WAF"]

    subgraph VNET["Azure Virtual Network"]
        subgraph APP["Application Tier — AKS"]
            WEB["Web App\n2× 4vCPU 16GB"]
            API["API + Workers\n2× 8vCPU 32GB"]
        end
        subgraph DATA["Data Tier — Private Endpoints"]
            PG["PostgreSQL\n4vCore 128GB"]
            REDIS["Redis Cache"]
        end
        BLOB["Blob Storage\nRecordings + Exports"]
        KV["Key Vault\nSecrets"]
    end

    WAF --> WEB & API
    API --> PG & REDIS & BLOB & KV

    style DATA fill:#f3e8ff,stroke:#9333ea
    style APP fill:#dcfce7,stroke:#16a34a
```

### Azure Service Map

| Component | Azure Service |
|---|---|
| Web + API containers | AKS / App Service |
| Celery workers | VM Scale Set / AKS |
| Scheduled jobs | Azure Functions |
| Database | Azure DB for PostgreSQL |
| Cache + Queue | Azure Cache for Redis |
| File storage | Azure Blob Storage |
| Secrets | Azure Key Vault |
| WAF | Application Gateway WAF v2 |
| Logging | Azure Monitor + Log Analytics |

---

## Deployment — AWS (Alternative)

Same architecture, different service names. Choose based on your team's existing cloud expertise.

| Concern | Azure | AWS |
|---|---|---|
| Containers | AKS / App Service | ECS Fargate / EKS |
| Serverless jobs | Azure Functions | Lambda + EventBridge |
| Database | Azure DB for PostgreSQL | RDS PostgreSQL |
| Cache | Azure Cache for Redis | ElastiCache Redis |
| Storage | Azure Blob Storage | S3 |
| Secrets | Azure Key Vault | AWS Secrets Manager |
| WAF | Application Gateway WAF | AWS WAF + ALB |
| Logging | Azure Monitor | CloudWatch + X-Ray |

---

## Deployment — On-Premises (Minimum Spec)

For clients who cannot use cloud providers. Sized for 100,000 leads/day.

| Component | Minimum Spec |
|---|---|
| Application servers | 2 × 16-core CPU, 64GB RAM |
| Database server | 16-core CPU, 128GB RAM, RAID SSD |
| Storage | 2TB SSD + 4TB HDD (recordings, logs, exports) |
| Network | 1Gbps LAN, DMZ |
| Software | Ubuntu / RHEL, Docker, PostgreSQL, Redis, Prometheus + Grafana |

---

## Security Layers

Defense is built in layers — if one fails, the next stops the breach.

```mermaid
flowchart TB
    I["🌐 Internet"]
    I --> L1["Perimeter — WAF · DDoS · TLS 1.2+"]
    L1 --> L2["Identity — OAuth 2.0 · RBAC · MFA for admins"]
    L2 --> L3["Application — Input validation · Rate limiting · Proxy rotation"]
    L3 --> L4["Data — AES-256 at rest · Secrets in Key Vault · PII masking in logs"]
    L4 --> L5["Network — Private endpoints · DB not publicly accessible"]
    L5 --> L6["Audit — Immutable logs · GDPR compliance · SOC 2 readiness"]

    style L1 fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    style L2 fill:#fef3c7,stroke:#d97706,color:#713f12
    style L3 fill:#fef9c3,stroke:#ca8a04,color:#713f12
    style L4 fill:#dcfce7,stroke:#16a34a,color:#14532d
    style L5 fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
    style L6 fill:#f3e8ff,stroke:#9333ea,color:#4a1d96
```

---

## CI/CD Pipeline

Security gates (SAST, dependency scan, image scan) are mandatory blockers — not warnings.

```mermaid
flowchart LR
    PR["Pull Request"]

    subgraph CI["CI — GitHub Actions / Azure DevOps"]
        LNT["Lint"]
        TST["Unit Tests"]
        SAS["SAST\nBandit / SonarQube"]
        DEP["Dependency\nScan"]
        BLD["Docker Build"]
        INT["Integration\nTests"]
        IMG["Image Scan\nTrivy"]
        LNT --> TST --> SAS --> DEP --> BLD --> INT --> IMG
    end

    PR --> LNT
    IMG --> STG["Deploy to Staging"]
    STG --> PERF["Performance Test\n100k leads"]
    PERF --> APPR["Manual Approval"]
    APPR --> PROD["Blue/Green\nto Production"]
    PROD --> HC{"Health Check"}
    HC -->|Pass| DONE["Live ✅"]
    HC -->|Fail| RB["Auto Rollback"]

    style SAS fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    style DEP fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    style IMG fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    style RB fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

---

## Phased Delivery

```mermaid
flowchart LR
    subgraph P1["Phase 1 — Core Platform (~10 weeks)"]
        A["Design &\nArchitecture\n2w"]
        B["Platform\nFoundation\n3w"]
        C["Email, Address\nWebsite Verify\n3w"]
        D["Testing\nGo-Live\n2w"]
        A --> B --> C --> D
    end

    subgraph P2["Phase 2 — AI Engine (~8 weeks)"]
        E["Phone\nVerification\n2w"]
        F["LinkedIn\nIdentity\n2w"]
        G["Score\nEngine\n1w"]
        H["Human\nReview\n1w"]
        I["UAT\nGo-Live\n2w"]
        E & F --> G --> H --> I
    end

    D --> E

    style P1 fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
    style P2 fill:#dcfce7,stroke:#16a34a,color:#14532d
```

### Phase Deliverables

| Phase | Deliverable |
|---|---|
| **Phase 1** | Core platform — email, address, website verification. Basic dashboard and export. |
| **Phase 2** | AI voice bot, LinkedIn identity check, confidence scoring, human review workflow, full reporting. |
