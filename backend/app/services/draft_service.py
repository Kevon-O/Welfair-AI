from functools import lru_cache
from pathlib import Path

from app.core.config import get_settings
from app.db.models import Case
from app.schemas.draft import DraftResponse, GenerateDraftRequest
from app.services.analysis_service import get_openai_client

PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "draft_generation.md"


@lru_cache
def load_draft_prompt() -> str:
    """Load the draft-generation instructions once."""
    return PROMPT_PATH.read_text(encoding="utf-8")


def generate_draft(case: Case, request: GenerateDraftRequest) -> DraftResponse:
    """Generate a grounded draft from the saved case context."""
    try:
        response = get_openai_client().responses.parse(
            model=get_settings().openai_model,
            input=[
                {"role": "system", "content": load_draft_prompt()},
                {"role": "user", "content": _build_draft_context(case, request)},
            ],
            text_format=DraftResponse,
        )
        parsed_response = response.output_parsed
    except Exception:
        parsed_response = None

    if parsed_response is None:
        return DraftResponse(
            draft_type=request.draft_type,
            subject=None,
            body="We could not generate a draft right now. Please try again in a moment.",
        )

    return parsed_response


def _build_draft_context(case: Case, request: GenerateDraftRequest) -> str:
    """Format case details as grounded context for draft generation."""
    sections = [
        f"Draft type: {request.draft_type.value}",
        f"Case title: {case.short_title}",
        f"Issue type: {case.issue_type}",
        f"Summary: {case.summary_plain_english}",
        f"Urgency: {case.urgency_level}",
        f"Deadline text: {case.deadline_text or 'None detected'}",
        f"Who to contact first: {case.who_to_contact_first or 'Not specified'}",
        f"Recommended next steps: {' | '.join(case.recommended_next_steps) or 'None listed'}",
        f"Missing information: {' | '.join(case.missing_information) or 'None listed'}",
    ]

    if request.user_goal:
        sections.append(f"Extra user goal: {request.user_goal}")

    return "\n".join(sections)
