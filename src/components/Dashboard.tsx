"use client";

import { IoAdd, IoBriefcase } from "react-icons/io5";
import {
  JobApplication,
  CustomStatus,
  resolveStatusColor,
  resolveStatusLabel,
} from "@/types/application";
import StatusBadge from "./StatusBadge";
import styles from "@/styles/dashboard.module.scss";

interface DashboardProps {
  applications: JobApplication[];
  statuses: CustomStatus[];
  onNavigate: (view: string) => void;
  onManageStatuses: () => void;
  onAddApplication: () => void;
  onEditApplication: (app: JobApplication) => void;
}

export default function Dashboard({
  applications,
  statuses,
  onNavigate,
  onManageStatuses,
  onAddApplication,
  onEditApplication,
}: DashboardProps) {
  const total = applications.length;
  const active = applications.filter(
    (a) =>
      !["rejected", "withdrawn", "accepted"].includes(a.status)
  ).length;
  const offers = applications.filter((a) => a.status === "offer" || a.status === "accepted").length;
  const rejected = applications.filter(
    (a) => a.status === "rejected"
  ).length;

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const recent = [...applications]
    .sort(
      (a, b) =>
        new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
    )
    .slice(0, 5);

  const thisWeek = applications.filter((a) => {
    const applied = new Date(a.dateApplied);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return applied >= weekAgo;
  }).length;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your job application progress</p>
        </div>
        <button className={styles.addBtn} onClick={onAddApplication}>
          <IoAdd /> Add Application
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total applications</div>
          <div className={styles.statValue} style={{ color: "#2563eb" }}>
            {total}
          </div>
          <div className={styles.statFooter}>{thisWeek} this week</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active</div>
          <div className={styles.statValue}>
            {active}
          </div>
          <div className={styles.statFooter}>In progress</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Offers</div>
          <div className={styles.statValue}>
            {offers}
          </div>
          <div className={styles.statFooter}>Received</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Rejected</div>
          <div className={styles.statValue}>
            {rejected}
          </div>
          <div className={styles.statFooter}>
            {total > 0
              ? `${Math.round((rejected / total) * 100)}% rejection rate`
              : "No data"}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Status Breakdown</h3>
          <button
            onClick={onManageStatuses}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Manage
          </button>
        </div>
        <div className={styles.statusBreakdown}>
          {statuses.map((s) => (
            <div key={s.key} className={styles.statusItem}>
              <div
                className={styles.statusDot}
                style={{ background: resolveStatusColor(s.key, statuses) }}
              />
              <div className={styles.statusInfo}>
                <div className={styles.statusName}>
                  {resolveStatusLabel(s.key, statuses)}
                </div>
                <div className={styles.statusCount}>
                  {statusCounts[s.key] || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Recent Applications</h3>
          {applications.length > 5 && (
            <button
              className={styles.viewAll}
              onClick={() => onNavigate("applications")}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              View all
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <div className={styles.emptyState}>
            <IoBriefcase />
            <h3>No applications yet</h3>
            <p>Start tracking your job applications to see your progress here.</p>
            <button className={styles.addBtn} onClick={onAddApplication}>
              <IoAdd /> Add Application
            </button>
          </div>
        ) : (
          <div className={styles.recentList}>
            {recent.map((app) => (
              <button
                key={app.id}
                className={styles.recentItem}
                onClick={() => onEditApplication(app)}
              >
                <div className={styles.recentInfo}>
                  <span className={styles.company}>{app.company}</span>
                  <span className={styles.position}>{app.position}</span>
                </div>
                <div className={styles.recentMeta}>
                  <StatusBadge status={app.status} statuses={statuses} />
                  <span className={styles.date}>
                    {new Date(app.dateApplied).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
