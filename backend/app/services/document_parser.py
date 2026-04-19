from dataclasses import dataclass

from pypdf import PdfReader

from app.schemas.common import AnalysisStatus, DocumentKind
from app.services.storage_service import StoredUploadFile, build_image_data_url, load_file_bytes

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
TEXT_SUFFIXES = {".txt", ".md"}


@dataclass(slots=True)
class ParsedDocument:
    """Normalized document content passed into the analysis layer."""

    document_kind: DocumentKind
    extracted_text: str | None
    image_data_url: str | None
    parse_warnings: list[str]
    analysis_status_hint: AnalysisStatus


def parse_document(stored_file: StoredUploadFile) -> ParsedDocument:
    """Dispatch parsing based on the uploaded file type."""
    mime_type = stored_file.mime_type.lower()
    suffix = stored_file.storage_path.suffix.lower()

    if mime_type == "application/pdf" or suffix == ".pdf":
        return _parse_pdf_document(stored_file)

    if mime_type.startswith("image/") or suffix in IMAGE_SUFFIXES:
        return ParsedDocument(
            document_kind=DocumentKind.IMAGE,
            extracted_text=None,
            image_data_url=build_image_data_url(stored_file.storage_path, stored_file.mime_type),
            parse_warnings=[],
            analysis_status_hint=AnalysisStatus.COMPLETE,
        )

    if mime_type.startswith("text/") or suffix in TEXT_SUFFIXES:
        return _parse_text_document(stored_file)

    return ParsedDocument(
        document_kind=DocumentKind.UNSUPPORTED,
        extracted_text=None,
        image_data_url=None,
        parse_warnings=["This file type is not supported for analysis yet."],
        analysis_status_hint=AnalysisStatus.INVALID_DOCUMENT,
    )


def _parse_pdf_document(stored_file: StoredUploadFile) -> ParsedDocument:
    """Extract text from a PDF when possible."""
    warnings: list[str] = []

    try:
        reader = PdfReader(str(stored_file.storage_path))
        extracted_pages = [(page.extract_text() or "").strip() for page in reader.pages]
        extracted_text = "\n\n".join(page for page in extracted_pages if page).strip()
    except Exception:
        return ParsedDocument(
            document_kind=DocumentKind.PDF,
            extracted_text=None,
            image_data_url=None,
            parse_warnings=["The PDF could not be read cleanly."],
            analysis_status_hint=AnalysisStatus.INVALID_DOCUMENT,
        )

    if not extracted_text:
        warnings.append("No readable text could be extracted from this PDF.")
        status_hint = AnalysisStatus.UNCLEAR
    else:
        status_hint = AnalysisStatus.COMPLETE

    return ParsedDocument(
        document_kind=DocumentKind.PDF,
        extracted_text=extracted_text or None,
        image_data_url=None,
        parse_warnings=warnings,
        analysis_status_hint=status_hint,
    )


def _parse_text_document(stored_file: StoredUploadFile) -> ParsedDocument:
    """Decode plain-text uploads for direct analysis."""
    raw_bytes = load_file_bytes(stored_file.storage_path)
    extracted_text = raw_bytes.decode("utf-8", errors="ignore").strip()

    if not extracted_text:
        return ParsedDocument(
            document_kind=DocumentKind.TEXT,
            extracted_text=None,
            image_data_url=None,
            parse_warnings=["The text file was empty or unreadable."],
            analysis_status_hint=AnalysisStatus.UNCLEAR,
        )

    return ParsedDocument(
        document_kind=DocumentKind.TEXT,
        extracted_text=extracted_text,
        image_data_url=None,
        parse_warnings=[],
        analysis_status_hint=AnalysisStatus.COMPLETE,
    )
