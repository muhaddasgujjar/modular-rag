import httpx
import base64
import asyncio

async def get_github_file(repo_owner: str, repo_name: str, file_path: str) -> dict:
    """
    Fetch a file from a public GitHub repository using the REST API.
    Returns a standardized dictionary.
    """
    try:
        url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents/{file_path}"
        headers = {
            "Accept": "application/vnd.github.v3+json",
            # Optional: Add GitHub token here if rate limits are hit
            # "Authorization": "token YOUR_TOKEN"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=10)
            
            if response.status_code == 404:
                return {
                    "status": "error",
                    "message": f"File '{file_path}' not found in repository {repo_owner}/{repo_name}."
                }
                
            response.raise_for_status()
            data = response.json()

        if "content" not in data:
            return {
                "status": "error",
                "message": "API response did not contain file content. (Might be a directory?)"
            }

        # Decode base64 content
        encoded_content = data["content"]
        decoded_bytes = base64.b64decode(encoded_content)
        decoded_string = decoded_bytes.decode('utf-8')

        return {
            "status": "success",
            "data": {
                "file_name": data.get("name", file_path),
                "content": decoded_string[:2000] + "\n...[CONTENT TRUNCATED FOR LENGTH]" if len(decoded_string) > 2000 else decoded_string
            }
        }

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 403:
             return {
                "status": "error",
                "message": "GitHub API rate limit exceeded or access forbidden."
            }
        return {
            "status": "error",
            "message": f"HTTP error occurred: {str(e)}"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"GitHub API error: {str(e)}"
        }

if __name__ == "__main__":
    import json
    print("Testing get_github_file('tiangolo', 'fastapi', 'README.md')...")
    result = asyncio.run(get_github_file("tiangolo", "fastapi", "README.md"))
    
    # Truncate content specifically for clean terminal output in this test
    if result["status"] == "success" and len(result["data"]["content"]) > 300:
        result["data"]["content"] = result["data"]["content"][:300] + "... [TRUNCATED FOR TERMINAL OUTPUT]"
        
    print("\nResult:")
    print(json.dumps(result, indent=2))
