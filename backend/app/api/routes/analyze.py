from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.api.deps import DatabaseSession, GuestSessionId
from app.db.models import DocumentUpload
from app.schemas.case_analysis import AnalyzeDocumentResponse
from app.services.analysis_service import analyze_document as run_document_analysis
from app.services.document_parser import parse_document
from app.services.storage_service import save_upload_file

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("", response_model=AnalyzeDocumentResponse, status_code=status.HTTP_200_OK)
async def analyze_upload(
    guest_session_id: GuestSessionId,
    session: DatabaseSession,
    file: UploadFile = File(...),
) -> AnalyzeDocumentResponse:
    """Save an upload, analyze it, and return structured triage output."""
    try:
        stored_file = await save_upload_file(file)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    parsed_document = parse_document(stored_file)
    analysis = run_document_analysis(stored_file, parsed_document)

    upload = DocumentUpload(
        guest_session_id=guest_session_id,
        original_filename=stored_file.original_filename,
        mime_type=stored_file.mime_type,
        document_kind=parsed_document.document_kind.value,
        analysis_status=analysis.analysis_status.value,
        storage_path=str(stored_file.storage_path),
        extracted_text=parsed_document.extracted_text,
        parse_warnings=parsed_document.parse_warnings,
    )
    session.add(upload)
    session.commit()
    session.refresh(upload)

    return AnalyzeDocumentResponse(
        upload_id=upload.id,
        original_filename=upload.original_filename,
        mime_type=upload.mime_type,
        document_kind=upload.document_kind,
        uploaded_at=upload.uploaded_at,
        parse_warnings=upload.parse_warnings,
        analysis=analysis,
    )
