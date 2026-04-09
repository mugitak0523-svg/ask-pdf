import "server-only";

export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.APP_BASE_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");
