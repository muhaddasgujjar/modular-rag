import os
import chromadb
from chromadb.utils import embedding_functions
import asyncio

async def query_salesforce_knowledge(user_query: str, top_k: int = 3) -> dict:
    """
    Query the persistent ChromaDB collection for the Salesforce Apex Developer Guide.
    Returns a standardized dictionary.
    """
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        chroma_store_path = os.path.join(current_dir, "..", "db", "chroma_store")
        
        if not os.path.exists(chroma_store_path):
            return {
                "status": "error",
                "message": f"ChromaDB store not found at {chroma_store_path}. Run Phase 2 ingestion first."
            }

        def _query():
            client = chromadb.PersistentClient(path=chroma_store_path)
            default_ef = embedding_functions.DefaultEmbeddingFunction()
            
            try:
                collection = client.get_collection(
                    name="salesforce_knowledge", 
                    embedding_function=default_ef
                )
            except Exception as e:
                 return {
                    "status": "error",
                    "message": f"Collection 'salesforce_knowledge' does not exist. {str(e)}"
                }
    
            # Perform similarity search
            results = collection.query(
                query_texts=[user_query],
                n_results=top_k
            )
            return results

        results = await asyncio.to_thread(_query)
        
        if isinstance(results, dict) and results.get("status") == "error":
            return results

        if not results["documents"] or len(results["documents"][0]) == 0:
             return {
                "status": "success",
                "data": {
                    "retrieved_chunks": []
                }
            }
            
        # Format the results
        retrieved_chunks = []
        for i in range(len(results["documents"][0])):
            chunk_data = {
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i] if results["metadatas"] else {}
            }
            retrieved_chunks.append(chunk_data)

        return {
            "status": "success",
            "data": {
                "retrieved_chunks": retrieved_chunks,
                "query": user_query
            }
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"RAG query error: {str(e)}"
        }

if __name__ == "__main__":
    import json
    
    query = "What are the governor limits for SOQL queries?"
    print(f"Testing query_salesforce_knowledge('{query}')...")
    
    result = asyncio.run(query_salesforce_knowledge(query))
    
    print("\nResult:")
    print(json.dumps(result, indent=2))
