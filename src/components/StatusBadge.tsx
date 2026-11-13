"use client";

import {
  CustomStatus,
  resolveStatusColor,
  resolveStatusLabel,
} from "@/types/application";
import styles from "@/styles/applications.module.scss";

interface StatusBadgeProps {
  status: string;
  statuses?: CustomStatus[];
}

export default function StatusBadge({ status, statuses = [] }: StatusBadgeProps) {
  const color = resolveStatusColor(status, statuses);
  const label = resolveStatusLabel(status, statuses);

  return (
    <span className={styles.statusBadge}>
      <span className={styles.statusDot} style={{ background: color }} />
      {label}
    </span>
  );
}
