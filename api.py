from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from orchestrator.engine import process_query

import os

app = FastAPI(title="Modular RAG API - Salesforce Architect")

# Enable CORS for frontend environments
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# In-memory dictionary to store conversation history by session_id
# Format: {"session_123": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
sessions = {}

class ChatRequest(BaseModel):
    session_id: str
    message: str


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    session_id = request.session_id
    message = request.message

    if not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Initialize session if it doesn't exist
    if session_id not in sessions:
        sessions[session_id] = []

    # Step 1: Append the user's message to history FIRST
    sessions[session_id].append({"role": "user", "content": message})

    # Step 2: Pass the full chat_history (including current message) to the engine
    chat_history = sessions[session_id]

    try:
        result = await process_query(chat_history=chat_history, session_id=session_id)
        
        reply = result.get("reply", "")
        tool_used = result.get("tool_used", "none")
        
        # Step 3: Append the AI response to history
        sessions[session_id].append({"role": "assistant", "content": reply})
        
        return {
            "status": "success", 
            "data": {
                "reply": reply, 
                "tool_used": tool_used
            }
        }
        
    except Exception as e:
        # Remove the user message from history if the engine failed
        sessions[session_id].pop()
        raise HTTPException(status_code=500, detail=str(e))
