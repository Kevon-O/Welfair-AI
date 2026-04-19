import base64
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import get_settings


@dataclass(slots=True)
class StoredUploadFile:
    """Metadata for one file saved to local backend storage."""

    original_filename: str
    mime_type: str
    stored_filename: str
    storage_path: Path
    size_bytes: int


async def save_upload_file(upload_file: UploadFile) -> StoredUploadFile:
    """Persist an uploaded file and return normalized metadata."""
    settings = get_settings()
    settings.storage_dir.mkdir(parents=True, exist_ok=True)

    original_filename = Path(upload_file.filename or "upload.bin").name
    suffix = Path(original_filename).suffix.lower()
    stored_filename = f"{uuid4().hex}{suffix}"
    storage_path = settings.storage_dir / stored_filename

    file_bytes = await upload_file.read()
    if not file_bytes:
        raise ValueError("Uploaded file is empty.")

    storage_path.write_bytes(file_bytes)

    return StoredUploadFile(
        original_filename=original_filename,
        mime_type=upload_file.content_type or "application/octet-stream",
        stored_filename=stored_filename,
        storage_path=storage_path,
        size_bytes=len(file_bytes),
    )


def load_file_bytes(storage_path: str | Path) -> bytes:
    """Read stored file bytes for downstream parsing or model input."""
    return Path(storage_path).read_bytes()


def build_image_data_url(storage_path: str | Path, mime_type: str) -> str:
    """Convert a stored image into a base64 data URL for Responses API input."""
    file_bytes = load_file_bytes(storage_path)
    encoded = base64.b64encode(file_bytes).decode("utf-8")
    return f"data:{mime_type};base64,{encoded}"
