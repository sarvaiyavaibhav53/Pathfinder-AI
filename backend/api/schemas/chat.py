import json
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from typing import Optional, List
from datetime import datetime

class ChatContextRoleFit(BaseModel):
    model_config = ConfigDict(extra="forbid")

    predicted_role: Optional[str] = Field(None, max_length=100)
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)

class ChatContextRecommendation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    match_percent: Optional[float] = Field(None, ge=0.0, le=100.0)
    missing_skills: Optional[List[str]] = Field(None, max_length=20)
    companies_you_would_qualify_for: Optional[List[str]] = Field(None, max_length=20)

    @field_validator("missing_skills", "companies_you_would_qualify_for")
    @classmethod
    def validate_list_items(cls, items: Optional[List[str]]) -> Optional[List[str]]:
        if items is not None:
            for item in items:
                if len(item) > 200:
                    raise ValueError("List items in context must not exceed 200 characters")
        return items

class ChatContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    domain: Optional[str] = Field(None, max_length=100)
    roleFit: Optional[ChatContextRoleFit] = None
    recommendation: Optional[ChatContextRecommendation] = None

class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str = Field(..., max_length=1000)
    context: Optional[ChatContext] = None

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Message cannot be empty or whitespace-only.")
        return trimmed

    @model_validator(mode="after")
    def validate_context_size(self):
        if self.context is not None:
            context_json = json.dumps(self.context.model_dump())
            if len(context_json.encode("utf-8")) > 4096:
                raise ValueError("Context size exceeds maximum allowed limit of 4KB.")
        return self

class ChatHistoryItem(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    history: List[ChatHistoryItem]

class ChatResponse(BaseModel):
    answer: str
    warnings: List[str] = []
