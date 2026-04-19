from collections.abc import Iterable
from datetime import date, datetime
from typing import Any, TypeVar

from app.schemas.common import UrgencyLevel

T = TypeVar("T")

URGENCY_RANK = {
    UrgencyLevel.CRITICAL.value: 0,
    UrgencyLevel.HIGH.value: 1,
    UrgencyLevel.MEDIUM.value: 2,
    UrgencyLevel.LOW.value: 3,
}


def urgency_rank(value: str | UrgencyLevel) -> int:
    """Translate urgency labels into a stable sort priority."""
    raw_value = value.value if isinstance(value, UrgencyLevel) else str(value).lower()
    return URGENCY_RANK.get(raw_value, 99)


def _read_attr(item: Any, attr_name: str) -> Any:
    """Support SQLModel instances and schema objects with one helper."""
    return getattr(item, attr_name, None)


def case_sort_key(case: Any) -> tuple[int, date, float]:
    """Sort by urgency first, then nearest deadline, then newest cases."""
    deadline_date = _read_attr(case, "deadline_date") or date.max
    created_at = _read_attr(case, "created_at") or datetime.min
    created_timestamp = created_at.timestamp() if isinstance(created_at, datetime) else 0.0

    return (
        urgency_rank(_read_attr(case, "urgency_level") or UrgencyLevel.MEDIUM.value),
        deadline_date,
        -created_timestamp,
    )


def sort_cases(cases: Iterable[T]) -> list[T]:
    """Return cases sorted using the dashboard priority rules."""
    return sorted(cases, key=case_sort_key)
