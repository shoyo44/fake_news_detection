# TruthGuard Backend

AI-Based Fake News Detection and Misinformation Analysis System — FastAPI backend with a multi-agent pipeline powered by **Cloudflare Workers AI**.

---

## 🚀 Quick Start

```powershell
# 1. Activate environment
conda activate news

# 2. Install dependencies
pip install -r requirements.txt

# 3. Add your credentials to backend/.env
# (see .env.example)

# 4. Start server
cd backend
uvicorn app.main:app --reload --port 8000
```

Server runs at: `http://localhost:8000`
Swagger UI: `http://localhost:8000/docs`

---

## 🔑 Environment Variables

Create `backend/.env` with:

```ini
TAVILY_API_KEY=your_tavily_key
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_API_TOKEN=your_cloudflare_api_token
CF_LLM_MODEL=@cf/meta/llama-3.1-8b-instruct
```

- **Tavily** → [tavily.com](https://tavily.com) (free tier)
- **Cloudflare** → [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → API Tokens (Workers AI: Edit)

---

## 📡 API Endpoints

### `GET /health`
Returns connectivity status for Cloudflare AI and Tavily.

### `POST /analyze`
Analyze text or a URL for misinformation.

**Request:**
```json
{ "text": "5G towers spread COVID-19 via radio waves." }
// OR
{ "url": "https://example.com/article" }
```

**Response:**
```json
{
  "verdict": "Fake",
  "confidence_score": 85,
  "explanation": "This claim contradicts scientific consensus...",
  "what_really_happened": "5G technology operates on radio frequencies that cannot carry viruses...",
  "real_news_sources": [
    {
      "title": "No, 5G does not spread COVID-19",
      "url": "https://www.bbc.com/...",
      "source": "bbc.com",
      "summary": "..."
    }
  ],
  "claims": ["5G towers spread COVID-19", "vaccines contain microchips"],
  "manipulation_score": 8.5,
  "flagged_sentences": ["Scientists confirm 5G towers..."],
  "source_credibility": 50,
  "evidence": [...],
  "processing_time_ms": 9050
}
```

---

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── main.py                   # FastAPI entry point
│   ├── config.py                 # Settings (reads .env)
│   ├── models/schemas.py         # Pydantic models
│   ├── agents/
│   │   ├── orchestrator.py       # Runs all agents in parallel
│   │   ├── claim_extractor.py    # Extracts factual claims (LLM)
│   │   ├── linguistic_analyzer.py # Detects manipulation tactics (LLM)
│   │   ├── cross_reference.py    # Web search + real news finder
│   │   └── verdict_engine.py     # Fuses signals → verdict (LLM)
│   └── services/
│       ├── cloudflare_ai.py      # Cloudflare Workers AI client
│       ├── web_scraper.py        # URL → clean text
│       └── source_credibility.py # Domain reputation scoring
├── .env
└── requirements.txt
```

---

## 🤖 Agent Pipeline

```
Input (text/URL)
     │
     ▼
[Orchestrator] ──── parallel ────────────────────────────────┐
     │                                                        │
[Claim Extractor]   [Linguistic Analyzer]   [Source Credibility]
     │                       │                      │
     └──────────── merge ────┘                      │
     │                                              │
[Cross-Reference Agent] ◄──────────────────────────┘
     │  (Tavily search for claims + real news)
     ▼
[Verdict Engine] → Real / Misleading / Fake  +  "What Really Happened"
```
