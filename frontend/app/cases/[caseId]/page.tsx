"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CaseDetailPanel } from "@/components/cases/case-detail-panel";
import { GenerateDraftPanel } from "@/components/drafts/generate-draft-panel";
import { AppShell } from "@/components/layout/app-shell";
import { AnalysisReviewSheet } from "@/components/upload/analysis-review-sheet";
import { DocumentDropzone } from "@/components/upload/document-dropzone";
import { addDocumentToCase, getCaseById, resolveCase } from "@/lib/api";
import { ensureGuestSessionId, getGuestSessionId } from "@/lib/guest-session";
import type { AnalyzeDocumentResponse, CaseDetailResponse } from "@/lib/types";

type PageState = "loading" | "ready" | "error";

export default function CaseDetailPage() {
  const params = useParams<{ caseId: string }>();
  const router = useRouter();
  const caseId = params.caseId;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<CaseDetailResponse | null>(null);
  const [reviewResult, setReviewResult] = useState<AnalyzeDocumentResponse | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [showResolvePrompt, setShowResolvePrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCase(): Promise<void> {
      try {
        const nextGuestSessionId = ensureGuestSessionId();
        if (cancelled) {
          return;
        }

        setGuestSessionId(nextGuestSessionId);

        const caseResult = await getCaseById(caseId);
        if (cancelled) {
          return;
        }

        setCaseDetail(caseResult);
        setPageState("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setGuestSessionId(getGuestSessionId());
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "We could not load this case right now.",
        );
        setPageState("error");
      }
    }

    void loadCase();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  async function handleAttachDocument(
    selectedCaseId: string,
    review: AnalyzeDocumentResponse,
  ): Promise<void> {
    try {
      setIsSavingReview(true);
      const updatedCase = await addDocumentToCase(
        selectedCaseId,
        review.upload_id,
        review.analysis,
      );
      setCaseDetail(updatedCase);
      setReviewResult(null);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not attach this document right now.",
      );
    } finally {
      setIsSavingReview(false);
    }
  }

  async function handleResolve(): Promise<void> {
    try {
      setIsResolving(true);
      await resolveCase(caseId, true);
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not resolve this case right now.",
      );
    } finally {
      setIsResolving(false);
      setShowResolvePrompt(false);
    }
  }

  return (
    <AppShell
      title={caseDetail?.short_title ?? "Case detail"}
      description="Review the full case record, keep supporting documents together, and generate communication drafts from the current case context."
      currentSection="dashboard"
      guestSessionId={guestSessionId}
      actions={
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
          >
            Back to dashboard
          </Link>
          {caseDetail ? (
            <button
              type="button"
              onClick={() => setShowResolvePrompt(true)}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Mark resolved
            </button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-6">
        {showResolvePrompt ? (
          <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
            <div className="text-lg font-semibold text-slate-950">
              Resolve this case?
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
              The case will leave the active dashboard and stay in the resolved
              archive for 21 days before it clears.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleResolve()}
                disabled={isResolving}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isResolving ? "Resolving..." : "Yes, resolve case"}
              </button>
              <button
                type="button"
                onClick={() => setShowResolvePrompt(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
              >
                Cancel
              </button>
            </div>
          </section>
        ) : null}

        {errorMessage ? (
          <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-700">
            {errorMessage}
          </section>
        ) : null}

        {pageState === "loading" ? (
          <section className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
            Loading the case record and linked documents.
          </section>
        ) : null}

        {pageState === "error" ? (
          <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-8">
            <div className="text-lg font-semibold text-rose-700">
              We could not load this case.
            </div>
            <p className="mt-2 text-sm leading-6 text-rose-600">
              {errorMessage ?? "Please try again from the dashboard."}
            </p>
          </section>
        ) : null}

        {pageState === "ready" && caseDetail ? (
          <>
            <CaseDetailPanel caseDetail={caseDetail} />

            <DocumentDropzone
              title="Add another document to this case"
              description="Upload a follow-up notice, response, or supporting file to refresh the case with the newest analysis."
              onAnalyzed={(result) => {
                setReviewResult(result);
                setErrorMessage(null);
              }}
            />

            <AnalysisReviewSheet
              review={reviewResult}
              isSaving={isSavingReview}
              mode="attach-only"
              attachCaseId={caseDetail.id}
              attachCaseLabel={caseDetail.short_title}
              onDismiss={() => setReviewResult(null)}
              onAttachToCase={handleAttachDocument}
            />

            <GenerateDraftPanel caseId={caseDetail.id} />
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
