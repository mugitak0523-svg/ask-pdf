# PDF Rendering Cache

This app now caches PDF bytes and signed URLs to speed up rendering.

## What Is Cached

- **Signed URLs** (server-side, in-memory)
  - Key: `storage_path`
  - Value: `(signed_url, expires_at)`
  - Avoids repeated slow Supabase Storage signing
- **Bundle response** (client-side, in-memory)
  - Key: `documentId`
  - Value: `signed_url + expires_at + annotations (+ result)`
  - Skips redundant `/bundle` calls within a session
- **PDF bytes** (client-side)
  - **Memory cache** (LRU, `PDF_CACHE_MAX=3`)
  - **IndexedDB** (`askpdf.pdfCache.v1` → `pdfBuffers`)
  - Key: `documentId` (falls back to URL)
  - Annotations are stored alongside the PDF buffer after a successful save

## How It Works

1. PDF selection triggers `GET /documents/{id}/bundle`
2. API returns `signed_url` + `expires_at` (and annotations/result if enabled)
3. Frontend loads PDF bytes once, caches them, and reuses the buffer on future opens
4. pdf.js renders from **`data`** (ArrayBuffer), not URL

## Files

- Server
  - `apps/server/app/services/storage.py` (signed URL cache)
  - `apps/server/app/api/documents.py` (returns `expires_at`)
- Client
  - `apps/web/src/components/pdf-viewer/pdf-viewer.tsx`

## Notes

- IndexedDB cache is **best-effort**; if unavailable, memory cache is used.
- `expires_at` is server time + `expires_in` seconds.
- For large PDFs, the first load still depends on download time.
