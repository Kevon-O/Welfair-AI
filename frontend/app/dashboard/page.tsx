"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CaseCard } from "@/components/cases/case-card";
import { AppShell } from "@/components/layout/app-shell";
import { AnalysisReviewSheet } from "@/components/upload/analysis-review-sheet";
import { DocumentDropzone } from "@/components/upload/document-dropzone";
import {
  addDocumentToCase,
  createCaseFromAnalysis,
  getCases,
  getResolvedCaseHistory,
} from "@/lib/api";
import { ensureGuestSessionId, getGuestSessionId } from "@/lib/guest-session";
import type {
  AnalyzeDocumentResponse,
  CaseRecord,
  ResolvedCaseHistoryItem,
} from "@/lib/types";
import { sortCasesByPriority } from "@/lib/utils";

type DashboardState = "loading" | "ready" | "error";

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardState, setDashboardState] = useState<DashboardState>("loading");
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [resolvedCases, setResolvedCases] = useState<ResolvedCaseHistoryItem[]>([]);
  const [reviewResult, setReviewResult] = useState<AnalyzeDocumentResponse | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard(): Promise<void> {
      try {
        const nextGuestSessionId = ensureGuestSessionId();
        if (cancelled) {
          return;
        }

        setGuestSessionId(nextGuestSessionId);

        const [caseResults, resolvedHistory] = await Promise.all([
          getCases(),
          getResolvedCaseHistory(),
        ]);
        if (cancelled) {
          return;
        }

        setCases(sortCasesByPriority(caseResults));
        setResolvedCases(resolvedHistory);
        setDashboardState("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setGuestSessionId(getGuestSessionId());
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "We could not load the dashboard right now.",
        );
        setDashboardState("error");
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeCases = sortCasesByPriority(
    cases.filter((caseRecord) => caseRecord.status === "active"),
  );
  const urgentCases = activeCases.filter((caseRecord) =>
    ["high", "critical"].includes(caseRecord.urgency_level),
  );

  async function handleCreateCase(review: AnalyzeDocumentResponse): Promise<void> {
    try {
      setIsSavingReview(true);
      const createdCase = await createCaseFromAnalysis(
        review.upload_id,
        review.analysis,
      );
      setReviewResult(null);
      router.push(`/cases/${createdCase.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not save this case right now.",
      );
    } finally {
      setIsSavingReview(false);
    }
  }

  async function handleAttachToCase(
    caseId: string,
    review: AnalyzeDocumentResponse,
  ): Promise<void> {
    try {
      setIsSavingReview(true);
      const updatedCase = await addDocumentToCase(
        caseId,
        review.upload_id,
        review.analysis,
      );
      setReviewResult(null);
      router.push(`/cases/${updatedCase.id}`);
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

  return (
    <AppShell
      title="Your dashboard"
      description="Keep the most urgent situations visible, move quickly from uploaded documents into structured cases, and stay close to the next action that matters."
      currentSection="dashboard"
      guestSessionId={guestSessionId}
      actions={
        <Link
          href="/settings"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
        >
          View history
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <DocumentDropzone
            title="Start with a notice, letter, bill, or form"
            description="Upload one document to analyze it, review the extracted case details, and decide whether it belongs in a new case or an existing one."
            onAnalyzed={(result) => {
              setReviewResult(result);
              setErrorMessage(null);
            }}
          />

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
              <div className="text-sm text-slate-500">Active cases</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950">
                {activeCases.length}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Open cases currently visible in the workspace.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
              <div className="text-sm text-slate-500">Urgent attention</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950">
                {urgentCases.length}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                High and critical issues that may need the fastest response.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
              <div className="text-sm text-slate-500">Resolved archive</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950">
                {resolvedCases.length}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Cases retained for the 21-day resolved archive window.
              </p>
            </div>
          </div>
        </section>

        <AnalysisReviewSheet
          review={reviewResult}
          caseOptions={activeCases}
          isSaving={isSavingReview}
          onDismiss={() => setReviewResult(null)}
          onCreateCase={handleCreateCase}
          onAttachToCase={handleAttachToCase}
        />

        <section className="rounded-[1.75rem] border border-slate-100 bg-white p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">
                Case queue
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Current case overview
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review active cases in the order they need attention: urgency
                first, then closest deadlines, then the most recent work.
              </p>
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
              {dashboardState === "loading"
                ? "Loading workspace..."
                : dashboardState === "error"
                  ? "Unable to load cases"
                  : `${activeCases.length} active case${activeCases.length === 1 ? "" : "s"}`}
            </div>
          </div>

          {dashboardState === "loading" ? (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
              Loading the guest workspace and current case queue.
            </div>
          ) : null}

          {dashboardState === "error" ? (
            <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-8">
              <div className="text-sm font-semibold text-rose-700">
                We could not load case data right now.
              </div>
              <div className="mt-2 text-sm leading-6 text-rose-600">
                {errorMessage ??
                  "Check that the FastAPI backend is running at http://127.0.0.1:8000 and that it allows the frontend origin."}
              </div>
            </div>
          ) : null}

          {dashboardState === "ready" && activeCases.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-violet-200 bg-violet-50/60 p-8">
              <div className="text-lg font-semibold text-slate-950">
                No cases yet
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Start by uploading a document above. Once it is analyzed, you
                can save it as a new case or attach it to an existing one.
              </p>
            </div>
          ) : null}

          {dashboardState === "ready" && activeCases.length > 0 ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {activeCases.map((caseRecord) => (
                <CaseCard key={caseRecord.id} caseRecord={caseRecord} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
