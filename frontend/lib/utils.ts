import type { CaseRecord, UrgencyLevel } from "@/lib/types";

export function classNames(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}

export function formatDate(
  value: string | null,
  fallbackLabel = "No date listed",
): string {
  if (!value) {
    return fallbackLabel;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return fallbackLabel;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

export function formatDateTime(
  value: string | null,
  fallbackLabel = "No date listed",
): string {
  if (!value) {
    return fallbackLabel;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return fallbackLabel;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

const URGENCY_META: Record<
  UrgencyLevel,
  {
    label: string;
    badgeClassName: string;
    cardClassName: string;
    accentClassName: string;
    eyebrowClassName: string;
    panelClassName: string;
    listItemClassName: string;
  }
> = {
  critical: {
    label: "Critical",
    badgeClassName:
      "border-rose-200 bg-rose-50 text-rose-700 shadow-[0_10px_24px_-18px_rgba(225,29,72,0.55)]",
    cardClassName: "border-rose-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#fff5f7_100%)]",
    accentClassName: "text-rose-600",
    eyebrowClassName: "text-rose-500",
    panelClassName: "border-rose-100 bg-rose-50/65",
    listItemClassName: "border border-rose-100 bg-white/88",
  },
  high: {
    label: "High",
    badgeClassName:
      "border-orange-200 bg-orange-50 text-orange-700 shadow-[0_10px_24px_-18px_rgba(234,88,12,0.55)]",
    cardClassName:
      "border-orange-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#fff7ed_100%)]",
    accentClassName: "text-orange-600",
    eyebrowClassName: "text-orange-500",
    panelClassName: "border-orange-100 bg-orange-50/70",
    listItemClassName: "border border-orange-100 bg-white/88",
  },
  medium: {
    label: "Medium",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-700 shadow-[0_10px_24px_-18px_rgba(217,119,6,0.5)]",
    cardClassName:
      "border-amber-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#fffaf0_100%)]",
    accentClassName: "text-amber-600",
    eyebrowClassName: "text-amber-500",
    panelClassName: "border-amber-100 bg-amber-50/70",
    listItemClassName: "border border-amber-100 bg-white/88",
  },
  low: {
    label: "Low",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_10px_24px_-18px_rgba(5,150,105,0.5)]",
    cardClassName:
      "border-emerald-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f1fcf7_100%)]",
    accentClassName: "text-emerald-600",
    eyebrowClassName: "text-emerald-500",
    panelClassName: "border-emerald-100 bg-emerald-50/70",
    listItemClassName: "border border-emerald-100 bg-white/88",
  },
};

export function getUrgencyMeta(level: UrgencyLevel) {
  return URGENCY_META[level];
}

export function formatDeadline(
  deadlineText: string | null,
  deadlineDate: string | null,
): string {
  if (deadlineText?.trim()) {
    return deadlineText;
  }

  return formatDate(deadlineDate, "No deadline listed");
}

function compareDates(a: string | null, b: string | null): number {
  if (!a && !b) {
    return 0;
  }

  if (!a) {
    return 1;
  }

  if (!b) {
    return -1;
  }

  const aTime = new Date(a).getTime();
  const bTime = new Date(b).getTime();

  if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
    return 0;
  }

  if (Number.isNaN(aTime)) {
    return 1;
  }

  if (Number.isNaN(bTime)) {
    return -1;
  }

  return aTime - bTime;
}

const urgencyRank: Record<UrgencyLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function sortCasesByPriority(cases: CaseRecord[]): CaseRecord[] {
  return [...cases].sort((left, right) => {
    const urgencyDifference =
      urgencyRank[left.urgency_level] - urgencyRank[right.urgency_level];
    if (urgencyDifference !== 0) {
      return urgencyDifference;
    }

    const deadlineDifference = compareDates(
      left.deadline_date,
      right.deadline_date,
    );
    if (deadlineDifference !== 0) {
      return deadlineDifference;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}
