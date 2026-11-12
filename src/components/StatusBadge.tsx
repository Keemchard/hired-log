"use client";

import {
  ApplicationStatus,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/types/application";
import styles from "@/styles/applications.module.scss";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];

  return (
    <span className={styles.statusBadge}>
      <span className={styles.statusDot} style={{ background: color }} />
      {STATUS_LABELS[status]}
    </span>
  );
}
