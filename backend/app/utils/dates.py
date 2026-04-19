from datetime import date, datetime, timedelta, timezone


def utc_now() -> datetime:
    """Return an aware UTC timestamp for runtime date calculations."""
    return datetime.now(timezone.utc)


def parse_iso_date(value: str | None) -> date | None:
    """Convert a YYYY-MM-DD string into a date when possible."""
    if not value:
        return None

    try:
        return date.fromisoformat(value.strip())
    except ValueError:
        return None


def resolved_retention_cutoff(retention_days: int) -> datetime:
    """Return the oldest resolved timestamp we still want to keep."""
    return utc_now() - timedelta(days=retention_days)


def is_within_retention(resolved_at: datetime | None, retention_days: int) -> bool:
    """Check whether a resolved case should still appear in history."""
    if resolved_at is None:
        return False
    return resolved_at >= resolved_retention_cutoff(retention_days)
