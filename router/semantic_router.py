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

Objective: Analyze the user's input and route it to the single most appropriate data tool.

Scenario: We have three tools available. weather_tool (for real-world weather data), github_tool (for fetching code from public repositories), and rag_tool (for any questions regarding Salesforce, Apex, SOQL, or CRM architecture).

Expected Solution: You must think step-by-step. Output your response strictly as a JSON object with exactly two keys: "reasoning" (your brief Chain of Thought) and "tool_selection" (which must be exactly one of these strings: "weather_tool", "github_tool", "rag_tool", or "out_of_bounds").

Rule: If the user query is NOT about Weather, GitHub public repos, or Salesforce/Apex/SOQL, you must strictly output 'out_of_bounds' for the tool_selection key."""


async def route_query(user_query: str) -> dict:
    """
    Takes the user's raw query and passes it to the Groq generate_json method
    using the strict ROSE system prompt.
    Returns the parsed JSON dictionary containing reasoning and tool_selection.
    """
    try:
        llm = GroqLLM()
        result = await llm.generate_json(
            prompt=user_query,
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
