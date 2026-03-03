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

    # Retrieve memory history for this session
    if session_id not in sessions:
        sessions[session_id] = []
    
    history = sessions[session_id]

    try:
        # Pass the message and history to the async orchestrator
        result = await process_query(user_input=message, session_id=session_id, history=history)
        
        reply = result.get("reply", "")
        tool_used = result.get("tool_used", "none")
        
        # Append this turn to memory
        sessions[session_id].append({"role": "user", "content": message})
        sessions[session_id].append({"role": "assistant", "content": reply})
        
        return {
            "status": "success", 
            "data": {
                "reply": reply, 
                "tool_used": tool_used
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
