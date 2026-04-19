import Link from "next/link";
import type { CaseRecord } from "@/lib/types";
import {
  classNames,
  formatDate,
  formatDeadline,
  getUrgencyMeta,
} from "@/lib/utils";
import { UrgencyBadge } from "@/components/cases/urgency-badge";

type CaseCardProps = {
  caseRecord: CaseRecord;
};

export function CaseCard({ caseRecord }: CaseCardProps) {
  const urgencyMeta = getUrgencyMeta(caseRecord.urgency_level);
  const firstConsequence = caseRecord.possible_consequences_if_no_action[0] ?? null;

  return (
    <article
      className={classNames(
        "rounded-[1.5rem] border p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5",
        urgencyMeta.cardClassName,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
            {caseRecord.issue_type}
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            {caseRecord.short_title}
          </h3>
        </div>

        <UrgencyBadge level={caseRecord.urgency_level} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-2xl border border-white bg-white/90 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Created
          </div>
          <div className="mt-2 text-slate-800">{formatDate(caseRecord.created_at)}</div>
        </div>

        <div className="rounded-2xl border border-white bg-white/90 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Deadline
          </div>
          <div className={classNames("mt-2 font-medium", urgencyMeta.accentClassName)}>
            {formatDeadline(caseRecord.deadline_text, caseRecord.deadline_date)}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {caseRecord.summary_plain_english}
      </p>

      {firstConsequence ? (
        <div className="mt-4 rounded-2xl border border-white bg-white/85 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            If no action is taken
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{firstConsequence}</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Next steps
          </div>
          {caseRecord.recommended_next_steps.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {caseRecord.recommended_next_steps.slice(0, 2).map((step) => (
                <li key={step} className="rounded-2xl bg-white/90 px-3 py-2">
                  {step}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              No next steps have been saved yet.
            </p>
          )}
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Suggested resources
          </div>
          {caseRecord.suggested_resources.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {caseRecord.suggested_resources.slice(0, 2).map((resource) => (
                <li key={resource} className="rounded-2xl bg-white/90 px-3 py-2">
                  {resource}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              No resource leads have been saved yet.
            </p>
          )}
        </div>
      </div>

      <Link
        href={`/cases/${caseRecord.id}`}
        className="mt-5 inline-flex items-center rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-violet-700 visited:text-white"
      >
        Open case
      </Link>
    </article>
  );
}
