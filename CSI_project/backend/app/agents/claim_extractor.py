import json
from app.services import cloudflare_ai


SYSTEM_PROMPT = """You are a fact-checking assistant. Your job is to extract the main factual assertions from a news article or text.

RULES:
1. Return ONLY a JSON array of strings.
2. Focus on the PRIMARY news story or core assertions (e.g. "Person X did Y").
3. IGNORE background context, geographical facts, generic definitions, and universal truths/tautologies (e.g. "Tamil Nadu is a state", "The sun rises in the east").
4. Extract ONLY claims that are verifiable news events or specific allegations.
5. Extract 1 to 3 high-impact claims maximum.
6. Do not include opinions."""


async def extract_claims(text: str) -> list[str]:
    """Extract key factual claims from article text using Cloudflare LLM."""
    prompt = f"""Extract the key factual claims from this text:\n\n{text[:3000]}"""

    try:
        response = await cloudflare_ai.chat(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=512)
        # Parse JSON from response
        start = response.find("[")
        end = response.rfind("]") + 1
        if start != -1 and end > start:
            claims = json.loads(response[start:end])
            return [str(c) for c in claims if c]
    except Exception:
        pass

    # Fallback: split into sentences and take first 3
    sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 30]
    return sentences[:3]
