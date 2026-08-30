from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("UserProfile", back_populates="user", uselist=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skills = Column(JSON, nullable=True) # SQLite supports JSON via SQLAlchemy's JSON type
    education = Column(String, nullable=True)
    experience_years = Column(Integer, nullable=True)
    preferred_location = Column(String, nullable=True)
    preferred_field = Column(String, nullable=True)
    source = Column(String, nullable=True) # "resume" or "manual"

    user = relationship("User", back_populates="profile")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    skills_required = Column(JSON, nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    posted_date = Column(Date, nullable=True)

class SkillScore(Base):
    __tablename__ = "skill_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_name = Column(String, index=True, nullable=False)
    demand_score = Column(Float, nullable=True)
    avg_salary_impact = Column(Float, nullable=True)
    roi_score = Column(Float, nullable=True)

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_id = Column(String, unique=True, index=True, nullable=False)
    pin_hash = Column(String, nullable=False)
    role = Column(String, nullable=True, default="System Operator")
    last_login = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    actor = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=True)
    description = Column(String, nullable=True)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String, nullable=False)       # "user" | "assistant"
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

