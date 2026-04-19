from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class AppBaseModel(BaseModel):
    """Base schema with strict validation and ORM compatibility."""

    model_config = ConfigDict(extra="forbid", from_attributes=True)


class UrgencyLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ConfidenceLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class AnalysisStatus(StrEnum):
    COMPLETE = "complete"
    UNCLEAR = "unclear"
    INVALID_DOCUMENT = "invalid_document"


class CaseStatus(StrEnum):
    ACTIVE = "active"
    RESOLVED = "resolved"


class DraftType(StrEnum):
    EMAIL = "email"
    RESPONSE = "response"
    CALL_SCRIPT = "call_script"


class DocumentKind(StrEnum):
    PDF = "pdf"
    IMAGE = "image"
    TEXT = "text"
    UNKNOWN = "unknown"
    UNSUPPORTED = "unsupported"
