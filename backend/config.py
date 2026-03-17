"""
Configuration module for AI Resume Pro backend.

Reads environment variables from .env file using Pydantic Settings.
All configuration is validated at startup - missing or invalid vars will fail fast.
"""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore'
    )
    
    # API Keys (required for production)
    groq_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    
    # Security
    secret_key: str  # Required - used for JWT signing and encryption
    environment: str = 'development'
    
    # Database
    database_url: str = 'sqlite+aiosqlite:///./resume_pro.db'
    
    # Privacy mode default
    privacy_mode_default: bool = False
    
    # Ollama (local LLM)
    ollama_base_url: str = 'http://localhost:11434'
    ollama_model: str = 'llama3.2'
    
    # Rate limiting
    rate_limit_per_minute: int = 60
    
    # File upload limits
    max_upload_size_mb: int = 10
    
    # CORS origins (comma-separated)
    cors_origins: str = 'http://localhost:3000,http://127.0.0.1:3000'
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(',')]
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment.lower() == 'development'
    
    def validate_keys(self) -> None:
        """Validate that required keys are present."""
        if not self.secret_key or len(self.secret_key) < 32:
            raise ValueError(
                "SECRET_KEY must be at least 32 characters. "
                "Generate one with: python3 -c \"import secrets; print(secrets.token_hex(32))\""
            )
        
        # In production, require API keys
        if not self.is_development:
            if not self.groq_api_key:
                raise ValueError("GROQ_API_KEY is required in production")
            if not self.gemini_api_key:
                raise ValueError("GEMINI_API_KEY is required in production")


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Using lru_cache ensures settings are loaded only once at startup.
    This is called by FastAPI lifespan handler.
    """
    settings = Settings()
    settings.validate_keys()
    return settings
