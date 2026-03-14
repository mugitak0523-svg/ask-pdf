type MarketingEventName =
  | "lp_view"
  | "lp_cta_click"
  | "signup_start"
  | "signup_complete"
  | "first_pdf_upload";

type MarketingPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackMarketingEvent = (
  eventName: MarketingEventName,
  payload: MarketingPayload = {}
) => {
  if (typeof window === "undefined") return;
  const detail = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...payload,
  };
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(detail);
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  }
  window.dispatchEvent(
    new CustomEvent("askpdf:marketing-event", {
      detail,
    })
  );
};
