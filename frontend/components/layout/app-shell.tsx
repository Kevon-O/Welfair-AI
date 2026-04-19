import Link from "next/link";
import type { ReactNode } from "react";
import { formatGuestSessionLabel } from "@/lib/guest-session";
import { classNames } from "@/lib/utils";

type AppSection = "dashboard" | "settings";

type AppShellProps = {
  title: string;
  description: string;
  currentSection: AppSection;
  guestSessionId: string | null;
  actions?: ReactNode;
  children: ReactNode;
};

const navigationItems: Array<{
  id: AppSection;
  label: string;
  href: string;
  helper: string;
}> = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    helper: "Current case queue",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    helper: "History and archive",
  },
];

export function AppShell({
  title,
  description,
  currentSection,
  guestSessionId,
  actions,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#faf7ff_0%,_#ffffff_48%,_#f7f1ff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="w-full rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-[0_24px_70px_-44px_rgba(91,33,182,0.4)] backdrop-blur lg:min-h-[calc(100vh-2rem)] lg:w-[280px] lg:sticky lg:top-4">
          <Link href="/" className="inline-flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-500">
              Welfair AI
            </span>
            <span className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Crisis navigation workspace
            </span>
          </Link>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Organize urgent documents, keep deadlines visible, and move the next
            step closer without losing the full case picture.
          </p>

          <div className="mt-6 rounded-3xl border border-violet-100 bg-violet-50/80 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">
              Guest session
            </div>
            <div className="mt-2 text-sm font-medium text-slate-800">
              {formatGuestSessionLabel(guestSessionId)}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This workspace stays tied to this browser so the case queue and
              upload history remain connected while you work.
            </p>
          </div>

          <nav className="mt-8 space-y-3">
            {navigationItems.map((item) => {
              const isActive = item.id === currentSection;
              const sharedClasses =
                "block rounded-3xl border px-4 py-4 transition";

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={classNames(
                    sharedClasses,
                    isActive
                      ? "border-violet-200 bg-violet-600 text-white shadow-[0_16px_35px_-24px_rgba(109,40,217,0.9)]"
                      : "border-violet-100 bg-white text-slate-800 hover:border-violet-200 hover:bg-violet-50",
                  )}
                >
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div
                    className={classNames(
                      "mt-1 text-sm",
                      isActive ? "text-violet-100" : "text-slate-500",
                    )}
                  >
                    {item.helper}
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-[0_24px_70px_-44px_rgba(91,33,182,0.4)] backdrop-blur lg:p-8">
          <header className="flex flex-col gap-5 border-b border-slate-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">
                Workspace
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {description}
              </p>
            </div>

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </header>

          <div className="pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
