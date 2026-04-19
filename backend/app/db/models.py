from __future__ import annotations

from datetime import date, datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import JSON, Column, DateTime, Text
from sqlmodel import Field, Relationship, SQLModel


def utc_now() -> datetime:
    """Return an aware UTC timestamp for created/updated fields."""
    return datetime.now(timezone.utc)


class Case(SQLModel, table=True):
    """Primary dashboard record containing the structured case analysis."""

    __tablename__ = "cases"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    guest_session_id: str = Field(index=True, max_length=128)
    issue_type: str = Field(max_length=120)
    short_title: str = Field(max_length=200)
    summary_plain_english: str = Field(sa_column=Column(Text, nullable=False))
    urgency_level: str = Field(default="medium", index=True, max_length=20)
    deadline_text: str | None = Field(default=None, max_length=200)
    deadline_date: date | None = Field(default=None, index=True)
    key_evidence_from_document: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    missing_information: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    missing_documents: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    recommended_next_steps: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    suggested_resources: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    who_to_contact_first: str | None = Field(default=None, max_length=200)
    possible_consequences_if_no_action: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    confidence_level: str = Field(default="medium", max_length=20)
    status: str = Field(default="active", index=True, max_length=20)
    resolved_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )

    documents: list["DocumentUpload"] = Relationship(back_populates="case")


class DocumentUpload(SQLModel, table=True):
    """Stored upload metadata plus any extracted document content."""

    __tablename__ = "document_uploads"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    case_id: UUID | None = Field(default=None, foreign_key="cases.id", index=True)
    guest_session_id: str = Field(index=True, max_length=128)
    original_filename: str = Field(max_length=255)
    mime_type: str = Field(max_length=128)
    document_kind: str = Field(default="unknown", max_length=32)
    analysis_status: str = Field(default="complete", max_length=32)
    storage_path: str = Field(max_length=500)
    extracted_text: str | None = Field(
        default=None,
        sa_column=Column(Text, nullable=True),
    )
    parse_warnings: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    uploaded_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )

    case: Case | None = Relationship(back_populates="documents")
