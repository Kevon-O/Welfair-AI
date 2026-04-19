from datetime import date, datetime
from uuid import UUID

from pydantic import Field

from app.schemas.case_analysis import CaseAnalysis
from app.schemas.common import AppBaseModel, CaseStatus, ConfidenceLevel, UrgencyLevel
from app.schemas.history import UploadHistoryItem


class CreateCaseRequest(AppBaseModel):
    """Create a new case from an analyzed upload."""

    source_upload_id: UUID
    analysis: CaseAnalysis


class AttachDocumentRequest(AppBaseModel):
    """Attach a previously analyzed upload to an existing case."""

    source_upload_id: UUID
    analysis: CaseAnalysis


class ResolveCaseRequest(AppBaseModel):
    """Mark a case resolved or reopen it if needed."""

    resolved: bool = True


class CaseRecord(AppBaseModel):
    """Primary case shape used by dashboard and case detail views."""

    id: UUID
    guest_session_id: str
    issue_type: str
    short_title: str
    summary_plain_english: str
    urgency_level: UrgencyLevel
    deadline_text: str | None
    deadline_date: date | None
    key_evidence_from_document: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
    missing_documents: list[str] = Field(default_factory=list)
    recommended_next_steps: list[str] = Field(default_factory=list)
    suggested_resources: list[str] = Field(default_factory=list)
    who_to_contact_first: str | None
    possible_consequences_if_no_action: list[str] = Field(default_factory=list)
    confidence_level: ConfidenceLevel
    status: CaseStatus
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None


class CaseDetailResponse(CaseRecord):
    """Case detail payload with linked document summaries."""

    documents: list[UploadHistoryItem] = Field(default_factory=list)
