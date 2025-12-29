"""
Database dependency providers.

Provides async database engine, session factory, and per-request sessions.

Layer: 2 (API)
Dependencies: sqlalchemy, backend.configuration
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from backend.configuration import get_settings


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
