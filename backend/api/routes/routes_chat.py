from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User
from .routes_auth import get_current_user
from api.schemas.chat import ChatRequest, ChatResponse, ChatHistoryResponse, ChatHistoryItem
from services.chat_service import process_chat, get_chat_history
from services.rate_limiter import rate_limiter

router = APIRouter(tags=["Chat AI Assistant"])

@router.post("/chat", response_model=ChatResponse, summary="Send a message to Pathfinder AI Assistant")
def post_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sends a message to the grounded Pathfinder AI Assistant with context validation and rate limiting."""
    # Enforce per-user sliding window rate limit (15 requests/minute)
    rate_limiter.check_rate_limit(current_user.id)

    # Convert Pydantic context to dictionary if present
    context_dict = request.context.model_dump(exclude_none=True) if request.context else None

    result = process_chat(
        db=db,
        user_id=current_user.id,
        message=request.message,
        context=context_dict
    )

    return ChatResponse(
        answer=result.get("answer", ""),
        warnings=result.get("warnings", [])
    )

@router.get("/chat/history", response_model=ChatHistoryResponse, summary="Fetch user chat history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches persistent, user-isolated chat history ordered chronologically."""
    history_records = get_chat_history(db=db, user_id=current_user.id)
    
    items = [
        ChatHistoryItem(
            id=record.id,
            role=record.role,
            content=record.content,
            created_at=record.created_at
        )
        for record in history_records
    ]

    return ChatHistoryResponse(history=items)
