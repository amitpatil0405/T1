from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.models.schemas import LoginRequest, LoginResponse, UserOut
from app.core.security import verify_password, create_access_token, decode_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session"
        )

    user_id = payload["sub"]
    user = db.query(User).filter(User.user_id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    return user

@router.post("/login", response_model=LoginResponse)
def login(login_req: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == login_req.user_id).first()
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid User ID or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )

    token = create_access_token(data={"sub": user.user_id})

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return LoginResponse(user_id=user.user_id)

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="session_token")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(user_id=current_user.user_id, is_active=current_user.is_active)
