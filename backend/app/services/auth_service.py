# FastAPI Firebase Auth Verification Service
from fastapi import Header, HTTPException, status
from app.services.firebase_service import FIREBASE_ENABLED

if FIREBASE_ENABLED:
    from firebase_admin import auth

async def get_current_user_id(authorization: str = Header(None)) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )
        
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must start with Bearer",
        )
        
    token = authorization.split("Bearer ")[1]
    
    # Offline Demo Mode fallback
    if not FIREBASE_ENABLED:
        if token == "demo-token" or token.startswith("demo-"):
            return "demo-user-123"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token in offline demo mode",
        )
        
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
        )
