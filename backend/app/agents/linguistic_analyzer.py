import json
from app.services import cloudflare_ai


SYSTEM_PROMPT = """You are a linguistic analysis expert specializing in detecting misinformation tactics.
Analyze the text for these manipulation patterns:
- Fear-mongering and false urgency
- Emotional clickbait language
- Scapegoating or conspiracy framing
- Opinion presented as fact
- Sensational exaggeration

Return ONLY a valid JSON object with this structure:
{
  "manipulation_score": <float 0.0 to 10.0>,
  "tactics_detected": ["tactic1", "tactic2"],
  "flagged_sentences": ["sentence1", "sentence2"],
  "analysis": "<one sentence summary>"
}"""


async def analyze_linguistics(text: str) -> dict:
    """
    Detect psychological manipulation and bias patterns in text.
    Returns manipulation_score, tactics, flagged_sentences.
    """
    prompt = f"Analyze this text for manipulation and misinformation tactics:\n\n{text[:3000]}"

    try:
        response = await cloudflare_ai.chat(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=768)

        start = response.find("{")
        end = response.rfind("}") + 1
        if start != -1 and end > start:
            result = json.loads(response[start:end])
            return {
                "manipulation_score": float(result.get("manipulation_score", 5.0)),
                "tactics_detected": result.get("tactics_detected", []),
                "flagged_sentences": result.get("flagged_sentences", []),
                "analysis": result.get("analysis", ""),
            }
    except Exception:
        pass

    return {
        "manipulation_score": 5.0,
        "tactics_detected": [],
        "flagged_sentences": [],
        "analysis": "Analysis unavailable.",
    }
