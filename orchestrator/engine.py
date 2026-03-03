import os
import sys
import json

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(current_dir, "..")
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from llm.groq_client import GroqLLM
from router.semantic_router import route_query
from tools.weather_tool import get_weather
from tools.rag_tool import query_salesforce_knowledge


SYSTEM_PROMPT = """You are a highly capable AI assistant for Salesforce architecture and development.
You have full memory of this conversation — use it to give coherent, contextual, helpful responses.
You are given tool data relevant to the user's query. Synthesize it into a natural, clear answer.
Do not mention JSON, internal tools, or backend systems. Just answer helpfully and directly."""


def get_out_of_bounds_message():
    return "I am a specialized Salesforce AI Architect. I can answer questions about Salesforce/Apex, real-time weather, and Salesforce CRM architecture. I can't help with unrelated topics."


async def extract_parameters(query: str, tool_name: str, llm: GroqLLM) -> dict:
    """
    Uses the fast 8B model to extract structured parameters for the selected tool.
    Only the latest user query string is needed here (not the full history).
    """
    if tool_name == "rag_tool":
        return {"user_query": query}
        
    elif tool_name == "weather_tool":
        system_prompt = """You are a parameter extraction bot. Extract the city name from the user's weather query.
Output strictly as JSON with a single key "city_name". Example: {"city_name": "London"}"""
    
    else:
        return {}

    try:
        return await llm.generate_json(prompt=query, system_prompt=system_prompt)
    except Exception as e:
        print(f"Error extracting parameters: {e}")
        return {}


async def synthesize_response(tool_data: dict, chat_history: list, llm: GroqLLM) -> str:
    """
    Constructs the final LLM call as:
      [System Prompt] + chat_history (all turns including current user message)
    Then appends a hidden tool-context message so the LLM has relevant data.
    """
    # Build the messages array: system + full conversation history
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Trim to last 20 messages to stay within token limits (10 back-and-forth turns)
    messages.extend(chat_history[-20:])
    
    # Inject tool data as a system-level context note, not as a user message
    tool_context = f"\n\n[System Note: The following data was retrieved from a specialized tool to help answer the latest user message. Use it to craft your response.]\n{json.dumps(tool_data, indent=2)}"
    messages[-1] = {
        "role": messages[-1]["role"],
        "content": messages[-1]["content"] + tool_context
    }

    try:
        return await llm.generate_with_messages(messages=messages)
    except Exception as e:
        return f"Error synthesizing response: {str(e)}"


async def process_query(chat_history: list, session_id: str = "default") -> dict:
    """
    Main orchestration pipeline per Phase 11:
    chat_history = full history including the current user message at the end.
    
    Pipeline: Router (latest msg only) -> Param Extract -> Tool -> Synthesize ([System] + chat_history)
    """
    print("  [Orchestrator] Initializing Groq Client...")
    llm = GroqLLM()
    
    # Extract the latest user message from the end of chat_history for routing
    latest_user_message = ""
    for msg in reversed(chat_history):
        if msg.get("role") == "user":
            latest_user_message = msg.get("content", "")
            break
    
    print(f"  [Orchestrator] Latest user message: '{latest_user_message}'")
    
    # Step 1: Route — pass ONLY the latest user message to the router
    # (The router also gets recent history for follow-up context awareness)
    print("  [Orchestrator] Routing query...")
    recent_history = chat_history[:-1]  # all messages before the current one
    route_data = await route_query(latest_user_message, history=recent_history)
    tool_name = route_data.get("tool_selection", "none")
    print(f"  [Orchestrator] Route selected: {tool_name}")
    print(f"  [Orchestrator] Reasoning: {route_data.get('reasoning')}")
    
    if tool_name == "out_of_bounds":
        return {"reply": get_out_of_bounds_message(), "tool_used": "none"}
        
    if tool_name == "none" or tool_name not in ["weather_tool", "rag_tool"]:
        return {"reply": "I'm sorry, I couldn't determine which tool to use for that query.", "tool_used": "none"}
        
    # Step 2: Extract Parameters (from latest user message only)
    print(f"  [Orchestrator] Extracting parameters for {tool_name}...")
    params = await extract_parameters(latest_user_message, tool_name, llm)
    print(f"  [Orchestrator] Extracted params: {params}")
    
    # Step 3: Execute Tool
    print("  [Orchestrator] Executing tool...")
    tool_data = {}
    if tool_name == "weather_tool":
        tool_data = await get_weather(params.get("city_name", ""))
    elif tool_name == "rag_tool":
        tool_data = await query_salesforce_knowledge(params.get("user_query", latest_user_message))
        
    if tool_data.get("status") == "error":
        return {"reply": f"I encountered an error while fetching data: {tool_data.get('message')}", "tool_used": tool_name}
        
    print("  [Orchestrator] Tool execution successful. Synthesizing final response...")
    
    # Step 4: Synthesize — passes [System Prompt] + full chat_history to the 70B LLM
    final_response = await synthesize_response(tool_data=tool_data, chat_history=chat_history, llm=llm)
    return {"reply": final_response, "tool_used": tool_name}


