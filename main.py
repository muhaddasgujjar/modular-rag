import sys
import os
import asyncio

# Ensure the module can be run directly from the project root
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from orchestrator.engine import process_query

BANNER = """
=========================================================
            🧠 MODULAR RAG ARCHITECTURE 
          Divide and Conquer Microservices
=========================================================
Tools active:
 - Open-Meteo API (weather_tool)
 - GitHub REST API (github_tool)
 - Local ChromaDB via RAG (rag_tool)
---------------------------------------------------------
Type 'quit' or 'exit' to stop.
"""

def main():
    print(BANNER)
    
    while True:
        try:
            query = input("\n🔍 User: ").strip()
            
            if not query:
                continue
                
            if query.lower() in ['quit', 'exit', 'q']:
                print("\nShutting down...\n")
                break
                
            print("\n⚙️ System Thinking:")
            response = asyncio.run(process_query(query))
            reply = response.get("reply", "") if isinstance(response, dict) else response
            
            print("\n🤖 Final AI Response:")
            print("=" * 60)
            print(reply)
            print("=" * 60)
            
        except KeyboardInterrupt:
            print("\n\nForced exit. Shutting down...\n")
            break
        except Exception as e:
            print(f"\n❌ Unexpected System Error: {e}")

if __name__ == "__main__":
    main()
