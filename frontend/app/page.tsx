"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  ensureGuestSessionId,
  formatGuestSessionLabel,
  getGuestSessionId,
} from "@/lib/guest-session";

export default function HomePage() {
  const router = useRouter();
  const [sessionLabel, setSessionLabel] = useState("Guest workspace");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSessionLabel(formatGuestSessionLabel(getGuestSessionId()));
  }, []);

  function handleContinueAsGuest(): void {
    const guestSessionId = ensureGuestSessionId();
    setSessionLabel(formatGuestSessionLabel(guestSessionId));

    startTransition(() => {
      router.push("/dashboard");
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),_transparent_38%),linear-gradient(180deg,_#ffffff_0%,_#f8f5ff_100%)] px-6 py-16 text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-[2rem] border border-violet-100 bg-white/90 p-8 shadow-[0_32px_90px_-44px_rgba(109,40,217,0.38)] backdrop-blur">
          <div className="mb-6 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1 text-sm font-medium text-violet-700">
            Welfair AI
          </div>

          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Clear guidance for urgent documents when life is already heavy.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Upload a notice, letter, bill, or form to understand what it may
            mean, what deadlines matter, and which possible next steps to take
            first.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleContinueAsGuest}
              disabled={isPending}
              className="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_-18px_rgba(124,58,237,0.8)] transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-400"
            >
              {isPending ? "Opening workspace..." : "Continue as Guest"}
            </button>

            <p className="text-sm text-slate-500">
              Continue without creating an account. Your workspace stays tied to{" "}
              <span className="font-medium text-slate-700">{sessionLabel}</span>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
