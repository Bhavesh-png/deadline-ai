# Firebase Admin SDK Service
import os
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, firestore

    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    project_id = os.getenv("FIREBASE_PROJECT_ID")

    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    elif project_id:
        firebase_admin.initialize_app(options={"projectId": project_id})
    else:
        raise ValueError("No Firebase credentials found")

    _db = firestore.client()
    FIREBASE_ENABLED = True
    print("[OK] Firebase Admin initialized")

except Exception as e:
    print(f"[WARN] Firebase not configured (demo mode): {e}")
    FIREBASE_ENABLED = False
    _db = None


# ─── Mock Store (demo mode) ───────────────────────────────────────────────────
_mock_tasks = {}


async def create_task(user_id: str, task_data: dict) -> str:
    task_id = f"task_{datetime.now().timestamp()}"
    task_data["id"] = task_id
    task_data["created_at"] = datetime.now().isoformat()

    if FIREBASE_ENABLED and _db:
        _, ref = _db.collection("tasks").add({**task_data, "user_id": user_id})
        return ref.id

    _mock_tasks[task_id] = task_data
    return task_id


async def get_user_tasks(user_id: str) -> list:
    if FIREBASE_ENABLED and _db:
        docs = _db.collection("tasks").where("user_id", "==", user_id).stream()
        return [{"id": d.id, **d.to_dict()} for d in docs]
    return [t for t in _mock_tasks.values() if t.get("user_id") == user_id]


async def update_task(task_id: str, updates: dict) -> None:
    updates["updated_at"] = datetime.now().isoformat()
    if FIREBASE_ENABLED and _db:
        _db.collection("tasks").document(task_id).update(updates)
        return
    if task_id in _mock_tasks:
        _mock_tasks[task_id].update(updates)


async def delete_task(task_id: str) -> None:
    if FIREBASE_ENABLED and _db:
        _db.collection("tasks").document(task_id).delete()
        return
    _mock_tasks.pop(task_id, None)


async def get_task(task_id: str) -> dict | None:
    if FIREBASE_ENABLED and _db:
        doc = _db.collection("tasks").document(task_id).get()
        return {**doc.to_dict(), "id": doc.id} if doc.exists else None
    return _mock_tasks.get(task_id)
