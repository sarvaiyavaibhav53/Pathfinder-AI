import json
import logging
from sqlalchemy.orm import Session
from db.models import ChatMessage
from llm.gemini_client import generate_chat_reply

logger = logging.getLogger(__name__)

# List of obvious off-topic keywords/phrases for lightweight pre-filter
OFF_TOPIC_KEYWORDS = [
    "capital of france", "capital of germany", "capital of japan",
    "tell me a joke", "who is the president", "weather in",
    "recipe for", "write a poem", "solve this math problem"
]

def _is_obvious_off_topic(message: str) -> bool:
    msg_lower = message.lower()
    for phrase in OFF_TOPIC_KEYWORDS:
        if phrase in msg_lower:
            return True
    return False

def process_chat(db: Session, user_id: int, message: str, context: dict = None) -> dict:
    """Processes a user chat message with context grounding, persistent history, and Gemini fallback."""
    # 1. Keyword pre-filter for obvious off-topic queries
    if _is_obvious_off_topic(message):
        decline_text = (
            "I'm Pathfinder AI, your career intelligence assistant. "
            "I can only help answer questions about your career skills, role fit, job market recommendations, and learning roadmap. "
            "Please ask a question related to your career readiness!"
        )
        # Store user query & polite decline in DB for history continuity
        user_msg = ChatMessage(user_id=user_id, role="user", content=message)
        assistant_msg = ChatMessage(user_id=user_id, role="assistant", content=decline_text)
        db.add(user_msg)
        db.add(assistant_msg)
        db.commit()
        return {"answer": decline_text, "warnings": []}

    # 2. Fetch last 10 messages BEFORE inserting current message (up to 5 conversation turns)
    recent_history = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.id.desc())
        .limit(10)
        .all()
    )
    recent_history.reverse()  # Chronological order

    # Format history for prompt
    history_lines = []
    for msg in recent_history:
        role_label = "Student" if msg.role == "user" else "Assistant"
        history_lines.append(f"{role_label}: {msg.content}")
    history_str = "\n".join(history_lines) if history_lines else "None (starting fresh conversation)"

    # 3. Store user message in DB
    user_msg = ChatMessage(user_id=user_id, role="user", content=message)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 4. Serialize authoritative context JSON
    context_str = json.dumps(context, indent=2) if context else "No context provided"

    # 5. Build grounded prompt
    prompt = f"""You are the Pathfinder AI Assistant, embedded in a student's dashboard.

Rules:
1. Answer using ONLY the Pathfinder AI context supplied in this request. Do not invent companies, salaries, job counts, skills, scores, role probabilities, ROI values, or learning times.
2. Do not recalculate Pathfinder AI scores or make a new prediction. Explain the supplied result — do not replace it. (e.g., correct: "Your result shows Full Stack Developer at 72% confidence, based on..." — incorrect: "I think you're probably a Full Stack Developer.")
3. If the supplied context doesn't contain enough information to answer, say so plainly. Do not claim access to information that was not supplied.
4. Stay scoped to career readiness — skills, roadmap, role fit, matched companies, and this platform's numbers. Politely decline and redirect for anything else.
5. Keep replies short — 2 to 5 sentences or a brief list.

CONTEXT (authoritative — this is exactly what the student is viewing):
{context_str}

RECENT CONVERSATION (for continuity only, not authoritative for facts):
{history_str}

Student's new message: "{message}"

Respond with only your reply — no preamble, no repeated question."""

    # 6. Call Gemini LLM client
    result = generate_chat_reply(prompt)
    answer_text = result.get("answer", "I'm sorry, I couldn't process your request.")
    warnings = result.get("warnings", [])

    # 7. Store assistant reply in DB
    assistant_msg = ChatMessage(user_id=user_id, role="assistant", content=answer_text)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return {"answer": answer_text, "warnings": warnings}

def get_chat_history(db: Session, user_id: int) -> list[ChatMessage]:
    """Retrieves full chat history for a specific user ordered chronologically."""
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.id.asc())
        .all()
    )
