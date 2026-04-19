import type { CaseDetailResponse } from "@/lib/types";
import {
  classNames,
  formatDate,
  formatDateTime,
  formatDeadline,
  getUrgencyMeta,
} from "@/lib/utils";
import { UrgencyBadge } from "@/components/cases/urgency-badge";

type CaseDetailPanelProps = {
  caseDetail: CaseDetailResponse;
};

function DetailList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </div>

      {items.length > 0 ? (
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          {items.map((item) => (
            <li key={item} className="rounded-2xl bg-slate-50 px-3 py-3">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">{emptyLabel}</p>
      )}
    </section>
  );
}

export function CaseDetailPanel({ caseDetail }: CaseDetailPanelProps) {
  const urgencyMeta = getUrgencyMeta(caseDetail.urgency_level);

  return (
    <div className="space-y-6">
      <section
        className={classNames(
          "grid gap-6 rounded-[1.75rem] border p-6 lg:grid-cols-[1.45fr_0.95fr]",
          urgencyMeta.cardClassName,
        )}
      >
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
            {caseDetail.issue_type}
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {caseDetail.short_title}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-700">
            {caseDetail.summary_plain_english}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white bg-white/90 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Deadline
              </div>
              <div className={classNames("mt-2 font-semibold", urgencyMeta.accentClassName)}>
                {formatDeadline(caseDetail.deadline_text, caseDetail.deadline_date)}
              </div>
            </div>

            <div className="rounded-2xl border border-white bg-white/90 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Who to contact first
              </div>
              <div className="mt-2 text-sm font-medium text-slate-800">
                {caseDetail.who_to_contact_first ?? "No contact lead has been identified yet."}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-white bg-white/92 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Urgency
                </div>
                <div className="mt-2">
                  <UrgencyBadge level={caseDetail.urgency_level} />
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Confidence
                </div>
                <div className="mt-2 text-sm font-semibold capitalize text-slate-800">
                  {caseDetail.confidence_level}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Created
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {formatDate(caseDetail.created_at)}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Updated
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {formatDateTime(caseDetail.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {caseDetail.documents.length > 0 ? (
            <div className="rounded-[1.5rem] border border-white bg-white/92 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Linked documents
              </div>
              <ul className="mt-4 space-y-3">
                {caseDetail.documents.map((document) => (
                  <li
                    key={document.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-700"
                  >
                    <div className="font-medium text-slate-900">
                      {document.original_filename}
                    </div>
                    <div className="mt-1 text-slate-500">
                      {formatDateTime(document.uploaded_at)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <DetailList
          title="Key evidence from document"
          items={caseDetail.key_evidence_from_document}
          emptyLabel="No evidence snippets were saved with this case."
        />
        <DetailList
          title="Possible consequences if no action is taken"
          items={caseDetail.possible_consequences_if_no_action}
          emptyLabel="No clear consequence was saved for this case."
        />
        <DetailList
          title="Possible next steps"
          items={caseDetail.recommended_next_steps}
          emptyLabel="No next steps were saved yet."
        />
        <DetailList
          title="Suggested resources"
          items={caseDetail.suggested_resources}
          emptyLabel="No suggested resources were saved yet."
        />
        <DetailList
          title="Missing information"
          items={caseDetail.missing_information}
          emptyLabel="No missing information has been flagged."
        />
        <DetailList
          title="Missing documents"
          items={caseDetail.missing_documents}
          emptyLabel="No missing documents have been flagged."
        />
      </div>
    </div>
  );
}
