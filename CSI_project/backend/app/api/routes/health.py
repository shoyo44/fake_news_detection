from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services import cloudflare_ai
from app.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
async def health():
    """Health check — verifies Cloudflare AI and Tavily connectivity."""
    cf_ok = await cloudflare_ai.is_connected() if settings.cf_account_id and settings.cf_api_token else False
    tavily_ok = bool(settings.tavily_api_key)

    return HealthResponse(
        status="ok",
        cloudflare_connected=cf_ok,
        tavily_connected=tavily_ok,
    )
