from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve paths from the backend folder so relative env values stay predictable.
BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_STORAGE_DIR = BACKEND_DIR / "storage" / "uploads"


class Settings(BaseSettings):
    """Typed application settings loaded from environment variables."""

    openai_api_key: SecretStr = Field(
        ...,
        description="API key used for OpenAI document analysis and draft generation.",
    )
    openai_model: str = Field(
        default="gpt-5.4-mini",
        description="Default OpenAI model for backend requests.",
    )
    database_url: str = Field(
        default="sqlite:///./welfair_ai.db",
        description="Database connection string for local persistence.",
    )
    storage_dir: Path = Field(
        default=DEFAULT_STORAGE_DIR,
        description="Directory where uploaded files are stored.",
    )
    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Comma-separated list of frontend origins allowed to call the API.",
    )
    api_prefix: str = Field(
        default="/api",
        description="Shared URL prefix for backend routes.",
    )
    resolved_retention_days: int = Field(
        default=21,
        ge=1,
        description="How many days resolved cases stay archived before clearing.",
    )

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("api_prefix")
    @classmethod
    def normalize_api_prefix(cls, value: str) -> str:
        """Keep route prefixes consistent even if env values vary slightly."""
        cleaned = value.strip()
        if not cleaned:
            return "/"
        if not cleaned.startswith("/"):
            cleaned = f"/{cleaned}"
        return cleaned.rstrip("/") or "/"

    @field_validator("storage_dir", mode="before")
    @classmethod
    def normalize_storage_dir(cls, value: str | Path) -> Path:
        """Convert relative storage paths into a stable backend-local location."""
        path = Path(value)
        if path.is_absolute():
            return path
        return (BACKEND_DIR / path).resolve()

    @property
    def cors_origin_list(self) -> list[str]:
        """Return CORS origins in the list format FastAPI expects."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def sqlite_file_path(self) -> Path | None:
        """Expose the sqlite file path when the database uses a local file."""
        sqlite_prefix = "sqlite:///./"
        if not self.database_url.startswith(sqlite_prefix):
            return None
        relative_path = self.database_url.removeprefix(sqlite_prefix)
        return (BACKEND_DIR / relative_path).resolve()


@lru_cache
def get_settings() -> Settings:
    """Cache settings so we only parse the environment once per process."""
    return Settings()
