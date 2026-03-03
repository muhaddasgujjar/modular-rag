import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(current_dir, "..")
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from llm.groq_client import GroqLLM
from router.semantic_router import route_query
from tools.weather_tool import get_weather
from tools.rag_tool import query_salesforce_knowledge


def get_out_of_bounds_message():
    return "I am a specialized Salesforce AI Architect. I can answer questions about Salesforce/Apex, real-time weather, or any web page you have ingested."

async def extract_parameters(query: str, tool_name: str, llm: GroqLLM) -> dict:
    """
    Uses the 8B model to extract specific parameters required by the selected tool.
    """
    if tool_name == "rag_tool":
        # RAG tool just needs the raw query
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


async def synthesize_response(query: str, tool_data: dict, llm: GroqLLM, history: list = None) -> str:
    """
    Takes the raw JSON output from the tool and the original query, and uses the 70B model
    to synthesize a natural language response.
    """
    import json
    
    system_prompt = """You are a highly capable AI assistant for Salesforce architecture.
You have full memory of this conversation. Use it to give coherent, contextual responses.
You are provided with the user's latest message and data from a specialized tool.
Synthesize the tool data into a natural, clear answer. Do not mention JSON or backend tools."""

    # Build the current turn's user message with tool context appended
    current_prompt = f"User: {query}\n\nRelevant Data:\n{json.dumps(tool_data, indent=2)}\n\nRespond naturally:"

    try:
        # Pass history so LLM maintains conversational context across turns
        return await llm.generate_text(prompt=current_prompt, system_prompt=system_prompt, history=history)
    except Exception as e:
        return f"Error synthesizing response: {str(e)}"


async def process_query(user_input: str, session_id: str = "default", history: list = None) -> dict:
    """
    Main orchestration pipeline: Router -> Parameter Extract -> Tool -> Synthesize.
    """
    print("  [Orchestrator] Initializing Groq Client...")
    llm = GroqLLM()
    
    # Step 1: Route
    print("  [Orchestrator] Routing query...")
    route_data = await route_query(user_input)
    tool_name = route_data.get("tool_selection", "none")
    print(f"  [Orchestrator] Route selected: {tool_name}")
    print(f"  [Orchestrator] Reasoning: {route_data.get('reasoning')}")
    
    if tool_name == "out_of_bounds":
        return {"reply": get_out_of_bounds_message(), "tool_used": "none"}
        
    if tool_name == "none" or tool_name not in ["weather_tool", "rag_tool"]:
        return {"reply": "I'm sorry, I couldn't determine which tool to use for that query.", "tool_used": "none"}
        
    # Step 2: Extract Parameters
    print(f"  [Orchestrator] Extracting parameters for {tool_name}...")
    params = await extract_parameters(user_input, tool_name, llm)
    print(f"  [Orchestrator] Extracted params: {params}")
    
    # Step 3: Execute Tool
    print("  [Orchestrator] Executing tool...")
    tool_data = {}
    if tool_name == "weather_tool":
        tool_data = await get_weather(params.get("city_name", ""))
    elif tool_name == "rag_tool":
        tool_data = await query_salesforce_knowledge(params.get("user_query", user_input))
        
    if tool_data.get("status") == "error":
        return {"reply": f"I encountered an error while fetching data: {tool_data.get('message')}", "tool_used": tool_name}
        
    print("  [Orchestrator] Tool execution successful. Synthesizing final response...")
    
    # Step 4: Synthesize Response
    final_response = await synthesize_response(user_input, tool_data, llm, history=history)
    return {"reply": final_response, "tool_used": tool_name}
