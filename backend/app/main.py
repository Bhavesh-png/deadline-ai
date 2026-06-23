# DeadlineAI – FastAPI Backend
import os
import time
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.routes import tasks, ai, analytics

app = FastAPI(
    title="DeadlineAI API",
    description="AI-powered productivity backend using Google Gemini & NVIDIA NIM",
    version="1.0.0",
    docs_url="/docs",
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-AI-Provider", "X-NVIDIA-API-Key", "X-Gemini-API-Key"],
)


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
        return response

app.add_middleware(SecurityHeadersMiddleware)


# Simple In-Memory Rate Limiter (IP-based)
# Limits to 100 requests per 60 seconds per IP address
rate_limit_records = defaultdict(list)

class RateLimiterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow documentation and root health endpoints bypass
        path = request.url.path
        if path in ["/", "/health", "/docs", "/openapi.json"]:
            return await call_next(request)

        client_ip = request.client.host
        now = time.time()
        
        # Clean older entries
        rate_limit_records[client_ip] = [t for t in rate_limit_records[client_ip] if now - t < 60]
        
        if len(rate_limit_records[client_ip]) >= 100:
            return starlette_json_response_limit_exceeded()
            
        rate_limit_records[client_ip].append(now)
        return await call_next(request)

def starlette_json_response_limit_exceeded():
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": "Too many requests. Rate limit exceeded. Please retry after 1 minute."}
    )

app.add_middleware(RateLimiterMiddleware)


# Routes
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])


@app.get("/")
async def root():
    return {
        "app": "DeadlineAI",
        "version": "1.0.0",
        "status": "running",
        "agents": ["planning", "prioritization", "scheduling", "reminder", "reflection"],
        "ai_providers": ["Google Gemini", "NVIDIA NIM"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "gemini": bool(os.getenv("GEMINI_API_KEY")), "nvidia": bool(os.getenv("NVIDIA_API_KEY"))}
