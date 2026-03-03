import asyncio
import httpx
import json

API_URL = "http://127.0.0.gov:8000/chat"
API_URL = "http://127.0.0.1:8000/chat"

async def make_request(session_id: str, message: str, delay: int = 0):
    if delay > 0:
        await asyncio.sleep(delay)
        
    print(f"\n[Request] Session: '{session_id}' | Message: '{message}'")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                API_URL, 
                json={"session_id": session_id, "message": message}
            )
            response.raise_for_status()
            data = response.json()
            print(f"\n[Response] Session: '{session_id}'\n{json.dumps(data, indent=2)}")
            return data
    except Exception as e:
        print(f"\n[Error] {str(e)}")
        return None

async def run_audit():
    print("Starting Terminal Audit for Phase 6...\n")
    
    # We will simulate 3 concurrent/coordinated requests
    # Request 1: Salesforce Question (session_1)
    # Request 2: Follow-up to Request 1 (session_1) -> Needs delay to ensure R1 finishes
    # Request 3: Out of bounds (session_2) -> Fires simultaneously with R1
    
    req1 = make_request("test_session_1", "What are the governor limits for SOQL queries in Salesforce?")
    
    # Give req1 10 seconds head start so it processes completely before we ask the follow up. 
    # This prevents race conditions on the session storage while still validating async structure.
    req2 = make_request("test_session_1", "And what is the cross-namespace limit for them?", delay=10)
    
    # Fired instantly alongside req1 to prove guardrails work asynchronously
    req3 = make_request("test_session_2", "Give me a recipe for chocolate cake")
    
    await asyncio.gather(req1, req3, req2)
    print("\nAudit complete.")

if __name__ == "__main__":
    asyncio.run(run_audit())
