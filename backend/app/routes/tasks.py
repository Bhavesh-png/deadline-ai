from fastapi import APIRouter, HTTPException, Depends, status
from app.models.schemas import TaskCreate, TaskUpdate
from app.services.firebase_service import (
    create_task, get_user_tasks, update_task, delete_task, get_task
)
from app.services.auth_service import get_current_user_id

router = APIRouter()


@router.post("/create")
async def create_task_endpoint(task: TaskCreate, current_uid: str = Depends(get_current_user_id)):
    if task.user_id != current_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot create task for another user"
        )
    try:
        task_id = await create_task(task.user_id, task.dict())
        return {"id": task_id, "message": "Task created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def get_tasks(user_id: str, current_uid: str = Depends(get_current_user_id)):
    if user_id != current_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot view another user's tasks"
        )
    try:
        tasks = await get_user_tasks(user_id)
        return {"tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{task_id}")
async def update_task_endpoint(task_id: str, updates: TaskUpdate, current_uid: str = Depends(get_current_user_id)):
    task = await get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task_owner = task.get("user_id") or task.get("userId")
    if task_owner != current_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot update another user's task"
        )
        
    try:
        await update_task(task_id, updates.dict(exclude_none=True))
        return {"message": "Task updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}")
async def delete_task_endpoint(task_id: str, current_uid: str = Depends(get_current_user_id)):
    task = await get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task_owner = task.get("user_id") or task.get("userId")
    if task_owner != current_uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot delete another user's task"
        )
        
    try:
        await delete_task(task_id)
        return {"message": "Task deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
