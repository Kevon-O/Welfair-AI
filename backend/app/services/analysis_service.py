from functools import lru_cache
from pathlib import Path

from openai import OpenAI

from app.core.config import get_settings
from app.schemas.case_analysis import CaseAnalysis
from app.schemas.common import AnalysisStatus, ConfidenceLevel, DocumentKind, UrgencyLevel
from app.services.document_parser import ParsedDocument
from app.services.storage_service import StoredUploadFile

PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "case_analysis.md"
MAX_EXTRACTED_TEXT_CHARS = 24_000


@lru_cache
def get_openai_client() -> OpenAI:
    """Create one shared OpenAI client for the process."""
    settings = get_settings()
    return OpenAI(api_key=settings.openai_api_key.get_secret_value())


@lru_cache
def load_case_analysis_prompt() -> str:
    """Load the analysis instructions from the prompt file once."""
    return PROMPT_PATH.read_text(encoding="utf-8")


def analyze_document(stored_file: StoredUploadFile, parsed_document: ParsedDocument) -> CaseAnalysis:
    """Run structured analysis or return a grounded fallback state."""
    if parsed_document.analysis_status_hint == AnalysisStatus.INVALID_DOCUMENT:
        return _build_fallback_analysis(
            status=AnalysisStatus.INVALID_DOCUMENT,
            message="Issue with Document. We could not read this file clearly enough to analyze it.",
        )

    if parsed_document.document_kind in {DocumentKind.PDF, DocumentKind.TEXT} and not parsed_document.extracted_text:
        return _build_fallback_analysis(
            status=AnalysisStatus.UNCLEAR,
            message="Issue with Document. We need a clearer upload or more context to analyze this file.",
        )

    user_content: list[dict[str, str]] = [
        {
            "type": "input_text",
            "text": _build_analysis_context(stored_file, parsed_document),
        }
    ]

    if parsed_document.image_data_url:
        user_content.append(
            {
                "type": "input_image",
                "image_url": parsed_document.image_data_url,
            }
        )

    try:
        response = get_openai_client().responses.parse(
            model=get_settings().openai_model,
            input=[
                {"role": "system", "content": load_case_analysis_prompt()},
                {"role": "user", "content": user_content},
            ],
            text_format=CaseAnalysis,
        )
        parsed_response = response.output_parsed
    except Exception:
        return _build_fallback_analysis(
            status=AnalysisStatus.UNCLEAR,
            message="We could not complete the analysis right now. Please try again in a moment.",
        )

    if parsed_response is None:
        return _build_fallback_analysis(
            status=AnalysisStatus.UNCLEAR,
            message="We could not complete the analysis right now. Please try again with a clearer file or more context.",
        )

    return parsed_response


def _build_analysis_context(stored_file: StoredUploadFile, parsed_document: ParsedDocument) -> str:
    """Assemble the grounded context we pass into the model."""
    extracted_text = (parsed_document.extracted_text or "").strip()
    truncated_text = extracted_text[:MAX_EXTRACTED_TEXT_CHARS]

    sections = [
        "Analyze this uploaded document for crisis-navigation triage.",
        f"Original filename: {stored_file.original_filename}",
        f"MIME type: {stored_file.mime_type}",
        f"Detected document kind: {parsed_document.document_kind.value}",
    ]

    if parsed_document.parse_warnings:
        sections.append(f"Parse warnings: {' | '.join(parsed_document.parse_warnings)}")

    if truncated_text:
        sections.append("Extracted text from the document:")
        sections.append(truncated_text)
    else:
        sections.append(
            "No extracted text is available. Use the visible image content if an image was supplied."
        )

    return "\n\n".join(sections)


def _build_fallback_analysis(status: AnalysisStatus, message: str) -> CaseAnalysis:
    """Return a safe, user-facing fallback analysis when parsing fails."""
    return CaseAnalysis(
        issue_type="Issue with Document",
        short_title="Issue with Document",
        summary_plain_english=(
            "We could not clearly analyze this upload. A clearer file or a little more context "
            "should help us identify the situation and suggest next steps."
        ),
        urgency_level=UrgencyLevel.MEDIUM,
        deadline_text=None,
        deadline_date=None,
        key_evidence_from_document=[],
        missing_information=["A clearer upload or more context is needed."],
        missing_documents=[],
        recommended_next_steps=[
            "Upload a clearer document or image.",
            "If possible, include any missing pages or a close-up of the deadline section.",
        ],
        suggested_resources=[],
        who_to_contact_first=None,
        possible_consequences_if_no_action=[],
        confidence_level=ConfidenceLevel.LOW,
        analysis_status=status,
        error_message=message,
    )
