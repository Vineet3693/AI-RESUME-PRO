"""
Database initialization module.

Creates tables and provides async session factory.
Called once at FastAPI startup via lifespan handler.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker

from db.models import Base


class Database:
    """
    Database connection manager.
    
    Handles async engine creation and session management.
    Uses SQLite for development, PostgreSQL for production.
    """
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.engine = None
        self.async_session_maker = None
    
    def connect(self) -> None:
        """
        Create async engine and session maker.
        
        Called once at application startup.
        """
        self.engine = create_async_engine(
            self.database_url,
            echo=False,  # Set to True for SQL debugging
            future=True
        )
        self.async_session_maker = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
    
    async def create_tables(self) -> None:
        """
        Create all database tables.
        
        Safe to call multiple times - only creates missing tables.
        Called at startup in development mode.
        """
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    async def disconnect(self) -> None:
        """
        Close database connections.
        
        Called at application shutdown.
        """
        if self.engine:
            await self.engine.dispose()
    
    def get_session_maker(self) -> async_sessionmaker:
        """
        Get the async session maker.
        
        Used by FastAPI dependency injection.
        """
        if not self.async_session_maker:
            raise RuntimeError("Database not initialized. Call connect() first.")
        return self.async_session_maker


# Global database instance
db = Database(None)


def init_database(database_url: str) -> Database:
    """
    Initialize the global database instance.
    
    Called from FastAPI lifespan handler.
    
    Args:
        database_url: SQLAlchemy database URL
        
    Returns:
        Initialized Database instance
    """
    global db
    db = Database(database_url)
    db.connect()
    return db
