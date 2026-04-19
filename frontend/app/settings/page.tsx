"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UrgencyBadge } from "@/components/cases/urgency-badge";
import { AppShell } from "@/components/layout/app-shell";
import { getResolvedCaseHistory, getUploadHistory } from "@/lib/api";
import { ensureGuestSessionId, getGuestSessionId } from "@/lib/guest-session";
import type { ResolvedCaseHistoryItem, UploadHistoryItem } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

type PageState = "loading" | "ready" | "error";

export default function SettingsPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [resolvedCases, setResolvedCases] = useState<ResolvedCaseHistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory(): Promise<void> {
      try {
        const nextGuestSessionId = ensureGuestSessionId();
        if (cancelled) {
          return;
        }

        setGuestSessionId(nextGuestSessionId);

        const [uploads, resolved] = await Promise.all([
          getUploadHistory(),
          getResolvedCaseHistory(),
        ]);
        if (cancelled) {
          return;
        }

        setUploadHistory(uploads);
        setResolvedCases(resolved);
        setPageState("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setGuestSessionId(getGuestSessionId());
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "We could not load settings right now.",
        );
        setPageState("error");
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell
      title="Settings and history"
      description="Review upload history, keep an eye on the resolved archive, and understand what will clear automatically after the retention window."
      currentSection="settings"
      guestSessionId={guestSessionId}
      actions={
        <Link
          href="/dashboard"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
        >
          Back to dashboard
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
            <div className="text-sm text-slate-500">Uploads saved</div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">
              {uploadHistory.length}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Files already tied to this guest workspace.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
            <div className="text-sm text-slate-500">Resolved archive</div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">
              {resolvedCases.length}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cases still visible inside the archive window.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-violet-100 bg-violet-50/70 p-5">
            <div className="text-sm text-violet-700">Retention window</div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">
              21 days
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Resolved cases are cleared automatically after three weeks.
            </p>
          </div>
        </section>

        {pageState === "loading" ? (
          <section className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
            Loading upload history and resolved archive.
          </section>
        ) : null}

        {pageState === "error" ? (
          <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-8">
            <div className="text-lg font-semibold text-rose-700">
              We could not load settings right now.
            </div>
            <p className="mt-2 text-sm leading-6 text-rose-600">
              {errorMessage ?? "Try again after the backend is running."}
            </p>
          </section>
        ) : null}

        {pageState === "ready" ? (
          <>
            <section className="rounded-[1.75rem] border border-slate-100 bg-white p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
                Upload history
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Recently uploaded files
              </h2>

              {uploadHistory.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  No uploads have been saved in this workspace yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {uploadHistory.map((upload) => (
                    <article
                      key={upload.id}
                      className="rounded-[1.25rem] border border-slate-100 bg-slate-50/70 px-4 py-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-semibold text-slate-950">
                            {upload.original_filename}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {upload.mime_type} | {upload.document_kind}
                          </div>
                        </div>
                        <div className="text-sm text-slate-500">
                          {formatDateTime(upload.uploaded_at)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[1.75rem] border border-slate-100 bg-white p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
                Resolved archive
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Cases resolved in the last 21 days
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                These cases remain visible for a short archive window before
                they clear automatically.
              </p>

              {resolvedCases.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  No resolved cases are currently inside the archive window.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {resolvedCases.map((caseRecord) => (
                    <article
                      key={caseRecord.id}
                      className="rounded-[1.25rem] border border-slate-100 bg-slate-50/70 px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
                            {caseRecord.issue_type}
                          </div>
                          <div className="mt-2 text-lg font-semibold text-slate-950">
                            {caseRecord.short_title}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <UrgencyBadge level={caseRecord.urgency_level} />
                            <span className="text-sm text-slate-500">
                              Deadline: {formatDate(caseRecord.deadline_date)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-slate-500">
                          Resolved {formatDateTime(caseRecord.resolved_at)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
