# 🧠 DeadlineAI FastAPI Backend

This directory houses the backend server for **DeadlineAI**, an AI-powered productivity companion built with FastAPI and Google Gemini / NVIDIA NIM.

---

## ⚡ Setup & Run

### Prerequisites
* Python 3.12+

### Installation
1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   
   # Windows:
   .venv\Scripts\activate
   
   # macOS/Linux:
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   ```bash
   copy .env.example .env
   ```
   Modify `.env` and fill in your API keys (see below).

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

## 🔑 Environment Variables (`.env`)

```env
GEMINI_API_KEY=your-gemini-api-key
NVIDIA_API_KEY=your-nvidia-nim-key
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://deadlineai-41435.web.app
```

---

## 🌐 API Routes

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/tasks/create` | `POST` | Create a task (verifies IDOR) |
| `/tasks` | `GET` | Retrieve tasks for authenticated user |
| `/tasks/{id}` | `PUT` | Update task details |
| `/tasks/{id}` | `DELETE` | Delete task |
| `/ai/analyze-task` | `POST` | Planning Agent: breakdown goals into subtasks |
| `/ai/generate-schedule` | `POST` | Scheduling Agent: schedule tasks before deadline |
| `/ai/reschedule` | `POST` | Rescheduling Agent: adapt schedule after missed date |
| `/ai/chat` | `POST` | Chat Agent: floating chatbot messages |
| `/analytics` | `GET` | Reflection Agent: weekly metrics and performance insights |
| `/health` | `GET` | Server health check status |
