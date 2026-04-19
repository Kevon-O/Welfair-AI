"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getCases } from "@/lib/api";
import { ensureGuestSessionId, getGuestSessionId } from "@/lib/guest-session";
import type { CaseRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type DashboardState = "loading" | "ready" | "error";

export default function DashboardPage() {
  const [dashboardState, setDashboardState] = useState<DashboardState>("loading");
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseRecord[]>([]);
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

        const caseResults = await getCases();
        if (cancelled) {
          return;
        }

        setCases(caseResults);
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

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeCases = cases.filter((caseRecord) => caseRecord.status === "active");
  const urgentCases = activeCases.filter((caseRecord) =>
    ["high", "critical"].includes(caseRecord.urgency_level),
  );

  return (
    <AppShell
      title="Your dashboard"
      description="Review urgent issues, keep deadlines visible, and track the next actions already grounded in the user’s case records."
      currentSection="dashboard"
      guestSessionId={guestSessionId}
      actions={
        <>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
            Guest-only MVP
          </div>
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[1.75rem] border border-violet-100 bg-[linear-gradient(135deg,_rgba(109,40,217,0.08),_rgba(255,255,255,0.96))] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">
              Triage overview
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Keep the most urgent situations visible at a glance.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Cases are reviewed through plain-language summaries, visible
              deadlines, and practical next steps so the user can act without
              losing track of what matters first.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white bg-white/90 p-5">
                <div className="text-sm font-semibold text-slate-900">
                  Plain-language summaries
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Each case should explain the situation and likely consequence
                  in short, readable language.
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white bg-white/90 p-5">
                <div className="text-sm font-semibold text-slate-900">
                  Action-first guidance
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Recommended actions and resource leads stay attached to the
                  case instead of getting lost in a document upload inbox.
                </div>
              </div>
            </div>
          </div>

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
                {cases.filter((caseRecord) => caseRecord.status === "resolved").length}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Resolved cases kept inside the archive window.
              </p>
            </div>
          </div>
        </section>

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
                Review the current active case queue with the same structure the
                backend returns for dashboard rendering.
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
                No active cases have been saved for this guest session yet.
              </p>
            </div>
          ) : null}

          {dashboardState === "ready" && activeCases.length > 0 ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {activeCases.map((caseRecord) => (
                <article
                  key={caseRecord.id}
                  className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
                        {caseRecord.issue_type}
                      </div>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                        {caseRecord.short_title}
                      </h3>
                    </div>

                    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">
                      {caseRecord.urgency_level}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Created
                      </div>
                      <div className="mt-2 text-slate-800">
                        {formatDate(caseRecord.created_at)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Deadline
                      </div>
                      <div className="mt-2 text-slate-800">
                        {caseRecord.deadline_text ?? "No deadline listed yet"}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {caseRecord.summary_plain_english}
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Possible next steps
                      </div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                        {caseRecord.recommended_next_steps.slice(0, 2).map((step) => (
                          <li key={step} className="rounded-2xl bg-white px-3 py-2">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Suggested resources
                      </div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                        {caseRecord.suggested_resources.slice(0, 2).map((resource) => (
                          <li key={resource} className="rounded-2xl bg-white px-3 py-2">
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
