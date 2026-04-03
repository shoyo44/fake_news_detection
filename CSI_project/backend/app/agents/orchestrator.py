import asyncio
import time

from app.agents import content_analyzer, claim_extractor, linguistic_analyzer, cross_reference, verdict_engine, bias_sentiment_analyzer
from app.services import source_credibility, web_scraper
from app.models.schemas import AnalyzeResponse, RealNewsSource


async def run(text: str = None, url: str = None) -> AnalyzeResponse:
    """
    Main orchestrator: runs all agents in parallel, merges results.
    Accepts either raw text or a URL.
    """
    start_time = time.time()

    # ── Step 1: Get content ──────────────────────────────────────
    domain = ""
    if url:
        scraped = await web_scraper.scrape_url(url)
        article_text = scraped["content"]
        title = scraped["title"]
        domain = scraped["domain"]
    else:
        article_text = text or ""
        title = article_text[:80]

    if not article_text.strip():
        raise ValueError("No content to analyze. Provide text or a valid URL.")

    # ── Step 2: Source credibility (sync, instant) ────────────────
    cred_result = source_credibility.score_domain(domain) if domain else {
        "credibility_score": 50, "flags": [], "is_known_satire": False, "is_known_unreliable": False
    }

    # ── Step 3: Run content analysis (claims, linguistics, bias in ONE prompt) ──
    content_analysis = await content_analyzer.analyze_content(article_text)
    claims = content_analysis["claims"]
    linguistic = content_analysis["linguistic"]
    bias = content_analysis["bias"]

    # ── Step 4: Cross-reference (needs claims) ─────────────────────
    evidence = await cross_reference.search_claims(claims)

    # ── Step 5: Verdict & Real News Sourcing (Parallel) ────────────
    # We start real news search immediately to save time, even though we only 
    # keep the result if the verdict turns out to be Fake/Misleading.
    topic_query = f"{title} fact check real news"
    real_news_task = asyncio.create_task(cross_reference.find_real_news(topic_query))
    
    verdict_task = asyncio.create_task(verdict_engine.generate_verdict(
        source_credibility=cred_result["credibility_score"],
        manipulation_score=linguistic["manipulation_score"],
        evidence=evidence,
        claims=claims,
        source_flags=cred_result["flags"],
    ))
    
    verdict_result, real_news_result = await asyncio.gather(verdict_task, real_news_task)
    
    # ── Step 6: Process Real news sourcing ──────
    real_news_sources = []
    what_really_happened = None

    if verdict_result["verdict"] in ("Fake", "Misleading"):
        what_really_happened = real_news_result.get("what_really_happened")
        for s in real_news_result.get("sources", []):
            real_news_sources.append(RealNewsSource(**s))

    elapsed_ms = int((time.time() - start_time) * 1000)

    return AnalyzeResponse(
        verdict=verdict_result["verdict"],
        confidence_score=verdict_result["confidence_score"],
        explanation=verdict_result["explanation"],
        what_really_happened=what_really_happened,
        real_news_sources=real_news_sources,
        claims=claims,
        manipulation_score=linguistic["manipulation_score"],
        bias_score=bias["bias_score"],
        bias_type=bias["bias_type"],
        sentiment_intensity=bias["sentiment_intensity"],
        flagged_sentences=linguistic["flagged_sentences"],
        source_credibility=cred_result["credibility_score"],
        evidence=evidence,
        processing_time_ms=elapsed_ms,
    )
