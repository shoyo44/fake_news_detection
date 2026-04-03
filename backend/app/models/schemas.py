from pydantic import BaseModel
from typing import Optional


class AnalyzeRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

    class Config:
        json_schema_extra = {
            "examples": [
                {"text": "Scientists confirm 5G towers are spreading COVID-19."},
                {"url": "https://www.bbc.com/news/world-66388601"},
            ]
        }


class RealNewsSource(BaseModel):
    title: str
    url: str
    source: str              # e.g. "BBC News"
    summary: str
    published_date: Optional[str] = None


class AnalyzeResponse(BaseModel):
    verdict: str             # "Real" | "Misleading" | "Fake"
    confidence_score: int    # 0–100
    explanation: str
    what_really_happened: Optional[str] = None   # only for Fake/Misleading
    real_news_sources: list[RealNewsSource] = []
    claims: list[str] = []
    manipulation_score: float = 0.0
    bias_score: float = 0.0
    bias_type: str = "None"
    sentiment_intensity: float = 0.0
    flagged_sentences: list[str] = []
    source_credibility: int = 50
    evidence: list[dict] = []
    processing_time_ms: int = 0


class HealthResponse(BaseModel):
    status: str
    cloudflare_connected: bool
    tavily_connected: bool
