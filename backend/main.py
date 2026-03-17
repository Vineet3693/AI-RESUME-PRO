"""
FastAPI main application entry point.

Sets up:
- Lifespan handler (startup/shutdown)
- CORS middleware
- Rate limiting
- Router includes for all API endpoints
- WebSocket endpoint for real-time analysis
"""

import contextlib
from typing import AsyncGenerator

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import get_settings
from db import init_database
from api.ws_analyze import websocket_analyze


settings = get_settings()


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan handler.
    
    Runs once at startup and once at shutdown.
    Initializes database, loads ML models, and cleans up resources.
    """
    # Startup
    print("Starting AI Resume Pro backend...")
    
    # Initialize database
    db = init_database(settings.database_url)
    if settings.is_development:
        await db.create_tables()
        print("Database tables created (development mode)")
    
    # TODO: Load SpaCy model
    # TODO: Load sentence-transformers model
    # TODO: Pre-compute industry keyword embeddings
    
    print("Startup complete")
    
    yield
    
    # Shutdown
    print("Shutting down...")
    await db.disconnect()
    print("Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="AI Resume Pro",
    description="Industry-grade AI-powered resume analyzer and optimizer",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter
# from slowapi import SlowAPI
# app.state.limiter = Limiter(default_limits=[f"{settings.rate_limit_per_minute}/minute"])
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
# These will be added as we build each module
# from api import upload, export, jd_match, cover_letter, history, feedback
# app.include_router(upload.router)
# app.include_router(export.router)
# ... etc


# WebSocket endpoint for real-time analysis
@app.websocket("/ws/analyze")
async def analyze_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time resume analysis.
    
    Receives: {session_id, changed_lines: [{index, text}]}
    Returns: {line_tags: [{index, color, rule, suggestion}]}
    
    Debounce is handled CLIENT-SIDE (1.5s).
    This handler just processes what it receives.
    """
    await websocket_analyze(websocket)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.is_development
    )
