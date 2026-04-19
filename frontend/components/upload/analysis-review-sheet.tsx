"use client";

import { useEffect, useState } from "react";
import type { AnalyzeDocumentResponse, CaseRecord } from "@/lib/types";
import { classNames, formatDateTime, formatDeadline, getUrgencyMeta } from "@/lib/utils";
import { UrgencyBadge } from "@/components/cases/urgency-badge";

type AnalysisReviewSheetProps = {
  review: AnalyzeDocumentResponse | null;
  caseOptions?: CaseRecord[];
  isSaving?: boolean;
  mode?: "full" | "attach-only";
  attachCaseId?: string;
  attachCaseLabel?: string;
  onDismiss: () => void;
  onCreateCase?: (review: AnalyzeDocumentResponse) => Promise<void> | void;
  onAttachToCase: (
    caseId: string,
    review: AnalyzeDocumentResponse,
  ) => Promise<void> | void;
};

function ReviewList({
  title,
  items,
  titleClassName,
  itemClassName,
}: {
  title: string;
  items: string[];
  titleClassName?: string;
  itemClassName?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <div
        className={classNames(
          "text-xs font-semibold uppercase tracking-[0.2em]",
          titleClassName ?? "text-slate-400",
        )}
      >
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.slice(0, 4).map((item) => (
          <li
            key={item}
            className={classNames(
              "rounded-2xl px-3 py-2",
              itemClassName ?? "bg-slate-50",
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalysisReviewSheet({
  review,
  caseOptions = [],
  isSaving = false,
  mode = "full",
  attachCaseId,
  attachCaseLabel,
  onDismiss,
  onCreateCase,
  onAttachToCase,
}: AnalysisReviewSheetProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const analysisStatus = review?.analysis.analysis_status ?? null;
  const supportsCaseActions = analysisStatus !== "invalid_document";

  useEffect(() => {
    if (mode === "attach-only" && attachCaseId) {
      setSelectedCaseId(attachCaseId);
      return;
    }

    if (caseOptions.length > 0) {
      setSelectedCaseId(caseOptions[0].id);
      return;
    }

    setSelectedCaseId("");
  }, [attachCaseId, caseOptions, mode]);

  if (!review) {
    return null;
  }

  const attachTargetLabel =
    mode === "attach-only"
      ? attachCaseLabel ?? "this case"
      : caseOptions.find((caseOption) => caseOption.id === selectedCaseId)?.short_title ??
        "selected case";
  const urgencyMeta = getUrgencyMeta(review.analysis.urgency_level);

  return (
    <section
      className={classNames(
        "rounded-[1.75rem] border p-6 shadow-[0_24px_70px_-44px_rgba(91,33,182,0.26)]",
        urgencyMeta.cardClassName,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div
            className={classNames(
              "text-xs font-semibold uppercase tracking-[0.22em]",
              urgencyMeta.eyebrowClassName,
            )}
          >
            Analysis review
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Review the extracted case details before saving
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Confirm the issue summary, urgency, and next steps before creating a
            new case or attaching this document to an existing one.
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
        >
          Clear review
        </button>
      </div>

      {analysisStatus === "invalid_document" ? (
        <div className="mt-5 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
          {review.analysis.error_message ??
            "Issue with Document. Upload a clearer file to continue."}
        </div>
      ) : null}

      {analysisStatus === "unclear" ? (
        <div className="mt-5 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-700">
          {review.analysis.error_message ??
            "Some of this document is uncertain. Review the output carefully before saving it."}
        </div>
      ) : null}

      {review.parse_warnings.length > 0 ? (
        <div className="mt-5 rounded-[1.25rem] border border-violet-100 bg-violet-50/70 px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            Parse warnings
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            {review.parse_warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <div
          className={classNames(
            "rounded-[1.5rem] border p-5",
            urgencyMeta.panelClassName,
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div
                className={classNames(
                  "text-xs font-semibold uppercase tracking-[0.2em]",
                  urgencyMeta.eyebrowClassName,
                )}
              >
                {review.analysis.issue_type}
              </div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                {review.analysis.short_title}
              </h3>
            </div>
            <UrgencyBadge level={review.analysis.urgency_level} />
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {review.analysis.summary_plain_english}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Uploaded
              </div>
              <div className="mt-2 text-sm text-slate-700">
                {formatDateTime(review.uploaded_at)}
              </div>
            </div>
            <div className="rounded-2xl border border-white bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Deadline
              </div>
              <div
                className={classNames(
                  "mt-2 text-sm font-semibold",
                  urgencyMeta.accentClassName,
                )}
              >
                {formatDeadline(
                  review.analysis.deadline_text,
                  review.analysis.deadline_date,
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <ReviewList
              title="Possible next steps"
              items={review.analysis.recommended_next_steps}
              titleClassName={urgencyMeta.accentClassName}
              itemClassName={urgencyMeta.listItemClassName}
            />
            <ReviewList
              title="Suggested resources"
              items={review.analysis.suggested_resources}
              titleClassName={urgencyMeta.accentClassName}
              itemClassName={urgencyMeta.listItemClassName}
            />
            <ReviewList
              title="Missing information"
              items={review.analysis.missing_information}
              titleClassName={urgencyMeta.accentClassName}
              itemClassName={urgencyMeta.listItemClassName}
            />
            <ReviewList
              title="Missing documents"
              items={review.analysis.missing_documents}
              titleClassName={urgencyMeta.accentClassName}
              itemClassName={urgencyMeta.listItemClassName}
            />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Save this analysis
          </div>

          {mode === "full" ? (
            <div className="mt-4 space-y-4">
              <button
                type="button"
                onClick={() => {
                  if (review && onCreateCase && supportsCaseActions) {
                    void onCreateCase(review);
                  }
                }}
                disabled={!supportsCaseActions || isSaving || !onCreateCase}
                className="w-full rounded-[1.25rem] bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSaving ? "Saving..." : "Create new case"}
              </button>

              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Add to an existing case
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use this when the upload belongs to a case that is already in
                  the dashboard.
                </p>

                <select
                  value={selectedCaseId}
                  onChange={(event) => setSelectedCaseId(event.target.value)}
                  disabled={caseOptions.length === 0 || isSaving}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-300"
                >
                  {caseOptions.length === 0 ? (
                    <option value="">No active cases available</option>
                  ) : null}
                  {caseOptions.map((caseOption) => (
                    <option key={caseOption.id} value={caseOption.id}>
                      {caseOption.short_title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedCaseId && supportsCaseActions) {
                      void onAttachToCase(selectedCaseId, review);
                    }
                  }}
                  disabled={!supportsCaseActions || isSaving || !selectedCaseId}
                  className="mt-4 w-full rounded-[1.25rem] border border-violet-200 bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:border-violet-100 disabled:bg-violet-300"
                >
                  {isSaving ? "Saving..." : "Attach to selected case"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm leading-6 text-slate-600">
                Save this document into <span className="font-semibold text-slate-900">{attachTargetLabel}</span> and
                refresh the case summary with the new analysis.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (selectedCaseId && supportsCaseActions) {
                    void onAttachToCase(selectedCaseId, review);
                  }
                }}
                disabled={!supportsCaseActions || isSaving || !selectedCaseId}
                className="mt-4 w-full rounded-[1.25rem] bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
              >
                {isSaving ? "Saving..." : "Attach document to this case"}
              </button>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            Confidence: <span className="font-semibold capitalize text-slate-800">{review.analysis.confidence_level}</span>
            <br />
            Contact first:{" "}
            <span className="font-semibold text-slate-800">
              {review.analysis.who_to_contact_first ?? "No clear contact listed yet"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
