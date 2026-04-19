"use client";

import { useState } from "react";
import { generateDraft } from "@/lib/api";
import type { DraftResponse, DraftType } from "@/lib/types";
import { classNames } from "@/lib/utils";

type GenerateDraftPanelProps = {
  caseId: string;
};

const draftOptions: Array<{ value: DraftType; label: string }> = [
  { value: "email", label: "Email" },
  { value: "response", label: "Written response" },
  { value: "call_script", label: "Call script" },
];

export function GenerateDraftPanel({ caseId }: GenerateDraftPanelProps) {
  const [draftType, setDraftType] = useState<DraftType>("email");
  const [userGoal, setUserGoal] = useState("");
  const [draftResult, setDraftResult] = useState<DraftResponse | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  async function handleGenerateDraft(): Promise<void> {
    try {
      setIsPending(true);
      setErrorMessage(null);
      setCopyState("idle");

      const nextDraft = await generateDraft(
        caseId,
        draftType,
        userGoal.trim() || undefined,
      );
      setDraftResult(nextDraft);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not generate a draft right now.",
      );
    } finally {
      setIsPending(false);
    }
  }

  async function handleCopy(): Promise<void> {
    if (!draftResult || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    const copyText = draftResult.subject
      ? `Subject: ${draftResult.subject}\n\n${draftResult.body}`
      : draftResult.body;

    await navigator.clipboard.writeText(copyText);
    setCopyState("copied");
  }

  return (
    <section className="rounded-[1.75rem] border border-slate-100 bg-white p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
            Draft assistance
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Generate a message or script from this case
          </h2>
        </div>

        <div className="text-sm text-slate-500">
          Drafts stay grounded in the saved case details.
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {draftOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setDraftType(option.value)}
            className={classNames(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              draftType === option.value
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-semibold text-slate-800">
          Optional goal or tone request
        </span>
        <textarea
          value={userGoal}
          onChange={(event) => setUserGoal(event.target.value)}
          rows={4}
          placeholder="Example: Keep this concise and focused on asking for a deadline extension."
          className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white"
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleGenerateDraft()}
          disabled={isPending}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Generating..." : "Generate draft"}
        </button>

        {errorMessage ? (
          <div className="text-sm text-rose-600">{errorMessage}</div>
        ) : null}
      </div>

      {draftResult ? (
        <div className="mt-6 rounded-[1.5rem] border border-violet-100 bg-violet-50/55 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
                Draft ready
              </div>
              <div className="mt-2 text-sm text-slate-500">
                Review and personalize before sending.
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleCopy()}
              className="rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              {copyState === "copied" ? "Copied" : "Copy"}
            </button>
          </div>

          {draftResult.subject ? (
            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Subject:</span>{" "}
              {draftResult.subject}
            </div>
          ) : null}

          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-white px-4 py-4 text-sm leading-6 text-slate-700">
            {draftResult.body}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
