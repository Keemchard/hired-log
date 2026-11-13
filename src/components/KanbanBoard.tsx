"use client";

import { useState, useRef } from "react";
import {
  JobApplication,
  CustomStatus,
  resolveStatusColor,
  resolveStatusLabel,
} from "@/types/application";
import StatusBadge from "./StatusBadge";
import styles from "@/styles/kanban.module.scss";

interface KanbanBoardProps {
  applications: JobApplication[];
  statuses: CustomStatus[];
  onStatusChange: (appId: string, newStatus: string) => void;
  onEdit: (app: JobApplication) => void;
}

export default function KanbanBoard({
  applications,
  statuses,
  onStatusChange,
  onEdit,
}: KanbanBoardProps) {
  const [draggedApp, setDraggedApp] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const grouped = statuses.reduce(
    (acc, s) => {
      acc[s.key] = applications.filter((a) => a.status === s.key);
      return acc;
    },
    {} as Record<string, JobApplication[]>
  );

  const handleDragStart = (appId: string) => {
    setDraggedApp(appId);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverCol(status);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (status: string) => {
    if (draggedApp) {
      const app = applications.find((a) => a.id === draggedApp);
      if (app && app.status !== status) {
        onStatusChange(draggedApp, status);
      }
    }
    setDraggedApp(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggedApp(null);
    setDragOverCol(null);
  };

  return (
    <div>
      <div className={styles.header}>
        <h2>Kanban Board</h2>
        <p>Drag and drop applications between stages</p>
      </div>

      <div className={styles.board} ref={scrollRef}>
        {statuses.map((s) => (
          <div
            key={s.key}
            className={`${styles.column} ${dragOverCol === s.key ? styles.columnOver : ""}`}
            onDragOver={(e) => handleDragOver(e, s.key)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(s.key)}
          >
            <div className={styles.columnHeader}>
              <div
                className={styles.columnDot}
                style={{ background: resolveStatusColor(s.key, statuses) }}
              />
              <span className={styles.columnTitle}>{resolveStatusLabel(s.key, statuses)}</span>
              <span className={styles.columnCount}>{(grouped[s.key] || []).length}</span>
            </div>

            <div className={styles.columnBody}>
              {(grouped[s.key] || []).length === 0 ? (
                <div className={styles.emptyCol}>Drop here</div>
              ) : (
                (grouped[s.key] || []).map((app) => (
                  <div
                    key={app.id}
                    className={`${styles.card} ${draggedApp === app.id ? styles.cardDragging : ""}`}
                    draggable
                    onDragStart={() => handleDragStart(app.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onEdit(app)}
                  >
                    <div className={styles.cardCompany}>{app.company}</div>
                    <div className={styles.cardPosition}>{app.position}</div>
                    <div className={styles.cardMeta}>
                      <span>{app.location}</span>
                      <span>
                        {new Date(app.dateApplied).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {app.salary && (
                      <div className={styles.cardSalary}>{app.salary}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
