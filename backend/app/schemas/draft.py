from uuid import UUID

from pydantic import Field

from app.schemas.common import AppBaseModel, DraftType


class GenerateDraftRequest(AppBaseModel):
    """Generate a draft grounded in one saved case."""

    case_id: UUID
    draft_type: DraftType
    user_goal: str | None = Field(
        default=None,
        description="Optional extra instruction for tone or emphasis.",
    )


class DraftResponse(AppBaseModel):
    """Structured draft output for emails, responses, and call scripts."""

    draft_type: DraftType
    subject: str | None = None
    body: str
