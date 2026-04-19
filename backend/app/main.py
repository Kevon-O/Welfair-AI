from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.db import models  # noqa: F401
from app.db.session import create_db_and_tables


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Create required local directories and tables on startup."""
    settings = get_settings()
    settings.storage_dir.mkdir(parents=True, exist_ok=True)
    create_db_and_tables()
    yield


def create_app() -> FastAPI:
    """Build the FastAPI application with shared config and routes."""
    settings = get_settings()
    app = FastAPI(
        title="Welfair AI Backend",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.api_prefix)

    @app.get("/health", tags=["health"])
    def healthcheck() -> dict[str, str]:
        """Simple liveness check for local development."""
        return {"status": "ok"}

    return app


app = create_app()
