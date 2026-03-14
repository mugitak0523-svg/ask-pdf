"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { trackMarketingEvent } from "@/lib/marketing-analytics";

import styles from "./page.module.css";

type LpViewTrackerProps = {
  locale: string;
};

type LpSignupCtaProps = {
  label: string;
  locale: string;
  placement: "hero_primary" | "hero_secondary" | "pricing" | "footer";
  variant?: "primary" | "ghost";
};

export function LpViewTracker({ locale }: LpViewTrackerProps) {
  useEffect(() => {
    trackMarketingEvent("lp_view", {
      locale,
      page: "lp_general",
    });
  }, [locale]);

  return null;
}

export function LpSignupCta({
  label,
  locale,
  placement,
  variant = "primary",
}: LpSignupCtaProps) {
  const className =
    variant === "ghost"
      ? `${styles.ctaButton} ${styles.ctaButtonGhost}`
      : `${styles.ctaButton} ${styles.ctaButtonPrimary}`;

  return (
    <Link
      href="/"
      className={className}
      onClick={() => {
        trackMarketingEvent("lp_cta_click", {
          locale,
          page: "lp_general",
          placement,
        });
        trackMarketingEvent("signup_start", {
          locale,
          source: "lp_general",
          placement,
        });
      }}
    >
      {label}
    </Link>
  );
}
