# Tools, Technologies, and Important Libraries

## Core Technologies
- Python 3 (project language)
- FastAPI (backend API framework)
- Streamlit (UI app in `app_ui.py`)
- Cloudflare Workers AI (LLM inference provider)
- Tavily Search API (fact-checking and web evidence retrieval)

## Backend / API
- `fastapi` - API routes, request/response handling, validation integration
- `uvicorn[standard]` - ASGI server used to run the backend
- `pydantic` - request/response schema modeling
- `pydantic-settings` - environment-based configuration
- `python-multipart` - form/multipart support in FastAPI apps

## Networking and Async
- `httpx` - async HTTP client for API calls and scraping
- `asyncio` - concurrency for parallel agent execution

## Web Scraping and Parsing
- `beautifulsoup4` - HTML parsing and content extraction
- `lxml` - high-performance parser backend used with BeautifulSoup
- `urllib.parse` (stdlib) - URL/domain parsing

## AI / Agent Pipeline
- Multi-agent orchestration pattern (`orchestrator.py`)
- Agent modules:
  - claim extraction
  - linguistic manipulation analysis
  - bias/sentiment analysis
  - cross-reference and evidence search
  - verdict generation

## Configuration and Environment
- `.env`-based secrets/config
- `python-dotenv` - environment variable loading
- `functools.lru_cache` (stdlib) - cached settings instance

## Developer / Operations
- Conda environment workflow (documented in README)
- Swagger/OpenAPI docs via FastAPI at `/docs`

