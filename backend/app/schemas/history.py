from datetime import date, datetime
from uuid import UUID

from app.schemas.common import AnalysisStatus, AppBaseModel, CaseStatus, DocumentKind, UrgencyLevel


class UploadHistoryItem(AppBaseModel):
    """Minimal upload record for the settings/history page."""

    id: UUID
    case_id: UUID | None
    original_filename: str
    mime_type: str
    document_kind: DocumentKind
    analysis_status: AnalysisStatus
    uploaded_at: datetime


class ResolvedCaseHistoryItem(AppBaseModel):
    """Recently resolved case information shown in settings/history."""

    id: UUID
    short_title: str
    issue_type: str
    urgency_level: UrgencyLevel
    status: CaseStatus
    deadline_date: date | None
    resolved_at: datetime | None
