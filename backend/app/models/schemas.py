from pydantic import BaseModel, Field
from typing import Optional, List


class Subtask(BaseModel):
    id: str = Field(..., min_length=1, max_length=50, pattern=r"^[a-zA-Z0-9_\-]+$")
    title: str = Field(..., min_length=1, max_length=100)
    done: bool = False
    estimated_hours: Optional[float] = Field(None, ge=0, le=1000)


class ScheduleItem(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    activity: str = Field(..., min_length=1, max_length=200)
    hours: float = Field(2.0, ge=0, le=24)
    subtask_id: Optional[str] = Field(None, min_length=1, max_length=50, pattern=r"^[a-zA-Z0-9_\-]+$")


class AIAnalysis(BaseModel):
    effort: Optional[int] = Field(None, ge=0, le=1000)
    urgency: Optional[int] = Field(None, ge=1, le=10)
    tags: List[str] = Field(default=[], max_items=10)


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    deadline: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    priority: str = Field("medium", pattern=r"^(high|medium|low)$")
    user_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_\-]+$")
    subtasks: List[Subtask] = Field(default=[], max_items=100)
    schedule: List[ScheduleItem] = Field(default=[], max_items=100)
    ai_analysis: Optional[AIAnalysis] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    deadline: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    priority: Optional[str] = Field(None, pattern=r"^(high|medium|low)$")
    status: Optional[str] = Field(None, pattern=r"^(todo|in_progress|done)$")
    subtasks: Optional[List[Subtask]] = Field(None, max_items=100)
    schedule: Optional[List[ScheduleItem]] = Field(None, max_items=100)


class AnalyzeTaskRequest(BaseModel):
    user_input: str = Field(..., min_length=1, max_length=500)
    user_id: Optional[str] = Field(None, min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_\-]+$")


class GenerateScheduleRequest(BaseModel):
    task_title: str = Field(..., min_length=1, max_length=100)
    subtasks: List[Subtask] = Field(..., max_items=100)
    deadline: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    user_id: Optional[str] = Field(None, min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_\-]+$")


class RescheduleRequest(BaseModel):
    task_id: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_\-]+$")
    missed_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    reason: Optional[str] = Field(None, max_length=500)
    user_id: Optional[str] = Field(None, min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_\-]+$")
    task_title: str = Field(..., min_length=1, max_length=100)
    deadline: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    subtasks: List[Subtask] = Field(default=[], max_items=100)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    context: Optional[dict] = {}
