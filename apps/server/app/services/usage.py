from __future__ import annotations

from typing import Any


def _to_int(value: Any) -> int | None:
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def extract_usage(payload: Any) -> tuple[int | None, int | None, int | None, dict[str, Any] | None]:
    if not isinstance(payload, dict):
        return None, None, None, None
    usage = payload.get("usage")
    if not isinstance(usage, dict):
        return None, None, None, None
    input_tokens = _to_int(usage.get("input_tokens") or usage.get("prompt_tokens"))
    output_tokens = _to_int(usage.get("output_tokens") or usage.get("completion_tokens"))
    total_tokens = _to_int(usage.get("total_tokens"))
    if total_tokens is None and input_tokens is not None and output_tokens is not None:
        total_tokens = input_tokens + output_tokens
    return input_tokens, output_tokens, total_tokens, usage


def extract_pages(payload: Any) -> int | None:
    if not isinstance(payload, dict):
        return None
    pages = payload.get("pages")
    if isinstance(pages, list):
        return len(pages)
    if isinstance(pages, int):
        return pages
    page_count = payload.get("page_count")
    return _to_int(page_count)
