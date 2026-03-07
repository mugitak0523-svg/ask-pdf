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

    def _pick(*keys: str) -> Any:
        for key in keys:
            value = usage.get(key)
            if value is not None:
                return value
        return None

    input_tokens = _to_int(
        _pick(
            "input_tokens",
            "prompt_tokens",
            "prompt_token_count",
            "promptTokenCount",
            "inputTokenCount",
            "input_token_count",
        )
    )
    output_tokens = _to_int(
        _pick(
            "output_tokens",
            "completion_tokens",
            "candidates_token_count",
            "candidatesTokenCount",
            "outputTokenCount",
            "output_token_count",
        )
    )
    total_tokens = _to_int(
        _pick(
            "total_tokens",
            "total_token_count",
            "totalTokenCount",
        )
    )

    if input_tokens is None:
        prompt_details = usage.get("prompt_tokens_details")
        if isinstance(prompt_details, dict):
            cached = _to_int(prompt_details.get("cached_tokens"))
            uncached = _to_int(prompt_details.get("uncached_tokens"))
            if cached is not None or uncached is not None:
                input_tokens = (cached or 0) + (uncached or 0)

    if output_tokens is None:
        completion_details = usage.get("completion_tokens_details")
        if isinstance(completion_details, dict):
            reasoning = _to_int(completion_details.get("reasoning_tokens"))
            visible = _to_int(completion_details.get("output_tokens"))
            if reasoning is not None or visible is not None:
                output_tokens = (reasoning or 0) + (visible or 0)

    if total_tokens is None and input_tokens is not None and output_tokens is not None:
        total_tokens = input_tokens + output_tokens
    if input_tokens is None and total_tokens is not None and output_tokens is not None:
        input_tokens = max(0, total_tokens - output_tokens)
    if output_tokens is None and total_tokens is not None and input_tokens is not None:
        output_tokens = max(0, total_tokens - input_tokens)
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
