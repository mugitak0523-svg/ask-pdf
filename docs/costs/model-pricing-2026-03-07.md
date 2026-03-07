# Model Pricing (Updated: 2026-03-07)

This sheet summarizes pricing for models configured in this app, based on official pages.

## Scope
- `CHAT_MODEL_FAST`: `gpt-oss-120b`
- `CHAT_MODEL_STANDARD`: `gpt-5-mini`
- `CHAT_MODEL_THINK`: `gpt-5-mini`
- Optional model used in this project history: `gemini-3-flash-preview`
- Embedding models (for `embed` operation): `text-embedding-3-small`, `text-embedding-3-large`
- PDF parsing: fixed at **$10 / 1000 pages** (requested rule)

## Pricing table (USD)

| Item | Unit | Price |
|---|---:|---:|
| `gpt-5-mini` input | per 1M tokens | $0.25 |
| `gpt-5-mini` cached input | per 1M tokens | $0.025 |
| `gpt-5-mini` output | per 1M tokens | $2.00 |
| `gpt-oss-120b` | per 1M tokens | $0.00 (internal rule) |
| `gemini-3-flash-preview` input (text/image/video) | per 1M tokens | $0.50 |
| `gemini-3-flash-preview` input (audio) | per 1M tokens | $1.00 |
| `gemini-3-flash-preview` output | per 1M tokens | $3.00 |
| `text-embedding-3-small` input | per 1M tokens | $0.02 |
| `text-embedding-3-large` input | per 1M tokens | $0.13 |
| PDF parse | per 1000 pages | $10.00 |

## Operational notes
- `gpt-oss-120b` is open-weight; this project currently treats its token cost as `0` by rule.
- Gemini pricing varies by modality and tier. Values above are Paid Tier Standard token prices.
- Embedding cost should be counted separately from chat generation cost.

## Sources
- OpenAI API Pricing: https://openai.com/api/pricing/
- OpenAI Introducing gpt-oss: https://openai.com/index/introducing-gpt-oss
- OpenAI gpt-oss model card: https://openai.com/index/gpt-oss-model-card/
- Gemini API Pricing: https://ai.google.dev/gemini-api/docs/pricing
- Gemini 3 guide (model IDs and headline pricing): https://ai.google.dev/gemini-api/docs/gemini-3
