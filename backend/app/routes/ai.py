from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.models.schemas import AnalyzeTaskRequest, GenerateScheduleRequest, RescheduleRequest, ChatRequest
from app.agents.ai_agents import (
    planning_agent, scheduling_agent, reschedule_agent, chat_agent
)
from app.services.auth_service import get_current_user_id

router = APIRouter()


@router.post("/analyze-task")
async def analyze_task(
    request: AnalyzeTaskRequest,
    x_ai_provider: Optional[str] = Header(None, alias="X-AI-Provider"),
    x_nvidia_api_key: Optional[str] = Header(None, alias="X-NVIDIA-API-Key"),
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key"),
    current_uid: str = Depends(get_current_user_id)
):
    """Planning Agent: Analyze task and break into subtasks."""
    try:
        result = await planning_agent(
            request.user_input,
            provider=x_ai_provider,
            nvidia_api_key=x_nvidia_api_key,
            gemini_api_key=x_gemini_api_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-schedule")
async def generate_schedule(
    request: GenerateScheduleRequest,
    x_ai_provider: Optional[str] = Header(None, alias="X-AI-Provider"),
    x_nvidia_api_key: Optional[str] = Header(None, alias="X-NVIDIA-API-Key"),
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key"),
    current_uid: str = Depends(get_current_user_id)
):
    """Scheduling Agent: Create optimal daily schedule."""
    try:
        subtasks = [s.dict() for s in request.subtasks]
        schedule = await scheduling_agent(
            request.task_title,
            subtasks,
            request.deadline,
            provider=x_ai_provider,
            nvidia_api_key=x_nvidia_api_key,
            gemini_api_key=x_gemini_api_key
        )
        return {"schedule": schedule}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reschedule")
async def reschedule(
    request: RescheduleRequest,
    x_ai_provider: Optional[str] = Header(None, alias="X-AI-Provider"),
    x_nvidia_api_key: Optional[str] = Header(None, alias="X-NVIDIA-API-Key"),
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key"),
    current_uid: str = Depends(get_current_user_id)
):
    """Rescheduling Agent: Adapt schedule after missed deadline."""
    try:
        remaining = [s.dict() for s in request.subtasks if not s.done]
        result = await reschedule_agent(
            request.task_title,
            request.missed_date,
            request.deadline,
            remaining,
            request.reason or "",
            provider=x_ai_provider,
            nvidia_api_key=x_nvidia_api_key,
            gemini_api_key=x_gemini_api_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def chat(
    request: ChatRequest,
    x_ai_provider: Optional[str] = Header(None, alias="X-AI-Provider"),
    x_nvidia_api_key: Optional[str] = Header(None, alias="X-NVIDIA-API-Key"),
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-API-Key"),
    current_uid: str = Depends(get_current_user_id)
):
    """Chat Agent: Empathic chat with context."""
    try:
        response = await chat_agent(
            request.message,
            request.context,
            provider=x_ai_provider,
            nvidia_api_key=x_nvidia_api_key,
            gemini_api_key=x_gemini_api_key
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
