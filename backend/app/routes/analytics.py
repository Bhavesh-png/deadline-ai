from fastapi import APIRouter, HTTPException, Depends, status, Header
from typing import Optional
from app.agents.ai_agents import reflection_agent
from app.services.auth_service import get_current_user_id

router = APIRouter()


@router.get("")
async def get_analytics(
    user_id: str,
    completed: int = 0,
    pending: int = 0,
    streak: int = 0,
    x_ai_provider: Optional[str] = Header(None, alias="X-AI-Provider"),
    x_nvidia_api_key: Optional[str] = Header(None, alias="X-NVIDIA-API-Key"),
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key"),
    current_uid: str = Depends(get_current_user_id)
):
    """Reflection Agent: Generate productivity analytics and insights."""
    if user_id != current_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot view another user's analytics"
        )
    try:
        insights = await reflection_agent(
            completed,
            pending,
            streak,
            provider=x_ai_provider,
            nvidia_api_key=x_nvidia_api_key,
            gemini_api_key=x_gemini_api_key
        )
        return {
          "user_id": user_id,
          "analytics": insights,
          "summary": {
              "total_tasks": completed + pending,
              "completed": completed,
              "pending": pending,
              "completion_rate": round(completed / max(completed + pending, 1) * 100),
              "streak": streak,
          }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
