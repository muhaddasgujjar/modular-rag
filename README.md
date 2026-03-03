# Modular RAG | Salesforce Architect

A Next-Generation Enterprise AI application built on a Modular Retrieval-Augmented Generation (RAG) architecture. This system leverages advanced reasoning models (Llama 3 70B via Groq) alongside accurate vector retrieval (ChromaDB) to provide perfectly aligned, unhallucinated answers regarding Salesforce architecture, specifically the Apex Developer Guide.

## Key Features

*   **Modular Architecture:** Clean separation of concerns between the Frontend (React/Vite), Backend API (FastAPI), and Orchestrator Engine.
*   **Intelligent Reasoning:** Uses the powerful Groq `llama3-70b-8192` model for lightning-fast and highly coherent synthesis.
*   **Vector Retrieval (RAG):** Integrates ChromaDB and LangChain to retrieve precise chunks of facts from verified enterprise documents (e.g., Salesforce Apex Guide).
*   **Contextual Memory:** Enforces explicit memory logic. The AI remembers what it has already answered in a session and will directly defer to past answers rather than hallucinating or redundantly explaining.
*   **Beautiful UI:** A premium, dark-themed responsive React interface built with Tailwind CSS, Framer Motion for animations, and Lucide React for consistent iconography.
*   **Production Ready:** Support for dynamic API routing, explicit production CORS allowance (`ALLOWED_ORIGINS`), and Uvicorn/FastAPI port bindings configured for cloud deployments (like Render or Vercel).

## Technology Stack

### Frontend
*   React 18 + Vite
*   Tailwind CSS (Styling & Responsive Layout)
*   Framer Motion (Micro-animations)
*   React Router DOM (Navigation)

### Backend
*   Python 3.10+
*   FastAPI (RESTful API endpoints)
*   Uvicorn & Gunicorn (ASGI Server)
*   LangChain (Agentic tools and extraction)
*   Groq API (Model inference)
*   ChromaDB (Local/Persistent Vector Database)

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   A Groq API Key

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/muhaddasgujjar/modular-rag.git
    cd modular-rag
    ```

2.  **Backend Setup**
    Create a virtual environment and install dependencies:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

    Create a `.env` file in the root directory and add your keys:
    ```env
    GROQ_API_KEY=your_groq_api_key_here
    ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
    ```

    Run the FastAPI server:
    ```bash
    uvicorn api:app --reload --host 0.0.0.0 --port 8000
    ```

3.  **Frontend Setup**
    Navigate to the frontend folder and start Vite:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the Application**
    Open your browser and navigate to `http://localhost:5173`.

## Deployment

### Frontend (Vercel)
The `frontend/` directory includes a `vercel.json` file for immediate deployment. You can easily deploy the frontend by connecting the repository to Vercel and setting the Root Directory to `frontend`. Ensure you set the `VITE_API_URL` environment variable to your deployed backend's URL.

### Backend 
The backend is ASGI-ready via Uvicorn. It binds to `$PORT` automatically if provided by your host (Render, Heroku, DigitalOcean, etc.).