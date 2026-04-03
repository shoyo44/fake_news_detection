import json
from app.services import cloudflare_ai


SYSTEM_PROMPT = """You are an extremely strict and skeptical fact-checking analyst. 
Your goal is to verify if the provided evidence DIRECTLY and EXPLICITLY supports or contradicts the claims.

RULES FOR VERDICT:
- "Real": Only if the evidence snippets EXPLICITLY confirm the specific claim and the actors involved. 
- "Fake": Use this if:
    (a) The evidence snippets from fact-checkers (Snopes, FactCheck.org, PolitiFact, Reuters, BBC, etc.) EXPLICITLY label the claim as FALSE, DEBUNKED, or a HOAX.
    (b) Multiple reputable sources state this specific claim has been scientifically disproven or officially denied.
    (c) The claim is a well-known conspiracy theory (e.g. "5G spreads COVID", "vaccines cause autism") that has been repeatedly debunked.
- "Misleading": Use this ONLY if the claim is a distortion or missing context, but NOT outright false. Also use this if there is NO DIRECT EVIDENCE at all despite finding related topics.

CRITICAL: Do NOT confuse "Misleading" with "Fake". If fact-checkers call it FALSE or DEBUNKED, that is FAKE, not Misleading.
Do NOT hallucinate. If the evidence mentions a topic but DOES NOT mention the specific person in the claim, treat the claim as UNVERIFIED/MISLEADING. 
Do NOT claim Wikipedia or Al Jazeera verified something unless it is literally in the provided snippets.

Return ONLY a valid JSON object:
{
  "verdict": "<Real|Misleading|Fake>",
  "confidence_score": <integer 0-100>,
  "explanation": "<2-3 sentences explaining exactly why the evidence does or does not support the claim.>"
}"""


async def generate_verdict(
    source_credibility: int,
    manipulation_score: float,
    evidence: list[dict],
    claims: list[str],
    source_flags: list[str],
) -> dict:
    """
    Fuse all agent signals into a final verdict using weighted scoring + LLM reasoning.
    """

    # Build evidence summary for LLM context
    evidence_lines = [
        f"- {e['title']} ({e['url']}): {e['snippet']}"
        for e in evidence[:5]
    ]
    evidence_summary = "\n".join(evidence_lines) if evidence_lines else "No cross-references found."

    prompt = f"""Analyze these signals and determine the verdict:

source_credibility_score: {source_credibility}/100
source_flags: {source_flags}
manipulation_score: {manipulation_score}/10
claims: {claims}
cross_reference_evidence:
{evidence_summary}"""

    try:
        # If no evidence was found, determine verdict from numeric signals alone
        if not evidence:
            # High manipulation + no reputable evidence = likely fabricated/fake
            if manipulation_score >= 7.5:
                return {
                    "verdict": "Fake",
                    "confidence_score": 75,
                    "explanation": (
                        "No credible sources were found to support this claim, and the content "
                        "displays high manipulation indicators. This combination strongly suggests "
                        "the claim is fabricated or a known debunked conspiracy."
                    ),
                }
            return {
                "verdict": "Misleading",
                "confidence_score": 40,
                "explanation": "No direct cross-referenced evidence could be found to verify these specific claims from reputable sources.",
            }

        response = await cloudflare_ai.chat(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=512)
        start = response.find("{")
        end = response.rfind("}") + 1
        if start != -1 and end > start:
            result = json.loads(response[start:end])
            verdict = result.get("verdict", "Misleading")
            explanation = result.get("explanation", "").lower()
            confidence = int(result.get("confidence_score", 50))

            # HEURISTIC CONSISTENCY CHECK:
            # If the LLM says "not supported" or "unverified" in its own explanation, 
            # we MUST NOT return "Real" even if the LLM hallucinated that verdict field.
            skeptic_words = ["not supported", "unverified", "no direct evidence", "lack of evidence", "misleading"]
            if verdict == "Real" and any(word in explanation for word in skeptic_words):
                verdict = "Misleading"
                confidence = min(confidence, 45)

            if verdict not in ("Real", "Misleading", "Fake"):
                verdict = "Misleading"

            return {
                "verdict": verdict,
                "confidence_score": confidence,
                "explanation": result.get("explanation", ""),
            }
    except Exception as e:
        print(f"Verdict Engine Error: {e}")
        pass

    # Hard fallback based on numeric signals
    score = source_credibility - (manipulation_score * 5)
    if score >= 65:
        verdict = "Real"
    elif score >= 35:
        verdict = "Misleading"
    else:
        verdict = "Fake"

    return {
        "verdict": verdict,
        "confidence_score": max(0, min(100, int(score))),
        "explanation": "Verdict determined from source credibility and manipulation signals.",
    }
