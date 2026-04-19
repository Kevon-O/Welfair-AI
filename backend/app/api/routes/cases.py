from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DatabaseSession, GuestSessionId
from app.schemas.case import (
    AttachDocumentRequest,
    CaseDetailResponse,
    CaseRecord,
    CreateCaseRequest,
    ResolveCaseRequest,
)
from app.services.case_service import (
    CaseOperationError,
    GuestScopedNotFoundError,
    attach_upload_to_case,
    build_case_detail,
    build_case_record,
    create_case,
    get_case_model,
    list_active_cases,
    resolve_case,
)

router = APIRouter(prefix="/cases", tags=["cases"])


@router.post("", response_model=CaseRecord, status_code=status.HTTP_201_CREATED)
def create_case_route(
    payload: CreateCaseRequest,
    guest_session_id: GuestSessionId,
    session: DatabaseSession,
) -> CaseRecord:
    """Create a new case from an analyzed upload."""
    try:
        case = create_case(session, guest_session_id, payload)
    except GuestScopedNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except CaseOperationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return build_case_record(case)


@router.get("", response_model=list[CaseRecord])
def list_cases_route(
    guest_session_id: GuestSessionId,
    session: DatabaseSession,
) -> list[CaseRecord]:
    """Return active cases sorted for dashboard display."""
    cases = list_active_cases(session, guest_session_id)
    return [build_case_record(case) for case in cases]


@router.get("/{case_id}", response_model=CaseDetailResponse)
def get_case_route(
    case_id: UUID,
    guest_session_id: GuestSessionId,
    session: DatabaseSession,
) -> CaseDetailResponse:
    """Return one guest-scoped case with linked uploads."""
    try:
        case = get_case_model(session, guest_session_id, case_id)
    except GuestScopedNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return build_case_detail(session, case)


@router.post("/{case_id}/documents", response_model=CaseDetailResponse)
def attach_document_route(
    case_id: UUID,
    payload: AttachDocumentRequest,
    guest_session_id: GuestSessionId,
    session: DatabaseSession,
) -> CaseDetailResponse:
    """Attach an analyzed upload to an existing case and refresh its analysis."""
    try:
        case = attach_upload_to_case(session, guest_session_id, case_id, payload)
    except GuestScopedNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except CaseOperationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return build_case_detail(session, case)


@router.patch("/{case_id}/resolve", response_model=CaseRecord)
def resolve_case_route(
    case_id: UUID,
    payload: ResolveCaseRequest,
    guest_session_id: GuestSessionId,
    session: DatabaseSession,
) -> CaseRecord:
    """Resolve or reopen a guest-scoped case."""
    try:
        case = resolve_case(session, guest_session_id, case_id, resolved=payload.resolved)
    except GuestScopedNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return build_case_record(case)
