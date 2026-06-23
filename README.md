# 🧠 DeadlineAI – The Last-Minute Life Saver

> **AI-powered productivity companion** built with multi-provider intelligence (Google Gemini & NVIDIA NIM), React, FastAPI, and Firebase.
> Built for the **Vibe2Ship Hackathon 2026**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Firebase-orange)](https://deadlineai-41435.web.app)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%202.0-blue)](https://ai.google.dev)
[![NVIDIA NIM](https://img.shields.io/badge/AI-NVIDIA%20NIM%20Llama%203.1-green)](https://integrate.api.nvidia.com)
[![Security Rating](https://img.shields.io/badge/Security-98%2F100-success)](file:///C:/Users/bhave/.gemini/antigravity-ide/brain/c7bbb461-28b1-4469-a00e-af60bedc3642/security_audit_report.md)

---

## 🚀 Key Features

* 🤖 **Dual-Provider AI Routing** – Slidably toggle between **Google Gemini** (client/server-side) and **NVIDIA NIM** (client-side direct or server fallback) via Settings.
* 🧠 **5 Autonomous AI Agents**:
  * **Planning Agent** – Decomposes high-level goals into task components and estimates effort.
  * **Prioritization Agent** – Evaluates tasks across the Urgency × Importance Eisenhower matrix.
  * **Scheduling Agent** – Generates custom day-by-day routines to meet hard deadlines.
  * **Reminder Agent** – Delivers context-sensitive motivational messages.
  * **Reflection Agent** – Analyzes trends and weekly streaks.
* 🔒 **Enterprise-Grade Security Hardening** (OWASP Top 10 Compliant):
  * **Global Rate Limiting** – In-memory IP-based protection (100 req/min).
  * **Injection Shield** – Pydantic model boundary constraints and prompt safety sanitizers.
  * **Security Headers** – Configured CSP, HSTS, X-Frame-Options (Clickjacking defense), and nosniff.
  * **Access Control** – Multi-token support (`userId` & `user_id`) in Firestore rules to eliminate IDOR.
* 📅 **Interactive Timeline Views** – Smart draggable board views, calendars, and circular achievement trackers.
* ⚡ **Zero-Config Demo Mode** – Runs out-of-the-box locally with simulated databases and agent actions.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 + Vite + Tailwind CSS v4 + Framer Motion (Spring Animations) |
| **Backend** | FastAPI (Python 3.12) + Uvicorn |
| **AI Providers** | Google Gemini (Gemini 2.0 Flash) & NVIDIA NIM (Llama 3.1 70B Instruct) |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Authentication (Google Sign-In) |
| **CI/CD / SAST** | GitHub Actions + Bandit (Security Scan) + ESLint + Ruff |
| **Deployment** | Firebase Hosting (Frontend) & Render (Backend) |

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate   # On Windows
source .venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env

# Run development server
uvicorn app.main:app --reload --port 8000
```
* API documents will be hosted at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Configure environment variables
copy .env.example .env

# Start dev server
npm run dev
```
* Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Environment Configuration

### Frontend (`frontend/.env`)
```env
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Backend (`backend/.env`)
```env
GEMINI_API_KEY=your-gemini-key
NVIDIA_API_KEY=your-nvidia-nim-key
FIREBASE_PROJECT_ID=your-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://deadlineai-41435.web.app
```

---

## 📁 Directory Structure

```
deadline-ai/
├── .github/workflows/
│   ├── ci-cd.yml          # Build & Lint checker
│   └── security.yml       # SAST security vulnerability scanner
├── backend/               # FastAPI Server
│   ├── app/
│   │   ├── agents/        # AI Agents routing & sanitizers
│   │   ├── models/        # Strict Pydantic models
│   │   ├── routes/        # API Endpoints
│   │   └── services/      # Auth & Firestore services
│   ├── requirements.txt
│   └── .python-version    # Build version lock
├── frontend/              # React App
│   ├── src/
│   │   ├── components/    # Glassmorphic UI containers
│   │   ├── context/       # Auth & Task providers
│   │   └── pages/         # Dashboard, Analytics, Calendar, Settings
│   └── package.json
├── firestore.rules        # Hardened Firestore DB rules
├── render.yaml            # Render Infrastructure as Code Blueprint
└── LICENSE
```

---

## 🛡️ Auditing & Production Compliance

* **[Security Hardening Report](file:///C:/Users/bhave/.gemini/antigravity-ide/brain/c7bbb461-28b1-4469-a00e-af60bedc3642/security_audit_report.md)**: Details the OWASP Top 10 checklist, threat mitigations, and scorecards.
* **[Integration Walkthrough](file:///C:/Users/bhave/.gemini/antigravity-ide/brain/c7bbb461-28b1-4469-a00e-af60bedc3642/walkthrough.md)**: Walks through Settings tabs, multi-provider API keys routing, and automated testing results.

---

## 🎯 Demo Mode & Google Sign-In Bypass

For testing, hackathon evaluations, or quick reviews:
1. **Google Sign-In Bypass**: When logging in, if Google shows a *"Google hasn't verified this app"* warning page:
   - Click **"Advanced"** on the bottom-left of the Google prompt screen.
   - Click **"Go to DeadlineAI (unsafe)"** at the bottom to continue logging in.
2. **Offline Demo Mode**: If you do not wish to authenticate using Google Sign-in:
   - The UI automatically enters offline demo mode when Firebase config keys are absent, providing mock task data, pre-loaded matrices, and client-side simulated AI responses so you can test all features offline.

---

## 📜 License

MIT License – Built with ❤️ for Vibe2Ship Hackathon 2026.
