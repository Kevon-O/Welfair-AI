from fastapi import APIRouter

from app.api.deps import DatabaseSession, GuestSessionId
from app.schemas.history import ResolvedCaseHistoryItem, UploadHistoryItem
from app.services.case_service import (
    build_resolved_case_history_item,
    build_upload_history_item,
    list_recent_resolved_cases,
    list_upload_history,
)

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/uploads", response_model=list[UploadHistoryItem])
def list_upload_history_route(
    guest_session_id: GuestSessionId,
    session: DatabaseSession,
) -> list[UploadHistoryItem]:
    """Return upload history for the settings page."""
    uploads = list_upload_history(session, guest_session_id)
    return [build_upload_history_item(upload) for upload in uploads]


@router.get("/resolved-cases", response_model=list[ResolvedCaseHistoryItem])
def list_resolved_case_history_route(
    guest_session_id: GuestSessionId,
    session: DatabaseSession,
) -> list[ResolvedCaseHistoryItem]:
    """Return recently resolved cases still inside the archive window."""
    cases = list_recent_resolved_cases(session, guest_session_id)
    return [build_resolved_case_history_item(case) for case in cases]
