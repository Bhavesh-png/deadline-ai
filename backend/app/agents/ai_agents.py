# DeadlineAI – AI Agents Service (Gemini & NVIDIA NIM)
import os
import json
import re
import httpx
from datetime import date, timedelta
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# We still retain get_model for backward compatibility if needed, but generate_llm_content is preferred
API_KEY = os.getenv("GEMINI_API_KEY")
_model = None

def get_model():
    global _model
    if not API_KEY:
        return None
    if _model is None:
        genai.configure(api_key=API_KEY)
        _model = genai.GenerativeModel("gemini-2.0-flash")
    return _model


def sanitize_prompt_input(text: str) -> str:
    """Sanitize user input to prevent prompt injections, escaping issues, or HTML formatting exploits."""
    # Truncate overly long prompts
    cleaned = text[:800]
    # Strip HTML tags
    cleaned = re.sub(r"<[^>]*>", "", cleaned)
    # Remove system override injection keywords
    cleaned = re.sub(r"(ignore previous instructions|ignore all previous|you are now a|jailbreak|system prompt)", "[REDACTED_INJECTION_ATTEMPT]", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


async def generate_llm_content(
    prompt: str,
    provider: str = None,
    nvidia_api_key: str = None,
    gemini_api_key: str = None
) -> str:
    """Unified LLM router that calls Google Gemini or NVIDIA NIM based on provider configuration."""
    env_gemini_key = os.getenv("GEMINI_API_KEY")
    env_nvidia_key = os.getenv("NVIDIA_API_KEY")

    gemini_key = gemini_api_key or env_gemini_key
    nvidia_key = nvidia_api_key or env_nvidia_key

    # Resolve provider: check parameter first, then fallback to environment presence
    if not provider:
        if gemini_key:
            provider = "gemini"
        elif nvidia_key:
            provider = "nvidia"
        else:
            raise ValueError("No API keys configured.")

    if provider == "nvidia":
        if not nvidia_key:
            raise ValueError("NVIDIA API key not provided.")
        url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1").rstrip("/") + "/chat/completions"
        model_name = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
        headers = {
            "Authorization": f"Bearer {nvidia_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "max_tokens": 1024
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, json=payload, headers=headers)
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"].strip()
    else:  # gemini
        if not gemini_key:
            raise ValueError("Gemini API key not provided.")
        genai.configure(api_key=gemini_key)
        
        # Configure safety settings to block harmful content
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
        ]
        
        m = genai.GenerativeModel("gemini-2.0-flash")
        response = await m.generate_content_async(prompt, safety_settings=safety_settings)
        return response.text.strip()


def parse_json_response(text: str) -> dict | list:
    """Parse response, stripping markdown blocks and extracting JSON boundaries."""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json|JSON)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        try:
            start_dict = cleaned.find("{")
            end_dict = cleaned.rfind("}")
            if start_dict != -1 and end_dict != -1 and end_dict > start_dict:
                return json.loads(cleaned[start_dict : end_dict + 1])
                
            start_arr = cleaned.find("[")
            end_arr = cleaned.rfind("]")
            if start_arr != -1 and end_arr != -1 and end_arr > start_arr:
                return json.loads(cleaned[start_arr : end_arr + 1])
        except Exception as e:
            print(f"Failed to extract JSON boundary: {e}")
        raise


# ─── Mock Responses ───────────────────────────────────────────────────────────

def mock_analyze(user_input: str) -> dict:
    deadline = (date.today() + timedelta(days=7)).isoformat()
    return {
        "title": user_input[:50],
        "priority": "medium",
        "estimated_hours": 24,
        "deadline": deadline,
        "subtasks": [
            {"id": "1", "title": "Research and planning", "estimated_hours": 3, "done": False},
            {"id": "2", "title": "Design and architecture", "estimated_hours": 4, "done": False},
            {"id": "3", "title": "Core implementation", "estimated_hours": 8, "done": False},
            {"id": "4", "title": "Integration and testing", "estimated_hours": 5, "done": False},
            {"id": "5", "title": "Documentation and deployment", "estimated_hours": 4, "done": False},
        ],
        "tags": ["development", "high-priority"],
        "urgency": 8,
        "complexity": 7,
        "recommendation": "Start immediately with a 2-hour daily session for optimal results.",
    }


def mock_schedule(subtasks: list, deadline: str) -> list:
    today = date.today()
    return [
        {
            "date": (today + timedelta(days=i)).isoformat(),
            "activity": st["title"],
            "hours": st.get("estimated_hours", 3),
            "subtask_id": st["id"],
        }
        for i, st in enumerate(subtasks[:7])
    ]


# ─── Planning Agent ───────────────────────────────────────────────────────────

async def planning_agent(
    user_input: str,
    provider: str = None,
    nvidia_api_key: str = None,
    gemini_api_key: str = None
) -> dict:
    """Break down a task into subtasks with effort estimates."""
    sanitized_input = sanitize_prompt_input(user_input)
    prompt = f"""You are an expert AI planning agent for DeadlineAI.
    
Analyze this task and respond with ONLY valid JSON (no markdown):
Task: "{sanitized_input}"
Today: {date.today().isoformat()}

{{
  "title": "clean task title (max 60 chars)",
  "priority": "high|medium|low",
  "estimated_hours": <number>,
  "deadline": "YYYY-MM-DD",
  "subtasks": [
    {{"id": "1", "title": "subtask", "estimated_hours": <number>, "done": false}}
  ],
  "tags": ["tag1", "tag2"],
  "urgency": <1-10>,
  "complexity": <1-10>,
  "recommendation": "brief actionable advice (1 sentence)"
}}"""

    try:
        text = await generate_llm_content(
            prompt, provider=provider, nvidia_api_key=nvidia_api_key, gemini_api_key=gemini_api_key
        )
        return parse_json_response(text)
    except Exception as e:
        print(f"Planning agent error: {e}")
        return mock_analyze(user_input)


# ─── Prioritization Agent ─────────────────────────────────────────────────────

async def prioritization_agent(
    tasks: list,
    provider: str = None,
    nvidia_api_key: str = None,
    gemini_api_key: str = None
) -> list:
    """Rank tasks by urgency × importance matrix."""
    prompt = f"""You are an expert prioritization agent.
    
Rank these tasks by urgency × importance. Return ONLY valid JSON array:
Tasks: {json.dumps(tasks)}

[
  {{"id": "task_id", "score": <1-100>, "reasoning": "brief reason"}}
]"""

    try:
        text = await generate_llm_content(
            prompt, provider=provider, nvidia_api_key=nvidia_api_key, gemini_api_key=gemini_api_key
        )
        ranked = parse_json_response(text)
        score_map = {r["id"]: r["score"] for r in ranked}
        return sorted(tasks, key=lambda t: -score_map.get(t.get("id", ""), 50))
    except Exception as e:
        print(f"Prioritization agent error: {e}")
        return tasks


# ─── Scheduling Agent ─────────────────────────────────────────────────────────

async def scheduling_agent(
    task_title: str,
    subtasks: list,
    deadline: str,
    provider: str = None,
    nvidia_api_key: str = None,
    gemini_api_key: str = None
) -> list:
    """Create an optimal daily schedule."""
    prompt = f"""You are an expert scheduling agent.

Create an optimal daily schedule. Return ONLY valid JSON array:
Task: "{task_title}"
Deadline: {deadline}
Subtasks: {json.dumps(subtasks)}
Today: {date.today().isoformat()}

[
  {{"date": "YYYY-MM-DD", "activity": "description", "hours": <number>, "subtask_id": "id"}}
]

Ensure all subtasks are scheduled before the deadline. Balance workload across days."""

    try:
        text = await generate_llm_content(
            prompt, provider=provider, nvidia_api_key=nvidia_api_key, gemini_api_key=gemini_api_key
        )
        return parse_json_response(text)
    except Exception as e:
        print(f"Scheduling agent error: {e}")
        return mock_schedule(subtasks, deadline)


# ─── Reminder Agent ───────────────────────────────────────────────────────────

async def reminder_agent(
    task_title: str,
    deadline: str,
    days_left: int,
    provider: str = None,
    nvidia_api_key: str = None,
    gemini_api_key: str = None
) -> dict:
    """Generate context-aware reminder messages."""
    prompt = f"""You are an empathetic reminder agent.

Generate a context-aware reminder. Return ONLY valid JSON:
Task: "{task_title}"
Deadline: {deadline}
Days left: {days_left}

{{
  "subject": "email subject line",
  "message": "personalized 2-sentence message",
  "action": "specific next action",
  "tone": "urgent|motivating|gentle"
}}"""

    try:
        text = await generate_llm_content(
            prompt, provider=provider, nvidia_api_key=nvidia_api_key, gemini_api_key=gemini_api_key
        )
        return parse_json_response(text)
    except Exception as e:
        print(f"Reminder agent error: {e}")
        return {"subject": f"Reminder: {task_title}", "message": "Don't forget!", "action": "Check your tasks", "tone": "gentle"}


# ─── Reflection Agent ─────────────────────────────────────────────────────────

async def reflection_agent(
    completed_count: int,
    pending_count: int,
    streak: int,
    provider: str = None,
    nvidia_api_key: str = None,
    gemini_api_key: str = None
) -> dict:
    """Analyze productivity patterns and suggest improvements."""
    prompt = f"""You are a productivity reflection agent.

Analyze and respond with ONLY valid JSON:
Completed this week: {completed_count}
Pending: {pending_count}
Current streak: {streak} days

{{
  "score": <0-100>,
  "insights": ["insight1", "insight2", "insight3"],
  "weekly_trend": "improving|declining|stable",
  "recommendation": "one actionable improvement"
}}"""

    try:
        text = await generate_llm_content(
            prompt, provider=provider, nvidia_api_key=nvidia_api_key, gemini_api_key=gemini_api_key
        )
        return parse_json_response(text)
    except Exception as e:
        print(f"Reflection agent error: {e}")
        score = min(100, int((completed_count / max(completed_count + pending_count, 1)) * 100))
        return {
            "score": score,
            "insights": [
                "You work most efficiently in focused 90-minute sessions.",
                f"Your completion rate is {score}% – above average!",
                "Breaking tasks into subtasks increases your throughput significantly.",
            ],
            "weekly_trend": "improving",
            "recommendation": "Schedule your most complex tasks for morning hours.",
        }


# ─── Reschedule Agent ─────────────────────────────────────────────────────────

async def reschedule_agent(
    task_title: str,
    missed_date: str,
    deadline: str,
    remaining_subtasks: list,
    reason: str = "",
    provider: str = None,
    nvidia_api_key: str = None,
    gemini_api_key: str = None
) -> dict:
    """Reschedule after a missed deadline."""
    prompt = f"""You are an empathetic rescheduling agent.

A user missed a scheduled session. Return ONLY valid JSON:
Task: "{task_title}"
Deadline: {deadline}
Missed date: {missed_date}
Reason: {reason or "Not specified"}
Remaining subtasks: {json.dumps(remaining_subtasks)}
Today: {date.today().isoformat()}

{{
  "message": "empathetic 2-sentence message",
  "new_schedule": [
    {{"date": "YYYY-MM-DD", "activity": "description", "hours": <number>}}
  ]
}}"""

    try:
        text = await generate_llm_content(
            prompt, provider=provider, nvidia_api_key=nvidia_api_key, gemini_api_key=gemini_api_key
        )
        return parse_json_response(text)
    except Exception as e:
        print(f"Reschedule agent error: {e}")
        new_schedule = mock_schedule(remaining_subtasks, deadline)
        return {
            "message": "No worries! Everyone has off days. I've rescheduled your remaining tasks optimally.",
            "new_schedule": new_schedule,
        }


# ─── Chat Agent ───────────────────────────────────────────────────────────────

async def chat_agent(
    message: str,
    context: dict = None,
    provider: str = None,
    nvidia_api_key: str = None,
    gemini_api_key: str = None
) -> str:
    """Concise & motivating chat response."""
    system_prompt = f"""You are DeadlineAI, an empathetic and proactive AI productivity coach. 
You help users manage tasks, meet deadlines, and stay motivated. 
Keep responses concise (2-3 sentences max), actionable, and encouraging.
Current user context: {json.dumps(context or {})}"""

    try:
        text = await generate_llm_content(
            f"{system_prompt}\n\nUser: {message}",
            provider=provider,
            nvidia_api_key=nvidia_api_key,
            gemini_api_key=gemini_api_key
        )
        return text
    except Exception as e:
        print(f"Chat agent error: {e}")
        return "I'm here to help you stay on track! What would you like to work on today?"
