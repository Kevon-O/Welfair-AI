from collections.abc import Generator
from functools import lru_cache

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import get_settings


def _build_engine():
    """Create the shared database engine using the configured database URL."""
    settings = get_settings()
    connect_args: dict[str, bool] = {}

    # SQLite needs this flag for FastAPI request handling across threads.
    if settings.database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

        # Ensure the parent directory exists before SQLite creates the file.
        sqlite_file_path = settings.sqlite_file_path
        if sqlite_file_path is not None:
            sqlite_file_path.parent.mkdir(parents=True, exist_ok=True)

    return create_engine(
        settings.database_url,
        connect_args=connect_args,
        echo=False,
    )


@lru_cache
def get_engine():
    """Return one cached engine instance for the lifetime of the process."""
    return _build_engine()


def get_db_session() -> Generator[Session, None, None]:
    """Yield a database session for request handlers and services."""
    with Session(get_engine()) as session:
        yield session


def create_db_and_tables() -> None:
    """Create all SQLModel tables registered in metadata."""
    SQLModel.metadata.create_all(get_engine())
