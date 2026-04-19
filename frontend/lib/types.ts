// These types mirror the current FastAPI/Pydantic schemas so frontend work can
// stay grounded in the real backend contract.

export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type ConfidenceLevel = "low" | "medium" | "high";
export type AnalysisStatus = "complete" | "unclear" | "invalid_document";
export type CaseStatus = "active" | "resolved";
export type DraftType = "email" | "response" | "call_script";
export type DocumentKind = "pdf" | "image" | "text" | "unknown" | "unsupported";

export type CaseAnalysis = {
  issue_type: string;
  short_title: string;
  summary_plain_english: string;
  urgency_level: UrgencyLevel;
  deadline_text: string | null;
  deadline_date: string | null;
  key_evidence_from_document: string[];
  missing_information: string[];
  missing_documents: string[];
  recommended_next_steps: string[];
  suggested_resources: string[];
  who_to_contact_first: string | null;
  possible_consequences_if_no_action: string[];
  confidence_level: ConfidenceLevel;
  analysis_status: AnalysisStatus;
  error_message: string | null;
};

export type AnalyzeDocumentResponse = {
  upload_id: string;
  original_filename: string;
  mime_type: string;
  document_kind: DocumentKind;
  uploaded_at: string;
  parse_warnings: string[];
  analysis: CaseAnalysis;
};

export type CaseRecord = {
  id: string;
  guest_session_id: string;
  issue_type: string;
  short_title: string;
  summary_plain_english: string;
  urgency_level: UrgencyLevel;
  deadline_text: string | null;
  deadline_date: string | null;
  key_evidence_from_document: string[];
  missing_information: string[];
  missing_documents: string[];
  recommended_next_steps: string[];
  suggested_resources: string[];
  who_to_contact_first: string | null;
  possible_consequences_if_no_action: string[];
  confidence_level: ConfidenceLevel;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type UploadHistoryItem = {
  id: string;
  case_id: string | null;
  original_filename: string;
  mime_type: string;
  document_kind: DocumentKind;
  analysis_status: AnalysisStatus;
  uploaded_at: string;
};

export type ResolvedCaseHistoryItem = {
  id: string;
  short_title: string;
  issue_type: string;
  urgency_level: UrgencyLevel;
  status: CaseStatus;
  deadline_date: string | null;
  resolved_at: string | null;
};

export type CaseDetailResponse = CaseRecord & {
  documents: UploadHistoryItem[];
};

export type DraftResponse = {
  draft_type: DraftType;
  subject: string | null;
  body: string;
};
