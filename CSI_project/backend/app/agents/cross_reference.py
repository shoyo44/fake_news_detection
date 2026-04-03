from tavily import TavilyClient
import asyncio
from app.config import get_settings
from app.services import cloudflare_ai

settings = get_settings()

TRUSTED_DOMAINS = [
    "bbc.com", "reuters.com", "apnews.com", "npr.org",
    "theguardian.com", "nytimes.com", "washingtonpost.com",
    "factcheck.org", "snopes.com", "politifact.com", "fullfact.org",
    "bloomberg.com", "economist.com", "bbc.co.uk",
    # India / Tamil Nadu domains
    "thehindu.com", "timesofindia.indiatimes.com", "hindustantimes.com",
    "indianexpress.com", "ndtv.com", "indiatoday.in", "theprint.in",
    "dailythanthi.com", "dinamalar.com", "dinakaran.com", "puthiyathalaimurai.com",
    "news18.com"
]


def _get_client() -> TavilyClient:
    return TavilyClient(api_key=settings.tavily_api_key)


async def _search_single_claim(claim: str) -> list[dict]:
    client = _get_client()
    evidence = []
    try:
        # First pass: search fact-checkers/trusted domains with "fact check debunked" suffix
        # This is the primary strategy for catching misinformation.
        fact_check_query = f"{claim} fact check debunked"
        result = await asyncio.to_thread(
            client.search,
            query=fact_check_query,
            search_depth="advanced",
            max_results=5,
            include_domains=TRUSTED_DOMAINS,
        )

        # Second pass (fallback): if trusted-domain search found nothing, do open search
        if not result.get("results"):
            result = await asyncio.to_thread(
                client.search,
                query=claim,
                search_depth="advanced",
                max_results=3,
            )

        for r in result.get("results", []):
            content = r.get("content", "")

            # Person-name filter: only apply when the claim contains a specific
            # multi-word proper name (e.g. "Joseph Vijay", "Narendra Modi").
            # We skip this filter for generic topic claims (e.g. "5G spreads COVID")
            # to avoid wrongly rejecting real evidence.
            words = claim.split()
            names = []
            for i in range(len(words) - 1):
                w1 = words[i].strip(",.?!'\"")
                w2 = words[i + 1].strip(",.?!'\"")
                if (
                    w1 and w2
                    and w1[0].isupper() and w2[0].isupper()
                    and len(w1) > 2 and len(w2) > 2
                    # Exclude common sentence-starters that aren't names
                    and w1 not in {"The", "This", "That", "These", "Those", "Scientists", "According"}
                ):
                    names.append(f"{w1} {w2}")

            if names:
                # Strict: if a specific person's name is in the claim,
                # the evidence snippet MUST mention them.
                if not any(name.lower() in content.lower() for name in names):
                    continue
            # No person-name filter applied for general topic claims — accept result.

            evidence.append({
                "claim": claim,
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "snippet": content[:300],
                "score": r.get("score", 0),
            })
    except Exception:
        pass

    return evidence

async def search_claims(claims: list[str]) -> list[dict]:
    """Search each claim and return supporting/contradicting evidence concurrently."""
    tasks = [_search_single_claim(claim) for claim in claims[:3]]
    results = await asyncio.gather(*tasks)
    
    evidence = [item for sublist in results for item in sublist]
    return evidence


async def find_real_news(topic_query: str) -> dict:
    """
    Find the real/accurate news that a fake story was derived from.
    Returns: {sources: [...], what_really_happened: str}
    """
    client = _get_client()

    # Search trusted domains only
    try:
        result = await asyncio.to_thread(
            client.search,
            query=topic_query,
            search_depth="advanced",
            max_results=3,
            include_domains=TRUSTED_DOMAINS,
        )

    except Exception:
        return {"sources": [], "what_really_happened": ""}

    raw_sources = result.get("results", [])
    if not raw_sources:
        return {"sources": [], "what_really_happened": ""}

    # Format sources
    sources = []
    context_snippets = []
    for r in raw_sources:
        domain = r["url"].split("/")[2].replace("www.", "")
        sources.append({
            "title": r.get("title", ""),
            "url": r.get("url", ""),
            "source": domain,
            "summary": r.get("content", "")[:250],
            "published_date": None,
        })
        context_snippets.append(f"- {r.get('title', '')}: {r.get('content', '')[:200]}")

    # Ask LLM to summarise what really happened
    context = "\n".join(context_snippets)
    prompt = (
        f"Based on these credible news sources, write a 2-3 sentence plain-English summary "
        f"of what actually happened (the real story):\n\n{context}"
    )
    try:
        what_really_happened = await cloudflare_ai.chat(prompt, max_tokens=256)
    except Exception:
        what_really_happened = "See the credible sources below for the accurate story."

    return {"sources": sources, "what_really_happened": what_really_happened.strip()}
