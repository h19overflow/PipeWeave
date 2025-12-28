"""
FastAPI dependency injection providers.

Provides reusable dependencies for database sessions, settings,
and authentication (future phase).

Layer: 2 (API)
Dependencies: fastapi, backend.configuration
"""

from typing import AsyncGenerator
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from backend.boundary.crud.dataset import dataset_crud
from backend.boundary.storage import S3Storage
from backend.configuration import Settings, get_settings
from backend.services.dataset import DatasetService
from backend.services.training_service import TrainingService


# Database engine (singleton pattern)
_engine = None
_session_factory = None


def get_engine():
    """Get or create async database engine singleton."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.database.url,
            pool_size=settings.database.pool_size,
            max_overflow=settings.database.max_overflow,
            echo=settings.database.echo,
        )
    return _engine


def get_session_factory():
    """Get or create async session factory singleton."""
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Provide database session for request.

    Automatically commits on success, rolls back on exception.
    Injected into endpoints via FastAPI Depends().

    Yields:
        AsyncSession: Database session for request lifecycle

    Example:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            return await item_crud.get_multi(db)
    """
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


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


async def get_s3_storage() -> S3Storage:
    """
    Get S3 storage client instance.

    Returns:
        S3Storage: Configured S3 client with settings from configuration
    """
    settings = get_settings()
    return S3Storage(
        bucket_name=settings.s3.bucket,
        region_name=settings.s3.region,
        endpoint_url=settings.s3.endpoint_url,
    )


async def get_dataset_service(
    db: AsyncSession = Depends(get_db),
    s3_storage: S3Storage = Depends(get_s3_storage),
) -> DatasetService:
    """
    Get dataset service with injected dependencies.

    Args:
        db: Database session (injected)
        s3_storage: S3 storage client (injected)

    Returns:
        DatasetService: Configured service instance

    Example:
        @router.post("/datasets/upload-url")
        async def create_upload(
            service: DatasetService = Depends(get_dataset_service),
        ):
            return await service.create_upload_url(...)
    """
    return DatasetService(
        db=db,
        s3_storage=s3_storage,
        dataset_crud=dataset_crud,
    )


async def get_training_service(
    db: AsyncSession = Depends(get_db),
    s3_storage: S3Storage = Depends(get_s3_storage),
) -> TrainingService:
    """
    Get training service with injected dependencies.

    Args:
        db: Database session (injected)
        s3_storage: S3 storage client (injected)

    Returns:
        TrainingService: Configured service instance

    Example:
        @router.post("/training/jobs")
        async def create_job(
            service: TrainingService = Depends(get_training_service),
        ):
            return await service.create_training_job(...)
    """
    return TrainingService(db=db, s3_storage=s3_storage)


async def get_current_user_id() -> UUID:
    """
    Get current authenticated user ID.

    Placeholder for JWT authentication (Phase E).
    Returns test user ID for development.

    Returns:
        UUID: User identifier

    TODO: Phase E - Implement JWT token validation
    """
    # Temporary: Return test user ID from init_test_data.py
    return UUID("00000000-0000-0000-0000-000000000001")


# TODO: Future phase - Implement authentication dependency
# async def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: Session = Depends(get_db)
# ) -> User:
#     """
#     Authenticate request and return current user.
#
#     Validates JWT token and retrieves user from database.
#     """
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials"
#     )
#     # TODO: JWT validation logic
#     raise credentials_exception


# TODO: Future phase - Implement authorization dependency
# def require_role(required_role: str):
#     """
#     Dependency factory for role-based access control.
#
#     Example:
#         @router.post("/admin", dependencies=[Depends(require_role("admin"))])
#     """
#     def role_checker(current_user: User = Depends(get_current_user)):
#         if current_user.role != required_role:
#             raise HTTPException(status_code=403, detail="Insufficient permissions")
#         return current_user
#     return role_checker
