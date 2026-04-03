import httpx
import asyncio
from app.config import get_settings

settings = get_settings()


async def chat(prompt: str, system_prompt: str = "", max_tokens: int = 1024) -> str:
    """
    Call Cloudflare Workers AI LLM (llama-3.1-8b-instruct).
    Returns the text response. Includes 1 retry attempt on failure.
    """
    url = f"{settings.cf_base_url}/{settings.cf_llm_model}"

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "messages": messages,
        "max_tokens": max_tokens,
        "stream": False,
    }

    headers = {
        "Authorization": f"Bearer {settings.cf_api_token}",
        "Content-Type": "application/json",
    }

    for attempt in range(2):  # 2 attempts total
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                return data["result"]["response"]
        except Exception as e:
            if attempt == 1:  # last attempt
                print(f"Cloudflare AI Error (Final): {e}")
                raise
            print(f"Cloudflare AI Error (Attempt {attempt+1}): {e}. Retrying...")
            await asyncio.sleep(1)


async def is_connected() -> bool:
    """Quick ping to verify Cloudflare AI credentials are valid."""
    try:
        result = await chat("Reply with just: OK", max_tokens=5)
        return bool(result)
    except Exception:
        return False
