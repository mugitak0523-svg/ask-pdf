# Usage Logging Spec

## Goal
Track per-request usage with per-user aggregation support. Implementation will be added later.

## Storage Strategy
Store usage in a dedicated table (recommended), using explicit numeric columns for aggregation and a raw JSON column for provider-specific data.

## Required Columns
- id (uuid, primary key)
- created_at (timestamp)
- user_id (uuid, not null)
- operation (text, enum-like: answer | embed | parse)
- document_id (uuid, nullable)
- chat_id (uuid, nullable)
- message_id (uuid, nullable)
- model (text, nullable)
- input_tokens (integer, nullable)
- output_tokens (integer, nullable)
- total_tokens (integer, nullable)
- pages (integer, nullable)  # number of pages processed/affected
- raw_usage (jsonb, nullable)
- raw_request (jsonb, nullable)  # optional for diagnostics (e.g., provider response id)

## Notes
- "pages" is required as a first-class numeric column for aggregation.
- "raw_usage" should store the provider response as-is (or minimally normalized).
- If a provider omits some fields, keep the numeric column null and preserve details in raw_usage.
- If streaming usage arrives later, insert a placeholder row and update when usage is received.

## Example Usage Entry (JSON)
{
  "user_id": "...",
  "operation": "answer",
  "model": "gpt-4.1-mini",
  "input_tokens": 1234,
  "output_tokens": 256,
  "total_tokens": 1490,
  "pages": 0,
  "raw_usage": { "prompt_tokens": 1234, "completion_tokens": 256, "total_tokens": 1490 }
}

## Aggregation Examples
- Daily total tokens per user
- Total pages processed per user
- Cost per operation type

## Open Questions
- Should "pages" include only parsed pages, or pages referenced in RAG? Define before implementation.
- If multiple messages are generated in one request, decide whether to store per-message usage or a single rolled-up entry.
