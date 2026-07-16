# Verification Sources — Free & Paid

ADLVS is source-agnostic: admins choose which provider verifies each data point, per campaign (see [Admin Configuration](./03_key_features.md#admin-configuration)). This page catalogs the known options for each of the five data points — free and paid — beyond the primary/fallback pair already wired into the requirement spec.

> Pricing is indicative (USD, per the requirement document) and will drift — treat this as a shortlist to evaluate, not a locked-in bill of materials. If ADLVS procures a subscription on the client's behalf, add 10% administrative cost per the assumptions in the requirement doc.

---

## Email Address

| Source | Type | Pricing | Notes |
|---|---|---|---|
| Custom SMTP check (built-in) | Free | — | Default mechanism — confirms mailbox exists without sending mail |
| MX / DNS record lookup | Free | — | Confirms the domain can receive mail at all |
| Disposable-domain block list (open source) | Free | — | Flags throwaway/temp-mail addresses |
| **ZeroBounce** | Paid | $75 / 10k emails (PAYG) | Primary source — 10,000 credits |
| **NeverBounce** | Paid | ~$80 / 10k (PAYG) | Fallback source — industry standard for "sync" cleaning workflows |
| Bouncer | Paid | ~$60–80 / 10k (PAYG/Sub) | High accuracy, easy-to-use API |
| MyEmailVerifier | Paid | $25 / 10k (PAYG) | Extremely affordable — $0.0025/credit |
| MillionVerifier | Paid | ~$6 / 10k (PAYG) | Best for high-volume, low-cost bulk cleaning |
| Emailable | Paid | ~$30–50 / 10k (Sub/PAYG) | Modern UI, strong Zapier/API integrations |
| Verifalia | Paid | ~$49 / 10k (Sub/PAYG) | Flexible plans, 25 free daily credits |
| Hunter.io | Paid | usage-based | Fallback source — also useful for email discovery |
| TowerData | Paid | usage-based | Fallback source |
| Deliverability Suite | Paid | ~$49/month | Monitors domain reputation and ISP blocklisting |

---

## Phone Number

| Source | Type | Pricing | Notes |
|---|---|---|---|
| libphonenumber (Google, open source) | Free | — | Format/validity check only — no carrier or reachability data |
| **Twilio Lookup** | Paid | $0.01/request | Recommended entry point — carrier, line type |
| Numverify | Paid | Free tier (100 req/mo), then paid | Carrier, line type, location |
| AbstractAPI Phone Validation | Paid | Free tier + PAYG | Alternative to Numverify |
| **Vapi** | Paid | $0.05/minute | Primary AI voice bot — live reachability confirmation |
| Bland AI | Paid | usage-based | Alternative AI voice bot provider |

---

## Identity / Job Title

| Source | Type | Pricing | Notes |
|---|---|---|---|
| Company website "About / Team" page | Free | — | Fallback source |
| Manual web/Google search | Free | — | Last-resort fallback when no other source matches |
| LinkedIn / Sales Navigator | Paid | Enterprise license | Primary source |
| **Apollo.io** | Paid | $49/month | Recommended entry cost |
| Clay | Paid | usage-based | Aggregates multiple identity sources into one lookup |
| ZoomInfo | Paid | Enterprise pricing | Deep B2B contact data |
| RocketReach | Paid | usage-based | Alternative contact/identity lookup |
| Lusha | Paid | usage-based | Alternative contact/identity lookup |

---

## Company

| Source | Type | Pricing | Notes |
|---|---|---|---|
| Official company website | Free | — | Fallback source |
| OpenCorporates | Free (tier) | Paid API for scale | Public company registry lookup |
| Wikipedia / public filings | Free | — | Sanity check for large enterprises |
| LinkedIn Company Page / Insights | Paid | Enterprise license | Primary source |
| Glassdoor | Paid | scraped via Playwright | Company size / industry, fallback |
| Bloomberg | Paid | Enterprise license | Company size / industry, fallback |
| **Clearbit / Clay** | Paid | $0.15/company | Recommended entry cost |
| Crunchbase | Paid | usage-based | Alternative company data |

---

## Address

| Source | Type | Pricing | Notes |
|---|---|---|---|
| OpenStreetMap Nominatim | Free | — | Free geocoding, lower accuracy on informal addresses |
| USPS Address Validation | Free | — | US addresses only |
| **Google Maps / Places API** | Paid | $0.002/request | Primary source — returns partial/exact match |
| SmartyStreets | Paid | usage-based | Alternative address validation |
| Loqate | Paid | usage-based | Strong international address coverage |
| Melissa Data | Paid | usage-based | Alternative address/identity data |

---

## Website / Domain

| Source | Type | Pricing | Notes |
|---|---|---|---|
| DNS lookup (built-in) | Free | — | Confirms the domain resolves |
| WHOIS lookup | Free | — | Confirms domain registration details |
| URL validation (built-in) | Free | — | Confirms the page is reachable |
| WhoisXML API | Paid | usage-based | Bulk/automated WHOIS at scale |

---

## How This Maps to Configuration

Every row marked **bold** above is the provider already named as primary in the [Multi-Source Verification Engine](./03_key_features.md#admin-configuration) table. Everything else is an evaluated alternative or free fallback an admin can switch to per campaign — no code change required, per the "Admin Configuration" requirement (§2.1, §4 of the requirement doc).
