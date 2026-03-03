import os
import chromadb
import pymupdf4llm
from chromadb.utils import embedding_functions
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader

def ingest_web_url(url: str, chunk_size=1000, chunk_overlap=200):
    """
    Scrapes a web URL using BeautifulSoup, chunks it, and stores it in the ChromaDB collection.
    Returns the number of chunks added.
    """
    print(f"1. Scraping web URL: {url}")
    loader = WebBaseLoader(url)
    docs = loader.load()
    
    if not docs:
        raise ValueError(f"Could not extract any content from URL: {url}")
        
    print("2. Splitting extracted text into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    chunks = text_splitter.split_documents(docs)
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    chroma_store_path = os.path.join(current_dir, "chroma_store")
    
    print("3. Connecting to ChromaDB...")
    client = chromadb.PersistentClient(path=chroma_store_path)
    default_ef = embedding_functions.DefaultEmbeddingFunction()
    
    collection = client.get_or_create_collection(
        name="salesforce_knowledge",
        embedding_function=default_ef
    )
    
    print(f"4. Generating metadata and IDs for {len(chunks)} chunks...")
    documents_to_insert = []
    metadatas_to_insert = []
    ids_to_insert = []
    
    import uuid
    import time
    
    base_id = str(uuid.uuid4())[:8]
    
    for i, chunk in enumerate(chunks):
        documents_to_insert.append(chunk.page_content)
        
        # Attach required metadata
        meta = chunk.metadata.copy()
        meta["source"] = url
        meta["ingested_at"] = str(time.time())
        
        # Ensure primitive metadata
        clean_meta = {k: str(v) for k, v in meta.items()}
        metadatas_to_insert.append(clean_meta)
        
        ids_to_insert.append(f"web_{base_id}_chunk_{i}")
        
    print(f"5. Storing to ChromaDB...")
    batch_size = 5000
    for i in range(0, len(documents_to_insert), batch_size):
        collection.add(
            documents=documents_to_insert[i:i+batch_size],
            metadatas=metadatas_to_insert[i:i+batch_size],
            ids=ids_to_insert[i:i+batch_size]
        )
        
    print(f"Successfully ingested {len(chunks)} chunks from {url}")
    return len(chunks)

def main():
    # Resolve paths relative to this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(current_dir, "..")
    pdf_path = os.path.join(project_root, "salesforce_apex_developer_guide.pdf")
    chroma_store_path = os.path.join(current_dir, "chroma_store")

    print(f"1. Converting PDF to Markdown string...")
    print(f"   Source: {pdf_path}")
    md_text = pymupdf4llm.to_markdown(pdf_path)
    
    print("2. Splitting by Markdown Headers...")
    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on,
        strip_headers=True
    )
    md_header_splits = markdown_splitter.split_text(md_text)
    
    print("3. Recursive Character Splitting...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(md_header_splits)
    
    print("4. Initializing ChromaDB and Storing Chunks...")
    client = chromadb.PersistentClient(path=chroma_store_path)
    
    # Use Chroma's default embedding function (all-MiniLM-L6-v2 ONNX)
    default_ef = embedding_functions.DefaultEmbeddingFunction()
    
    collection = client.get_or_create_collection(
        name="salesforce_knowledge",
        embedding_function=default_ef
    )
    
    # Prepare data arrays for ChromaDB
    documents_to_insert = []
    metadatas_to_insert = []
    ids_to_insert = []
    
    for i, chunk in enumerate(chunks):
        documents_to_insert.append(chunk.page_content)
        
        # Attach required metadata
        meta = chunk.metadata.copy()
        meta["source"] = "salesforce_apex_developer_guide.pdf"
        
        # Ensure all metadata values are primitive types (string, int, float, bool)
        clean_meta = {k: str(v) for k, v in meta.items()}
        metadatas_to_insert.append(clean_meta)
        
        ids_to_insert.append(f"chunk_{i}")
        
    print(f"   Adding {len(chunks)} chunks to ChromaDB (this might take a few moments)...")
    
    # Batch add to avoid potential size limits in Chroma
    batch_size = 5000
    for i in range(0, len(documents_to_insert), batch_size):
        collection.add(
            documents=documents_to_insert[i:i+batch_size],
            metadatas=metadatas_to_insert[i:i+batch_size],
            ids=ids_to_insert[i:i+batch_size]
        )
        print(f"   Batch {i // batch_size + 1} added.")
        
    print("\n================= TERMINAL AUDIT =================")
    print(f"Total chunks successfully generated: {len(chunks)}")
    print("-" * 50)
    
    if len(chunks) > 150:
        print("Metadata of chunk index [150]:")
        print(metadatas_to_insert[150])
        print("\nRaw page_content of chunk index [150]:")
        print(documents_to_insert[150])
    else:
        print("Note: Less than 150 chunks were generated.")
    print("==================================================\n")


if __name__ == "__main__":
    main()
