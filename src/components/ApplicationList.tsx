"use client";

import { useState, useMemo, useEffect } from "react";
import {
  IoSearch,
  IoAdd,
  IoPencil,
  IoTrash,
  IoOpen,
  IoBriefcase,
  IoLocationOutline,
  IoCalendarOutline,
  IoDownload,
} from "react-icons/io5";
import {
  JobApplication,
  CustomStatus,
  WORK_MODE_LABELS,
} from "@/types/application";
import StatusBadge from "./StatusBadge";
import styles from "@/styles/applications.module.scss";

interface ApplicationListProps {
  applications: JobApplication[];
  statuses: CustomStatus[];
  onAdd: () => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (app: JobApplication) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkStatusChange: (ids: string[], status: string) => void;
  onExport: () => void;
}

export default function ApplicationList({
  applications,
  statuses,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkStatusChange,
  onExport,
}: ApplicationListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("dateApplied_desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [sortField, sortDir] = sortKey.split("_") as [string, "asc" | "desc"];

  // Clear selection when applications list refreshes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [applications]);

  const filtered = useMemo(() => {
    let result = [...applications];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.position.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          (a.notes || "").toLowerCase().includes(q) ||
          (a.contactPerson || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    result.sort((a, b) => {
      let aVal: string;
      let bVal: string;

      switch (sortField) {
        case "company":
          aVal = a.company.toLowerCase();
          bVal = b.company.toLowerCase();
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "updatedAt":
          aVal = a.updatedAt;
          bVal = b.updatedAt;
          break;
        case "dateApplied":
        default:
          aVal = a.dateApplied;
          bVal = b.dateApplied;
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, search, statusFilter, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortKey(`${field}_${sortDir === "asc" ? "desc" : "asc"}`);
    } else {
      setSortKey(`${field}_desc`);
    }
  };

  const sortIndicator = (field: string) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatusApply = () => {
    if (!bulkStatus) return;
    onBulkStatusChange(Array.from(selectedIds), bulkStatus);
    setSelectedIds(new Set());
    setBulkStatus("");
  };

  const handleBulkDelete = () => {
    onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div>
      <div className={styles.header}>
        <h2>Applications</h2>
        <button className={styles.addButton} onClick={onAdd}>
          <IoAdd /> Add Application
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <IoSearch />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search company, position, location, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          {statuses.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="dateApplied_desc">Date Applied ↓</option>
          <option value="dateApplied_asc">Date Applied ↑</option>
          <option value="updatedAt_desc">Last Updated ↓</option>
          <option value="updatedAt_asc">Last Updated ↑</option>
        </select>
        <button className={styles.exportBtn} onClick={onExport} title="Export to CSV">
          <IoDownload /> Export
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.tableWrapper}>
          <div className={styles.emptyTable}>
            <IoBriefcase />
            <p>
              {applications.length === 0
                ? "No applications yet. Click \"Add Application\" to get started."
                : "No applications match your filters."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.desktopTable}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={allFilteredSelected}
                        onChange={toggleSelectAll}
                        title="Select all"
                      />
                    </th>
                    <th onClick={() => toggleSort("company")}>
                      Company{sortIndicator("company")}
                    </th>
                    <th>Location</th>
                    <th onClick={() => toggleSort("status")}>
                      Status{sortIndicator("status")}
                    </th>
                    <th onClick={() => toggleSort("dateApplied")}>
                      Date Applied{sortIndicator("dateApplied")}
                    </th>
                    <th onClick={() => toggleSort("updatedAt")}>
                      Last Updated{sortIndicator("updatedAt")}
                    </th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => (
                    <tr key={app.id} style={{ opacity: selectedIds.has(app.id) ? 0.85 : 1 }}>
                      <td className={styles.checkboxCell}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={selectedIds.has(app.id)}
                          onChange={() => toggleSelect(app.id)}
                        />
                      </td>
                      <td>
                        <div className={styles.companyCell}>
                          <div className={styles.company}>{app.company}</div>
                          <div className={styles.position}>{app.position}</div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.locationCell}>
                          <div className={styles.location}>{app.location}</div>
                          <span className={styles.workMode}>
                            {WORK_MODE_LABELS[app.workMode]}
                          </span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={app.status} statuses={statuses} />
                      </td>
                      <td>
                        <div>
                          {new Date(app.dateApplied).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          {app.followUpDate && (
                            <div
                              style={{
                                fontSize: "0.72rem",
                                color: app.followUpDate < today ? "var(--color-danger, #e5484d)" : "var(--color-text-muted)",
                                marginTop: 2,
                              }}
                            >
                              Follow-up: {app.followUpDate}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {new Date(app.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>{app.salary || "—"}</td>
                      <td>
                        <div className={styles.actions}>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.actionBtn}
                              title="Open job posting"
                            >
                              <IoOpen />
                            </a>
                          )}
                          <button
                            className={styles.actionBtn}
                            onClick={() => onEdit(app)}
                            title="Edit"
                          >
                            <IoPencil />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => onDelete(app)}
                            title="Delete"
                          >
                            <IoTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.mobileCards}>
            {filtered.map((app) => (
              <div key={app.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardCompany}>{app.company}</div>
                    <div className={styles.cardPosition}>{app.position}</div>
                  </div>
                  <StatusBadge status={app.status} statuses={statuses} />
                </div>
                <div className={styles.cardDetails}>
                  <span className={styles.cardDetail}>
                    <IoLocationOutline /> {app.location}
                  </span>
                  <span className={styles.cardDetail}>
                    <IoCalendarOutline />{" "}
                    {new Date(app.dateApplied).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className={styles.cardDetail}>
                    Updated{" "}
                    {new Date(app.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {app.salary && (
                    <span className={styles.cardDetail}>{app.salary}</span>
                  )}
                </div>
                <div className={styles.cardActions}>
                  {app.jobUrl && (
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.actionBtn}
                    >
                      <IoOpen />
                    </a>
                  )}
                  <button className={styles.actionBtn} onClick={() => onEdit(app)}>
                    <IoPencil />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => onDelete(app)}
                  >
                    <IoTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{selectedIds.size} selected</span>
          <div className={styles.bulkDivider} />
          <select
            className={styles.filterSelect}
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            style={{ padding: "6px 32px 6px 10px", fontSize: "0.8rem" }}
          >
            <option value="">Change Status...</option>
            {statuses.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          {bulkStatus && (
            <button className={styles.addStatusConfirm ?? ""} onClick={handleBulkStatusApply}
              style={{ padding: "6px 14px", background: "var(--color-accent, #2563eb)", border: "none", borderRadius: 6, color: "white", fontSize: "0.8rem", cursor: "pointer" }}
            >
              Apply
            </button>
          )}
          <div className={styles.bulkDivider} />
          <button className={styles.bulkDeleteBtn} onClick={handleBulkDelete}>
            <IoTrash /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
