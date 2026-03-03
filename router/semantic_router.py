import os
import sys

# Add project root to sys.path so we can run this file directly as a script
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(current_dir, "..")
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from llm.groq_client import GroqLLM

# Strict ROSE framework system prompt for the Semantic Router
ROSE_SYSTEM_PROMPT = """Role: You are a strict security gatekeeper and router for a Salesforce Developer architecture.

Objective: Analyze the user's latest message IN CONTEXT of the conversation history and route it to the single most appropriate tool.

Scenario: We have three tools available:
- weather_tool: for real-world weather data (e.g. "What is the weather in London?")
- rag_tool: for ANYTHING about Salesforce, Apex, SOQL, CRM, code explanations, or ANY follow-up question that refers to code/content from the previous messages in this conversation.
- out_of_bounds: for anything not covered by the above.

CRITICAL CONTEXT RULE: If the user's question is a follow-up (e.g. 'explain the code', 'what does this do', 'can you elaborate', 'give me more examples') and the previous messages are about Salesforce/Apex/code, you MUST route to rag_tool.

Expected Solution: Think step-by-step using the conversation history. Output strictly as JSON with two keys: "reasoning" (brief Chain of Thought) and "tool_selection" (one of: "weather_tool", "rag_tool", or "out_of_bounds").

Rule: Default to rag_tool for any ambiguous code/explanation follow-up questions if Salesforce was previously discussed."""


async def route_query(user_query: str, history: list = None) -> dict:
    """
    Takes the user's raw query + conversation history and routes to the correct tool.
    History is injected so the router understands follow-up questions in context.
    """
    try:
        llm = GroqLLM()
        
        # Build a context-aware routing prompt
        if history and len(history) > 0:
            # Take the last 6 messages (3 turns) for routing context
            recent = history[-6:]
            history_text = "\n".join(
                f"{msg['role'].upper()}: {msg['content']}" for msg in recent
            )
            routing_prompt = f"""Recent conversation history:
{history_text}

Latest user message to route: {user_query}"""
        else:
            routing_prompt = user_query

        result = await llm.generate_json(
            prompt=routing_prompt,
            system_prompt=ROSE_SYSTEM_PROMPT,
            model="llama-3.1-8b-instant"
        )
        return result
    except Exception as e:
        return {
            "reasoning": f"Error occurred during routing: {str(e)}",
            "tool_selection": "out_of_bounds"
        }


if __name__ == "__main__":
    import json
    
    test_queries = [
        "How do I write an asynchronous batch class in Apex?",
        "Should I take an umbrella to Paris today?",
        "Can you pull the requirements.txt from the langchain-ai/langchain repo?"
    ]
    
    print("================== SEMANTIC ROUTER TERMINAL AUDIT ==================\n")
    for query in test_queries:
        print(f"QUERY: \"{query}\"")
        result = route_query(query)
        print("ROUTER RESPONSE (JSON):")
        print(json.dumps(result, indent=2))
        print("-" * 60 + "\n")
    print("====================================================================")
