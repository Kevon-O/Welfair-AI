from uuid import UUID

from sqlmodel import Session, select

from app.core.config import get_settings
from app.db.models import Case, DocumentUpload
from app.schemas.case import (
    AttachDocumentRequest,
    CaseDetailResponse,
    CaseRecord,
    CreateCaseRequest,
)
from app.schemas.case_analysis import CaseAnalysis
from app.schemas.common import AnalysisStatus, CaseStatus
from app.schemas.history import ResolvedCaseHistoryItem, UploadHistoryItem
from app.utils.dates import parse_iso_date, resolved_retention_cutoff, utc_now
from app.utils.triage import sort_cases


class GuestScopedNotFoundError(Exception):
    """Raised when a requested guest-scoped record cannot be found."""


class CaseOperationError(Exception):
    """Raised when a case action cannot be completed safely."""


def create_case(session: Session, guest_session_id: str, request: CreateCaseRequest) -> Case:
    """Create a new case from a previously analyzed upload."""
    upload = _get_upload_for_guest(session, guest_session_id, request.source_upload_id)
    if upload.case_id is not None:
        raise CaseOperationError("This upload is already attached to a case.")

    case = Case(
        guest_session_id=guest_session_id,
        issue_type=request.analysis.issue_type,
        short_title=request.analysis.short_title,
        summary_plain_english=request.analysis.summary_plain_english,
    )
    _apply_analysis_to_case(case, request.analysis)

    session.add(case)
    session.flush()

    upload.case_id = case.id
    upload.analysis_status = request.analysis.analysis_status.value
    session.add(upload)
    session.add(case)
    session.commit()
    session.refresh(case)
    return case


def attach_upload_to_case(
    session: Session,
    guest_session_id: str,
    case_id: UUID,
    request: AttachDocumentRequest,
) -> Case:
    """Attach an analyzed upload to an existing case and refresh the case summary."""
    case = get_case_model(session, guest_session_id, case_id)
    upload = _get_upload_for_guest(session, guest_session_id, request.source_upload_id)

    if upload.case_id is not None and upload.case_id != case.id:
        raise CaseOperationError("This upload is already attached to another case.")

    upload.case_id = case.id
    upload.analysis_status = request.analysis.analysis_status.value
    session.add(upload)

    # Treat a new document attachment as reopening active work on the case.
    case.status = CaseStatus.ACTIVE.value
    case.resolved_at = None
    _apply_analysis_to_case(case, request.analysis)

    session.add(case)
    session.commit()
    session.refresh(case)
    return case


def list_active_cases(session: Session, guest_session_id: str) -> list[Case]:
    """Return active dashboard cases in urgency/deadline order."""
    purge_expired_resolved_cases(session)
    statement = select(Case).where(
        Case.guest_session_id == guest_session_id,
        Case.status == CaseStatus.ACTIVE.value,
    )
    cases = list(session.exec(statement).all())
    return sort_cases(cases)


def get_case_model(session: Session, guest_session_id: str, case_id: UUID) -> Case:
    """Load one guest-scoped case or raise a not-found error."""
    statement = select(Case).where(
        Case.id == case_id,
        Case.guest_session_id == guest_session_id,
    )
    case = session.exec(statement).first()
    if case is None:
        raise GuestScopedNotFoundError("Case not found.")
    return case


def resolve_case(session: Session, guest_session_id: str, case_id: UUID, resolved: bool) -> Case:
    """Mark a case resolved or reopen it."""
    case = get_case_model(session, guest_session_id, case_id)
    case.status = CaseStatus.RESOLVED.value if resolved else CaseStatus.ACTIVE.value
    case.resolved_at = utc_now() if resolved else None
    case.updated_at = utc_now()

    session.add(case)
    session.commit()
    session.refresh(case)
    return case


def purge_expired_resolved_cases(session: Session) -> int:
    """Clear resolved cases older than the configured retention window."""
    cutoff = resolved_retention_cutoff(get_settings().resolved_retention_days)
    statement = select(Case).where(
        Case.status == CaseStatus.RESOLVED.value,
        Case.resolved_at.is_not(None),
        Case.resolved_at < cutoff,
    )
    expired_cases = list(session.exec(statement).all())

    if not expired_cases:
        return 0

    for case in expired_cases:
        uploads = session.exec(
            select(DocumentUpload).where(DocumentUpload.case_id == case.id)
        ).all()
        for upload in uploads:
            upload.case_id = None
            session.add(upload)
        session.delete(case)

    session.commit()
    return len(expired_cases)


def list_upload_history(session: Session, guest_session_id: str) -> list[DocumentUpload]:
    """Return the guest's uploaded documents from newest to oldest."""
    statement = (
        select(DocumentUpload)
        .where(DocumentUpload.guest_session_id == guest_session_id)
        .order_by(DocumentUpload.uploaded_at.desc())
    )
    return list(session.exec(statement).all())


def list_recent_resolved_cases(session: Session, guest_session_id: str) -> list[Case]:
    """Return recently resolved cases still inside the archive window."""
    purge_expired_resolved_cases(session)
    cutoff = resolved_retention_cutoff(get_settings().resolved_retention_days)
    statement = (
        select(Case)
        .where(
            Case.guest_session_id == guest_session_id,
            Case.status == CaseStatus.RESOLVED.value,
            Case.resolved_at.is_not(None),
            Case.resolved_at >= cutoff,
        )
        .order_by(Case.resolved_at.desc())
    )
    return list(session.exec(statement).all())


def build_case_record(case: Case) -> CaseRecord:
    """Convert a database case into the standard API response shape."""
    return CaseRecord(
        id=case.id,
        guest_session_id=case.guest_session_id,
        issue_type=case.issue_type,
        short_title=case.short_title,
        summary_plain_english=case.summary_plain_english,
        urgency_level=case.urgency_level,
        deadline_text=case.deadline_text,
        deadline_date=case.deadline_date,
        key_evidence_from_document=case.key_evidence_from_document,
        missing_information=case.missing_information,
        missing_documents=case.missing_documents,
        recommended_next_steps=case.recommended_next_steps,
        suggested_resources=case.suggested_resources,
        who_to_contact_first=case.who_to_contact_first,
        possible_consequences_if_no_action=case.possible_consequences_if_no_action,
        confidence_level=case.confidence_level,
        status=case.status,
        created_at=case.created_at,
        updated_at=case.updated_at,
        resolved_at=case.resolved_at,
    )


def build_case_detail(session: Session, case: Case) -> CaseDetailResponse:
    """Build a case detail payload including linked uploads."""
    uploads = session.exec(
        select(DocumentUpload)
        .where(DocumentUpload.case_id == case.id)
        .order_by(DocumentUpload.uploaded_at.desc())
    ).all()

    return CaseDetailResponse(
        **build_case_record(case).model_dump(),
        documents=[build_upload_history_item(upload) for upload in uploads],
    )


def build_upload_history_item(upload: DocumentUpload) -> UploadHistoryItem:
    """Convert one upload row into the settings/history response shape."""
    return UploadHistoryItem(
        id=upload.id,
        case_id=upload.case_id,
        original_filename=upload.original_filename,
        mime_type=upload.mime_type,
        document_kind=upload.document_kind,
        analysis_status=upload.analysis_status,
        uploaded_at=upload.uploaded_at,
    )


def build_resolved_case_history_item(case: Case) -> ResolvedCaseHistoryItem:
    """Convert a resolved case into the settings/history response shape."""
    return ResolvedCaseHistoryItem(
        id=case.id,
        short_title=case.short_title,
        issue_type=case.issue_type,
        urgency_level=case.urgency_level,
        status=case.status,
        deadline_date=case.deadline_date,
        resolved_at=case.resolved_at,
    )


def _apply_analysis_to_case(case: Case, analysis: CaseAnalysis) -> None:
    """Copy structured AI analysis onto the persistent case model."""
    case.issue_type = analysis.issue_type
    case.short_title = analysis.short_title
    case.summary_plain_english = analysis.summary_plain_english
    case.urgency_level = analysis.urgency_level.value
    case.deadline_text = analysis.deadline_text
    case.deadline_date = parse_iso_date(analysis.deadline_date)
    case.key_evidence_from_document = analysis.key_evidence_from_document
    case.missing_information = analysis.missing_information
    case.missing_documents = analysis.missing_documents
    case.recommended_next_steps = analysis.recommended_next_steps
    case.suggested_resources = analysis.suggested_resources
    case.who_to_contact_first = analysis.who_to_contact_first
    case.possible_consequences_if_no_action = analysis.possible_consequences_if_no_action
    case.confidence_level = analysis.confidence_level.value

    # Keep unresolved/unclear analyses visible without forcing them into archive.
    if analysis.analysis_status == AnalysisStatus.INVALID_DOCUMENT:
        case.status = CaseStatus.ACTIVE.value

    case.updated_at = utc_now()


def _get_upload_for_guest(session: Session, guest_session_id: str, upload_id: UUID) -> DocumentUpload:
    """Load one guest-scoped upload or raise a not-found error."""
    statement = select(DocumentUpload).where(
        DocumentUpload.id == upload_id,
        DocumentUpload.guest_session_id == guest_session_id,
    )
    upload = session.exec(statement).first()
    if upload is None:
        raise GuestScopedNotFoundError("Upload not found.")
    return upload
