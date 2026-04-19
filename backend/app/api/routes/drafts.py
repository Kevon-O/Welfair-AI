from fastapi import APIRouter, HTTPException, status

from app.api.deps import DatabaseSession, GuestSessionId
from app.schemas.draft import DraftResponse, GenerateDraftRequest
from app.services.case_service import GuestScopedNotFoundError, get_case_model
from app.services.draft_service import generate_draft

router = APIRouter(prefix="/drafts", tags=["drafts"])


@router.post("", response_model=DraftResponse)
def generate_draft_route(
    payload: GenerateDraftRequest,
    guest_session_id: GuestSessionId,
    session: DatabaseSession,
) -> DraftResponse:
    """Generate a contextual draft from one saved case."""
    try:
        case = get_case_model(session, guest_session_id, payload.case_id)
    except GuestScopedNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return generate_draft(case, payload)
