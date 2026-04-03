from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.agents import orchestrator

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Analyze text or a URL for misinformation.
    Returns verdict, confidence score, explanation, flagged sentences,
    and real news sources when content is Fake or Misleading.
    """
    if not request.text and not request.url:
        raise HTTPException(
            status_code=422,
            detail="Provide either 'text' or 'url' in the request body."
        )

    try:
        result = await orchestrator.run(text=request.text, url=request.url)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
