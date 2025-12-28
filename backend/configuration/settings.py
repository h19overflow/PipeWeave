"""
Configuration settings for PipeWeave application.

This module provides centralized configuration management using Pydantic Settings.
All settings are loaded from environment variables with validation.

Layer: 7 (Configuration)
Dependencies: pydantic-settings, typing
"""

from typing import List, Optional
from functools import lru_cache

from pydantic import Field, field_validator, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    """PostgreSQL database configuration."""

    url: str = Field(
        default="postgresql://pipeweave:pipeweave_dev_password@localhost:5432/pipeweave_db",
        description="PostgreSQL connection URL"
    )
    pool_size: int = Field(default=20, ge=1, le=100)
    max_overflow: int = Field(default=10, ge=0, le=50)
    pool_timeout: int = Field(default=30, ge=1, le=300)
    echo: bool = Field(default=False, description="Log SQL queries")

    model_config = SettingsConfigDict(env_prefix="DB_")


class RedisSettings(BaseSettings):
    """Redis cache configuration."""

    url: str = Field(
        default="redis://:pipeweave_redis_password@localhost:6379/0",
        description="Redis connection URL"
    )
    max_connections: int = Field(default=50, ge=1, le=500)

    model_config = SettingsConfigDict(env_prefix="REDIS_")


class S3Settings(BaseSettings):
    """S3 storage configuration (LocalStack or AWS)."""

    access_key_id: str = Field(default="test", alias="AWS_ACCESS_KEY_ID")
    secret_access_key: str = Field(default="test", alias="AWS_SECRET_ACCESS_KEY")
    region: str = Field(default="us-east-1", alias="AWS_REGION")
    bucket: str = Field(default="pipeweave-storage")
    endpoint_url: Optional[str] = Field(
        default="http://localhost:4566",
        description="LocalStack endpoint for dev, None for production AWS"
    )

    model_config = SettingsConfigDict(env_prefix="S3_")


class StorageThresholds(BaseSettings):
    """Data storage size thresholds."""

    eda_report_size_threshold_mb: int = Field(default=1, ge=1)
    max_dataset_size_mb: int = Field(default=1024, ge=1)
    max_model_size_mb: int = Field(default=2048, ge=1)

    @property
    def eda_report_threshold_bytes(self) -> int:
        """Convert EDA report threshold from MB to bytes."""
        return self.eda_report_size_threshold_mb * 1024 * 1024


class GeminiSettings(BaseSettings):
    """Google Gemini AI configuration."""

    api_key: str = Field(
        default="your_gemini_api_key_here",
        description="Google Gemini API key"
    )
    model: str = Field(default="gemini-3-flash-preview")

    @field_validator("api_key")
    @classmethod
    def validate_api_key(cls, v: str) -> str:
        """Ensure API key is not placeholder in production."""
        if v == "your_gemini_api_key_here":
            import warnings
            warnings.warn(
                "Using placeholder Gemini API key. Set GOOGLE_API_KEY environment variable.",
                UserWarning
            )
        return v

    model_config = SettingsConfigDict(env_prefix="GEMINI_")


class SecuritySettings(BaseSettings):
    """Security and authentication configuration."""

    secret_key: str = Field(
        default="your-secret-key-here-change-in-production",
        min_length=32
    )
    jwt_secret_key: str = Field(
        default="your-jwt-secret-key-here-change-in-production",
        min_length=32
    )
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30, ge=1)
    refresh_token_expire_days: int = Field(default=7, ge=1)


class CORSSettings(BaseSettings):
    """CORS (Cross-Origin Resource Sharing) configuration."""

    origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="Comma-separated allowed origins"
    )

    @property
    def origins_list(self) -> List[str]:
        """Parse comma-separated origins into list."""
        return [origin.strip() for origin in self.origins.split(",")]

    model_config = SettingsConfigDict(env_prefix="CORS_")


class CelerySettings(BaseSettings):
    """Celery task queue configuration."""

    broker_url: str = Field(
        default="redis://:pipeweave_redis_password@localhost:6379/1"
    )
    result_backend: str = Field(
        default="redis://:pipeweave_redis_password@localhost:6379/2"
    )
    task_track_started: bool = Field(default=True)
    task_time_limit: int = Field(default=3600, ge=60)

    model_config = SettingsConfigDict(env_prefix="CELERY_")


class FileUploadSettings(BaseSettings):
    """File upload configuration."""

    chunk_size: int = Field(default=8388608, description="8MB chunks")
    presigned_url_expiry_seconds: int = Field(default=300, ge=60)

    model_config = SettingsConfigDict(env_prefix="UPLOAD_")


class Settings(BaseSettings):
    """Main application settings aggregator."""

    # Application metadata
    app_name: str = Field(default="PipeWeave")
    app_version: str = Field(default="0.1.0")
    debug: bool = Field(default=True)
    log_level: str = Field(default="INFO")

    # Sub-configurations
    database: DatabaseSettings = Field(default_factory=DatabaseSettings)
    redis: RedisSettings = Field(default_factory=RedisSettings)
    s3: S3Settings = Field(default_factory=S3Settings)
    storage: StorageThresholds = Field(default_factory=StorageThresholds)
    gemini: GeminiSettings = Field(default_factory=GeminiSettings)
    security: SecuritySettings = Field(default_factory=SecuritySettings)
    cors: CORSSettings = Field(default_factory=CORSSettings)
    celery: CelerySettings = Field(default_factory=CelerySettings)
    file_upload: FileUploadSettings = Field(default_factory=FileUploadSettings)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Returns:
        Settings: Singleton settings object loaded from environment.

    Example:
        >>> from backend.configuration.settings import get_settings
        >>> settings = get_settings()
        >>> print(settings.database.url)
    """
    return Settings()
