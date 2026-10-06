import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "DeltaFox Trading Dashboard"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./deltafox.db")

    # Security
    SESSION_SECRET: str = os.getenv("SESSION_SECRET", "super-secret-key-change-this-in-production-min-32-chars")
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "4320"))  # 3 days

    # Historical Data Provider
    HISTORICAL_DATA_PROVIDER: str = os.getenv("HISTORICAL_DATA_PROVIDER", "yfinance")
    HISTORICAL_DATA_API_KEY: str = os.getenv("HISTORICAL_DATA_API_KEY", "")

    # Dhan API
    DHAN_CLIENT_ID: str = os.getenv("DHAN_CLIENT_ID", "")
    DHAN_ACCESS_TOKEN: str = os.getenv("DHAN_ACCESS_TOKEN", "")

    # Default Admin
    DEFAULT_ADMIN_USER_ID: str = os.getenv("DEFAULT_ADMIN_USER_ID", "admin")
    DEFAULT_ADMIN_PASSWORD: str = os.getenv("DEFAULT_ADMIN_PASSWORD", "adminpassword123")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
