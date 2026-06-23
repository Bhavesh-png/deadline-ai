# 🧠 DeadlineAI – The Last-Minute Life Saver

> **AI-powered productivity companion** built with Google Gemini, React, FastAPI, and Firebase.
> Built for the **Vibe2Ship Hackathon 2026**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Firebase-orange)](https://your-project.web.app)
[![Gemini API](https://img.shields.io/badge/AI-Google%20Gemini%202.0-blue)](https://ai.google.dev)

---

## 🚀 Features

- 🧠 **5 AI Agents** – Planning, Prioritization, Scheduling, Reminder, Reflection
- 📅 **Dynamic AI Scheduling** – Gemini creates and adapts your daily schedule
- 🎯 **Smart Prioritization** – Urgency × Importance matrix
- 🔥 **Gamification** – XP, streaks, achievement badges
- 📊 **Analytics** – AI-generated productivity insights
- 🌓 **Dark/Light Mode** – Premium glassmorphism design
- 🤖 **AI Chat Assistant** – Floating Gemini-powered chat

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 + Framer Motion |
| Backend | FastAPI (Python) |
| AI | Google Gemini 2.0 Flash |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Google Sign-In) |
| Hosting | Firebase Hosting (frontend) |

---

## ⚡ Quick Start

### Frontend

```bash
cd frontend
cp .env.example .env
# Fill in your API keys in .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
# Fill in GEMINI_API_KEY in .env
uvicorn app.main:app --reload --port 8000
```

API docs at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔑 Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env`)

```env
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

---

## 🧠 AI Agents

| Agent | Role |
|-------|------|
| **Planning** | Decomposes goals into subtasks with effort estimates |
| **Prioritization** | Ranks tasks by urgency × importance |
| **Scheduling** | Creates day-by-day personalized schedules |
| **Reminder** | Generates context-aware motivational reminders |
| **Reflection** | Analyzes productivity patterns and trends |

---

## 📁 Project Structure

```
deadline-ai/
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route pages
│   │   ├── services/   # Gemini + Firebase services
│   │   ├── context/    # React context providers
│   │   └── config/     # Firebase config
│   └── package.json
├── backend/            # FastAPI backend
│   ├── app/
│   │   ├── agents/     # 5 AI agents
│   │   ├── routes/     # API endpoints
│   │   ├── services/   # Firebase Admin service
│   │   └── models/     # Pydantic schemas
│   └── requirements.txt
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/create` | Create task |
| GET | `/tasks` | List user tasks |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| POST | `/ai/analyze-task` | Planning Agent |
| POST | `/ai/generate-schedule` | Scheduling Agent |
| POST | `/ai/reschedule` | Rescheduling Agent |
| GET | `/analytics` | Reflection Agent |

---

## 🎯 Demo Mode

The app works **without any API keys** in demo mode:
- Pre-loaded sample tasks and data
- Simulated AI responses (realistic mock data)
- Full UI and animations work

---

## 🔥 Google Technologies Used

- ✅ Google AI Studio + Gemini 2.0 Flash
- ✅ Firebase Authentication
- ✅ Firebase Firestore
- ✅ Firebase Hosting (deployment-ready)
- ✅ Google Fonts (Inter + Outfit)

---

## 📜 License

MIT – Built with ❤️ for Vibe2Ship Hackathon 2026
