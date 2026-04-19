import { ensureGuestSessionId, guestSessionHeader } from "@/lib/guest-session";
import type {
  AnalyzeDocumentResponse,
  CaseDetailResponse,
  CaseAnalysis,
  CaseRecord,
  DraftResponse,
  DraftType,
  ResolvedCaseHistoryItem,
  UploadHistoryItem,
} from "@/lib/types";

// The backend runs locally on port 8000, so the frontend can call it directly
// during development unless a different origin is provided.
export const API_ROUTES = {
  analyze: "/api/analyze",
  cases: "/api/cases",
  caseById: (caseId: string) => `/api/cases/${caseId}`,
  caseDocuments: (caseId: string) => `/api/cases/${caseId}/documents`,
  resolveCase: (caseId: string) => `/api/cases/${caseId}/resolve`,
  historyUploads: "/api/history/uploads",
  historyResolvedCases: "/api/history/resolved-cases",
  drafts: "/api/drafts",
} as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

type ApiErrorPayload = {
  detail?: string;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const errorPayload = (await response.json()) as ApiErrorPayload;
      if (typeof errorPayload.detail === "string" && errorPayload.detail.trim()) {
        message = errorPayload.detail;
      }
    } catch {
      // If the backend does not return JSON, fall back to the status-based message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  Object.entries(guestSessionHeader()).forEach(([name, value]) => {
    headers.set(name, value);
  });

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });

  return parseJsonResponse<T>(response);
}

export async function analyzeDocument(
  file: File,
): Promise<AnalyzeDocumentResponse> {
  const guestSessionId = ensureGuestSessionId();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(buildUrl(API_ROUTES.analyze), {
    method: "POST",
    body: formData,
    headers: guestSessionHeader(guestSessionId),
  });

  return parseJsonResponse<AnalyzeDocumentResponse>(response);
}

export async function createCaseFromAnalysis(
  sourceUploadId: string,
  analysis: CaseAnalysis,
): Promise<CaseRecord> {
  return requestJson<CaseRecord>(API_ROUTES.cases, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_upload_id: sourceUploadId,
      analysis,
    }),
  });
}

export async function getCases(): Promise<CaseRecord[]> {
  return requestJson<CaseRecord[]>(API_ROUTES.cases);
}

export async function getCaseById(
  caseId: string,
): Promise<CaseDetailResponse> {
  return requestJson<CaseDetailResponse>(API_ROUTES.caseById(caseId));
}

export async function addDocumentToCase(
  caseId: string,
  sourceUploadId: string,
  analysis: CaseAnalysis,
): Promise<CaseDetailResponse> {
  return requestJson<CaseDetailResponse>(API_ROUTES.caseDocuments(caseId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_upload_id: sourceUploadId,
      analysis,
    }),
  });
}

export async function resolveCase(
  caseId: string,
  resolved = true,
): Promise<CaseRecord> {
  return requestJson<CaseRecord>(API_ROUTES.resolveCase(caseId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resolved }),
  });
}

export async function getUploadHistory(): Promise<UploadHistoryItem[]> {
  return requestJson<UploadHistoryItem[]>(API_ROUTES.historyUploads);
}

export async function getResolvedCaseHistory(): Promise<ResolvedCaseHistoryItem[]> {
  return requestJson<ResolvedCaseHistoryItem[]>(API_ROUTES.historyResolvedCases);
}

export async function generateDraft(
  caseId: string,
  draftType: DraftType,
  userGoal?: string,
): Promise<DraftResponse> {
  return requestJson<DraftResponse>(API_ROUTES.drafts, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      case_id: caseId,
      draft_type: draftType,
      ...(userGoal ? { user_goal: userGoal } : {}),
    }),
  });
}
