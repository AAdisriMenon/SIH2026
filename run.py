"""
Application Server Launcher (MoSJE SIH 2026 - Problem Statement #26092).
Starts the unified FastAPI backend and PWA frontend on port 8000.
"""
import uvicorn
import os
import sys

if __name__ == "__main__":
    # Ensure root path is in sys.path
    root_dir = os.path.dirname(os.path.abspath(__file__))
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)

    print("=" * 70)
    print(" Ministry of Social Justice and Empowerment (MoSJE)")
    print(" AI-Driven Scheme Matching Platform for Marginalised Entrepreneurs")
    print(" Smart India Hackathon 2026 - Problem Statement #26092")
    print("=" * 70)
    print(" * Server running at: http://localhost:8000")
    print(" * Interactive API Docs at: http://localhost:8000/docs")
    print("=" * 70)
    
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
