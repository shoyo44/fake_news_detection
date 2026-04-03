import json
from app.services import cloudflare_ai

SYSTEM_PROMPT = """You are an expert fact-checker, political scientist, and linguistic analyst.
Your job is to analyze the provided text comprehensively and output ONLY a single valid JSON object.

RULES FOR CLAIMS:
1. Extract 1 to 3 primary factual assertions (e.g. "Person X did Y", "New law passed").
2. Ignore opinions, generic tautologies, and background state facts.

RULES FOR LINGUISTICS & BIAS:
1. Detect manipulation tactics (fear-mongering, emotional clickbait, scapegoating, etc.).
2. Flag exactly 1-2 sentences that show the most manipulation or bias, if any.
3. Assess the bias direction (None, Left, Right, Authoritarian, Other) and score (0-10).

Output MUST perfectly match this JSON structure:
{
  "claims": ["claim1", "claim2"],
  "linguistic": {
    "manipulation_score": <float 0.0 to 10.0>,
    "tactics_detected": ["tactic1", "tactic2"],
    "flagged_sentences": ["sentence1", "sentence2"],
    "analysis": "<one sentence summary>"
  },
  "bias": {
    "bias_score": <float 0.0 to 10.0, 0=neutral, 10=extremely biased>,
    "bias_type": "<None|Left|Right|Authoritarian|Other>",
    "sentiment_intensity": <float 0.0 to 10.0>,
    "primary_emotions": ["emotion1", "emotion2"],
    "is_high_arousal": <boolean>
  }
}"""

async def analyze_content(text: str) -> dict:
    prompt = f"Analyze this text:\n\n{text[:3000]}"
    
    default_result = {
        "claims": [],
        "linguistic": {
            "manipulation_score": 5.0,
            "tactics_detected": [],
            "flagged_sentences": [],
            "analysis": "Analysis unavailable."
        },
        "bias": {
            "bias_score": 0.0,
            "bias_type": "None",
            "sentiment_intensity": 0.0,
            "primary_emotions": [],
            "is_high_arousal": False
        }
    }

    try:
        response = await cloudflare_ai.chat(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=1024)
        start = response.find("{")
        end = response.rfind("}") + 1
        if start != -1 and end > start:
            parsed = json.loads(response[start:end])
            
            # Merge parsed with defaults to ensure all keys exist
            return {
                "claims": parsed.get("claims", []),
                "linguistic": {**default_result["linguistic"], **parsed.get("linguistic", {})},
                "bias": {**default_result["bias"], **parsed.get("bias", {})}
            }
    except Exception:
        pass
        
    # Fallback to simple sentence splitting for claims
    sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 30]
    default_result["claims"] = sentences[:3]
    return default_result
