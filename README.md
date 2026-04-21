# 🏠 Property Calculator

> Estimate property costs, EMIs, stamp duty & construction expenses across **35+ cities worldwide**.

---

## ✨ Features

- 🏢 **Flat Purchase Calculator** — base cost, GST, stamp duty, registration & EMI breakdown
- 🏗️ **House Build Estimator** — material, labour, permits, land cost & construction timeline
- 🌍 **Multi-Country Support** — India (15 cities), UAE, USA, UK, Singapore, Australia & more
- 📊 **Side-by-Side Comparison** — compare two scenarios with shareable links
- 🤖 **AI Chat Agent (PropertyGuru)** — ask natural-language questions about property costs
- 👩 **Gender-Based Stamp Duty Rebate** — automatic female-buyer discount where applicable
- 🏦 **PMAY Subsidy Integration** — Pradhan Mantri Awas Yojana eligibility & savings
- 🧾 **Receipt & PDF Export** — save or print your calculation results
- 📐 **Community Rules Engine** — JSON-based, versioned, schema-validated tax rules anyone can contribute
- 🐳 **Docker Ready** — single `docker-compose up` for all 3 services

---

## 🏙️ Supported Cities

### 🇮🇳 India (15 cities)
| Tier 1 | Tier 2 | Tier 3 |
|--------|--------|--------|
| Mumbai | Pune | Jaipur |
| Delhi | Ahmedabad | Lucknow |
| Bengaluru | Kochi | Chandigarh |
| Hyderabad | Visakhapatnam | Coimbatore |
| Chennai | Kolkata | Indore |

### 🌐 International (20 cities)
| Country | Cities |
|---------|--------|
| 🇦🇪 UAE | Dubai Marina, Abu Dhabi |
| 🇺🇸 USA | Austin, New York, San Francisco, Los Angeles |
| 🇬🇧 UK | London, Manchester |
| 🇸🇬 Singapore | Singapore Central, Jurong East |
| 🇦🇺 Australia | Sydney, Melbourne |
| 🇨🇦 Canada | Toronto, Vancouver |
| 🇩🇪 Germany | Berlin, Munich |
| 🇯🇵 Japan | Tokyo, Osaka |
| 🇶🇦 Qatar | Doha |
| 🇴🇲 Oman | Muscat |

---

## 🧱 Architecture

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Frontend    │────▶│    Backend    │◀────│  Chat Agent   │
│  Next.js :3000│     │ Express :3002 │     │ LangChain:3003│
└───────────────┘     └───────────────┘     └───────────────┘
                             │
                      ┌──────┴──────┐
                      │   SQLite    │
                      │  + JSON DB  │
                      └─────────────┘
```

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Phani3108/PropertyCalculator.git
cd PropertyCalculator

# Option 1: Docker (recommended)
cd indian-property-calc
docker-compose up

# Option 2: Manual
cd indian-property-calc/backend && npm install && npm run dev &
cd ../frontend && npm install && npm run dev &
cd ../chat-agent && npm install && npm run dev &
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3002/api |
| Chat Agent | http://localhost:3003 |

---

## 📁 Project Structure

```
Property Calculator/
├── frontend/                    # Rules-engine multi-country calculator (Next.js App Router)
│   ├── public/rules/            # JSON tax rules per country/region
│   └── src/app/                 # Pages, API routes, components
│
└── indian-property-calc/        # Full-stack Indian property calculator
    ├── backend/                 # Express API + calculation engines
    │   ├── src/engines/         # EMI, Flat, House, Comparison engines
    │   └── src/data/            # City costs, wages, materials, stamp duty
    ├── frontend/                # Next.js UI with Recharts + Shadcn
    ├── chat-agent/              # LangChain + GPT-4 PropertyGuru agent
    └── docker-compose.yml       # One-command deployment
```

---

## 🗺️ Roadmap

### Phase 1 — Foundation ✅
- [x] Flat & House calculators with EMI
- [x] 15 Indian cities with real stamp duty data
- [x] Scenario comparison with shareable links
- [x] Receipt / PDF export
- [x] Docker + docker-compose setup
- [x] AI chat agent (PropertyGuru)

### Phase 2 — Global Expansion (In Progress)
- [x] 20 international cities across 10 countries
- [ ] Currency localization (₹ / $ / £ / € / ¥)
- [ ] Country-specific tax logic (Title insurance for US, SDLT for UK)
- [ ] Historical price trend charts
- [ ] User accounts with saved calculations

### Phase 3 — Community & Monetization
- [ ] "Add Your City" contribution workflow + CI validation
- [ ] API marketplace (developer access to cost data)
- [ ] Advanced comparison reports (PDF export with charts)
- [ ] Mobile-first responsive redesign
- [ ] Freemium model: basic free → premium comparisons + AI chat

---

## 🤝 Contributing

1. Fork the repo
2. Add/update a JSON rule file in `frontend/public/rules/{country}/{region}.json`
3. Validate against the schema: `frontend/public/rule_schema.json`
4. Open a PR — automated validation will check your rule file

---

## 📄 License

MIT
