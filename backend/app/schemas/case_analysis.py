from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import (
    AnalysisStatus,
    AppBaseModel,
    ConfidenceLevel,
    DocumentKind,
    UrgencyLevel,
)


class CaseAnalysis(AppBaseModel):
    """Structured AI output returned after analyzing one upload."""

    issue_type: str = Field(description="Short label for the primary issue.")
    short_title: str = Field(description="Dashboard-friendly case title.")
    summary_plain_english: str = Field(
        description="A plain-English summary in four sentences or fewer.",
    )
    urgency_level: UrgencyLevel = Field(
        description="How urgent the situation appears based on the document.",
    )
    deadline_text: str | None = Field(
        default=None,
        description="Human-readable deadline text from the document, if any.",
    )
    deadline_date: str | None = Field(
        default=None,
        description="ISO date string in YYYY-MM-DD format when detectable.",
    )
    key_evidence_from_document: list[str] = Field(
        default_factory=list,
        description="Key phrases or facts directly supported by the upload.",
    )
    missing_information: list[str] = Field(
        default_factory=list,
        description="Important facts that are still unclear or absent.",
    )
    missing_documents: list[str] = Field(
        default_factory=list,
        description="Supporting documents the user may need next.",
    )
    recommended_next_steps: list[str] = Field(
        default_factory=list,
        description="Possible next steps grounded in the document content.",
    )
    suggested_resources: list[str] = Field(
        default_factory=list,
        description="Relevant support options, offices, or resource types.",
    )
    who_to_contact_first: str | None = Field(
        default=None,
        description="Best first contact when the document suggests outreach.",
    )
    possible_consequences_if_no_action: list[str] = Field(
        default_factory=list,
        description="Likely consequences if the user does nothing.",
    )
    confidence_level: ConfidenceLevel = Field(
        description="How confident the analysis is in the extracted conclusion.",
    )
    analysis_status: AnalysisStatus = Field(
        description="Whether the upload was analyzed cleanly, unclearly, or not at all.",
    )
    error_message: str | None = Field(
        default=None,
        description="Friendly fallback message for invalid or unclear documents.",
    )


class AnalyzeDocumentResponse(AppBaseModel):
    """API response returned after upload + analysis, before case creation."""

    upload_id: UUID
    original_filename: str
    mime_type: str
    document_kind: DocumentKind
    uploaded_at: datetime
    parse_warnings: list[str] = Field(default_factory=list)
    analysis: CaseAnalysis
