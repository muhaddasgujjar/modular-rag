import os
import json
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

class GroqLLM:
    """
    Object-oriented asynchronous wrapper for the Groq API.
    Provides standard text generation and forced JSON generation methods.
    """
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set. Check your .env file.")
        
        self.client = AsyncGroq(api_key=api_key)

    async def generate_text(self, prompt: str, system_prompt: str, model: str = "llama-3.3-70b-versatile", history: list = None) -> str:
        """
        Generate a standard natural language string response asynchronously.
        Accepts optional conversation history array.
        """
        messages = [{"role": "system", "content": system_prompt}]
        
        if history:
            # Keep only the last 20 messages (10 back-and-forth turns) to stay within token limits
            trimmed_history = history[-20:]
            messages.extend(trimmed_history)
            
        messages.append({"role": "user", "content": prompt})
        
        response = await self.client.chat.completions.create(
            messages=messages,
            model=model,
            temperature=0.7,
        )
        
        return response.choices[0].message.content

    async def generate_json(self, prompt: str, system_prompt: str, model: str = "llama-3.1-8b-instant") -> dict:
        """
        Generate a forced JSON response asynchronously, parsed into a Python dictionary.
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.client.chat.completions.create(
            messages=messages,
            model=model,
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        
        raw_json = response.choices[0].message.content
        try:
            return json.loads(raw_json)
        except json.JSONDecodeError as e:
            return {"status": "error", "message": f"Failed to parse Groq response as JSON: {e}", "raw": raw_json}
