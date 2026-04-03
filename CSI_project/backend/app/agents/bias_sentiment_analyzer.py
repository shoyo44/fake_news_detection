import json
from app.services import cloudflare_ai

SYSTEM_PROMPT = """You are a political science and psychology expert. 
Analyze the text to detect ideological bias and emotional tone.

Return ONLY a valid JSON object:
{
  "bias_score": <float 0.0 to 10.0, 0=neutral, 10=extremely biased>,
  "bias_type": "<None|Left|Right|Authoritarian|Other>",
  "sentiment_intensity": <float 0.0 to 10.0, 0=calm/factual, 10=high-arousal/outraged>,
  "primary_emotions": ["emotion1", "emotion2"],
  "is_high_arousal": <boolean, true if likely to trigger strong emotional reaction>
}"""

async def analyze_bias_sentiment(text: str) -> dict:
    prompt = f"Analyze the tone and bias of this text:\n\n{text[:3000]}"
    
    try:
        response = await cloudflare_ai.chat(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=512)
        start = response.find("{")
        end = response.rfind("}") + 1
        if start != -1 and end > start:
            return json.loads(response[start:end])
    except Exception:
        pass

    return {
        "bias_score": 0.0,
        "bias_type": "None",
        "sentiment_intensity": 0.0,
        "primary_emotions": [],
        "is_high_arousal": False
    }
