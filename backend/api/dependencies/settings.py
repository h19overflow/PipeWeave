"""
Settings dependency provider.

Provides application settings for dependency injection.

Layer: 2 (API)
Dependencies: backend.configuration
"""

from backend.configuration import Settings, get_settings


def get_app_settings() -> Settings:
    """
    Get application settings instance.

    Uses cached singleton from configuration layer.
    Injected into routes for testability.

    Returns:
        Settings: Application configuration object.

    Example:
        @router.get("/")
        def endpoint(settings: Settings = Depends(get_app_settings)):
            return {"app": settings.app_name}
    """
    return get_settings()
