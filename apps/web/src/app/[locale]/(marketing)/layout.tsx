import type { ReactNode } from "react";

import styles from "./marketing-layout.module.css";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className={styles.mkShell}>{children}</div>;
}
