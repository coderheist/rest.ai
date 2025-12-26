"""
Configuration module for AI Service
Handles environment variables, API keys, and application settings
"""
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "AI Resume Screener - AI Service"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:5173",  # Frontend dev server
        "http://localhost:3000",  # Alternative frontend
        "http://localhost:5000",  # Backend dev server
    ]
    
    # API Keys
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    
    # AI Model Configuration
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Scoring Configuration
    SCORING_MODE: str = os.getenv("SCORING_MODE", "hybrid")  # rule_based, hybrid, or llm_only
    HYBRID_LLM_THRESHOLD: float = float(os.getenv("HYBRID_LLM_THRESHOLD", "70.0"))  # Score threshold for LLM enhancement
    
    # Processing Limits
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", 10 * 1024 * 1024))  # 10MB
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", 10))
    MAX_TEXT_LENGTH: int = int(os.getenv("MAX_TEXT_LENGTH", 50000))
    MAX_REQUESTS_PER_MINUTE: int = int(os.getenv("MAX_REQUESTS_PER_MINUTE", 60))
    
    # Paths
    BASE_DIR: Path = Path(__file__).parent.parent
    TEMP_DIR: Path = BASE_DIR / "temp"
    VECTOR_STORE_DIR: Path = BASE_DIR / "vector_store"
    
    # Vector Store
    VECTOR_STORE: str = os.getenv("VECTOR_STORE", "faiss")
    VECTOR_STORE_PATH: str = os.getenv("VECTOR_STORE_PATH", "./vector_store")
    VECTOR_DIM: int = 384  # Dimension for all-MiniLM-L6-v2
    VECTOR_INDEX_TYPE: str = "Flat"  # FAISS index type
    
    # Cache Configuration
    ENABLE_CACHE: bool = os.getenv("ENABLE_CACHE", "true").lower() == "true"
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", 3600))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Timeouts
    LLM_TIMEOUT: int = int(os.getenv("LLM_TIMEOUT", 60))
    PARSE_TIMEOUT: int = int(os.getenv("PARSE_TIMEOUT", 30))
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure directories exist
        self.TEMP_DIR.mkdir(parents=True, exist_ok=True)
        self.VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()
