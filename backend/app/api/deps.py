from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlmodel import Session

from app.db.session import get_db_session


def get_guest_session_id(
    x_guest_session_id: Annotated[str | None, Header(alias="x-guest-session-id")] = None,
) -> str:
    """Require a guest session header for every stateful request."""
    if x_guest_session_id is None or not x_guest_session_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing x-guest-session-id header.",
        )
    return x_guest_session_id.strip()


DatabaseSession = Annotated[Session, Depends(get_db_session)]
GuestSessionId = Annotated[str, Depends(get_guest_session_id)]
