import type { UrgencyLevel } from "@/lib/types";
import { classNames, getUrgencyMeta } from "@/lib/utils";

type UrgencyBadgeProps = {
  level: UrgencyLevel;
  className?: string;
};

export function UrgencyBadge({ level, className }: UrgencyBadgeProps) {
  const urgencyMeta = getUrgencyMeta(level);

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold",
        urgencyMeta.badgeClassName,
        className,
      )}
    >
      {urgencyMeta.label}
    </span>
  );
}
