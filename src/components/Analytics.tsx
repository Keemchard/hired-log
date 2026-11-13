"use client";

import {
  JobApplication,
  ApplicationStatus,
  CustomStatus,
  WORK_MODE_LABELS,
  WorkMode,
  resolveStatusColor,
  resolveStatusLabel,
} from "@/types/application";
import styles from "@/styles/analytics.module.scss";

interface AnalyticsProps {
  applications: JobApplication[];
  statuses: CustomStatus[];
}

function getWeekLabel(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Analytics({ applications, statuses }: AnalyticsProps) {
  const total = applications.length;

  // Response rate: apps that moved past "applied"
  const responded = applications.filter((a) => a.status !== "applied").length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  // Interview rate: apps that reached interview or beyond
  const interviewed = applications.filter((a) =>
    ["interview", "technical", "offer", "accepted"].includes(a.status)
  ).length;
  const interviewRate = total > 0 ? Math.round((interviewed / total) * 100) : 0;

  // Offer rate
  const offers = applications.filter(
    (a) => a.status === "offer" || a.status === "accepted"
  ).length;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  // Average time to response (apps that moved past applied)
  // We can't calculate exact response time without a status change timestamp,
  // so we show days since application for active ones
  const active = applications.filter(
    (a) => !["rejected", "withdrawn", "accepted"].includes(a.status)
  );
  const avgDaysActive =
    active.length > 0
      ? Math.round(
          active.reduce((sum, a) => {
            const days = Math.floor(
              (Date.now() - new Date(a.dateApplied).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0) / active.length
        )
      : 0;

  // Weekly activity (last 8 weeks)
  const weeklyData: { label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = applications.filter((a) => {
      const d = new Date(a.dateApplied);
      return d >= weekStart && d < weekEnd;
    }).length;

    weeklyData.push({ label: getWeekLabel(weekStart), count });
  }
  const maxWeekly = Math.max(...weeklyData.map((w) => w.count), 1);

  // Status distribution — uses user-defined statuses in their order
  const statusDist = statuses.map((s) => ({
    key: s.key,
    exact: applications.filter((a) => a.status === s.key).length,
  }));

  // Work mode distribution
  const workModes = (Object.keys(WORK_MODE_LABELS) as WorkMode[]).map((mode) => ({
    mode,
    label: WORK_MODE_LABELS[mode],
    count: applications.filter((a) => a.workMode === mode).length,
  }));

  // Top companies by applications
  const companyCounts: Record<string, number> = {};
  applications.forEach((a) => {
    companyCounts[a.company] = (companyCounts[a.company] || 0) + 1;
  });
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Monthly trend (last 6 months)
  const monthlyData: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    const m = d.getMonth();
    const count = applications.filter((a) => {
      const ad = new Date(a.dateApplied);
      return ad.getMonth() === m && ad.getFullYear() === year;
    }).length;
    monthlyData.push({ label: month, count });
  }
  const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);

  if (total === 0) {
    return (
      <div>
        <div className={styles.header}>
          <h2>Analytics</h2>
          <p>Insights and trends from your job search</p>
        </div>
        <div className={styles.empty}>
          <p>Add some applications to see your analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h2>Analytics</h2>
        <p>Insights and trends from your job search</p>
      </div>

      <div className={styles.rateCards}>
        <div className={styles.rateCard}>
          <div className={styles.rateValue} style={{ color: "#3b82f6" }}>
            {responseRate}%
          </div>
          <div className={styles.rateLabel}>Response Rate</div>
          <div className={styles.rateSub}>
            {responded} of {total} got responses
          </div>
        </div>
        <div className={styles.rateCard}>
          <div className={styles.rateValue} style={{ color: "#64748b" }}>
            {interviewRate}%
          </div>
          <div className={styles.rateLabel}>Interview Rate</div>
          <div className={styles.rateSub}>
            {interviewed} reached interview stage
          </div>
        </div>
        <div className={styles.rateCard}>
          <div className={styles.rateValue} style={{ color: "#10b981" }}>
            {offerRate}%
          </div>
          <div className={styles.rateLabel}>Offer Rate</div>
          <div className={styles.rateSub}>{offers} offers received</div>
        </div>
        <div className={styles.rateCard}>
          <div className={styles.rateValue} style={{ color: "#f59e0b" }}>
            {avgDaysActive}
          </div>
          <div className={styles.rateLabel}>Avg Days Active</div>
          <div className={styles.rateSub}>For in-progress applications</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Weekly Activity</h3>
          <div className={styles.barChart}>
            {weeklyData.map((w, i) => (
              <div key={i} className={styles.barGroup}>
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${(w.count / maxWeekly) * 100}%`,
                      background: w.count > 0 ? "#2563eb" : "transparent",
                    }}
                  />
                </div>
                <span className={styles.barLabel}>{w.label}</span>
                {w.count > 0 && (
                  <span className={styles.barValue}>{w.count}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Monthly Trend</h3>
          <div className={styles.barChart}>
            {monthlyData.map((m, i) => (
              <div key={i} className={styles.barGroup}>
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${(m.count / maxMonthly) * 100}%`,
                      background: m.count > 0 ? "#64748b" : "transparent",
                    }}
                  />
                </div>
                <span className={styles.barLabel}>{m.label}</span>
                {m.count > 0 && (
                  <span className={styles.barValue}>{m.count}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Status Distribution</h3>
          <div className={styles.funnel}>
            {statusDist.map(({ key, exact }) => {
              const pct = total > 0 ? Math.round((exact / total) * 100) : 0;
              return (
                <div key={key} className={styles.funnelRow}>
                  <div className={styles.funnelLabel}>
                    <div
                      className={styles.funnelDot}
                      style={{ background: resolveStatusColor(key, statuses) }}
                    />
                    {resolveStatusLabel(key, statuses)}
                  </div>
                  <div className={styles.funnelBarWrap}>
                    <div
                      className={styles.funnelBar}
                      style={{
                        width: `${Math.max(pct, exact > 0 ? 2 : 0)}%`,
                        background: resolveStatusColor(key, statuses),
                      }}
                    />
                  </div>
                  <span className={styles.funnelCount}>{exact}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Work Mode</h3>
          <div className={styles.donutList}>
            {workModes.map((wm) => {
              const pct =
                total > 0 ? Math.round((wm.count / total) * 100) : 0;
              return (
                <div key={wm.mode} className={styles.donutItem}>
                  <div className={styles.donutInfo}>
                    <span className={styles.donutLabel}>{wm.label}</span>
                    <span className={styles.donutPct}>{pct}%</span>
                  </div>
                  <div className={styles.donutBarWrap}>
                    <div
                      className={styles.donutBar}
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {topCompanies.length > 0 && (
          <div className={styles.chartCard}>
            <h3>Top Companies</h3>
            <div className={styles.companyList}>
              {topCompanies.map(([company, count], i) => (
                <div key={company} className={styles.companyItem}>
                  <span className={styles.companyRank}>{i + 1}</span>
                  <span className={styles.companyName}>{company}</span>
                  <span className={styles.companyCount}>
                    {count} app{count > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.chartCard}>
          <h3>Status Overview</h3>
          <div className={styles.statusGrid}>
            {statuses.map((s) => {
              const count = applications.filter((a) => a.status === s.key).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={s.key} className={styles.statusTile}>
                  <div
                    className={styles.statusTileDot}
                    style={{ background: resolveStatusColor(s.key, statuses) }}
                  />
                  <div className={styles.statusTileInfo}>
                    <span className={styles.statusTileName}>
                      {resolveStatusLabel(s.key, statuses)}
                    </span>
                    <span className={styles.statusTileCount}>
                      {count} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
