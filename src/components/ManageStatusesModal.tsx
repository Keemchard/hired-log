"use client";

import { useState, useEffect, useRef } from "react";
import {
  IoClose,
  IoTrash,
  IoPencil,
  IoCheckmark,
  IoAdd,
  IoReorderThree,
} from "react-icons/io5";
import { CustomStatus } from "@/types/application";
import styles from "@/styles/manage-statuses.module.scss";

const COLOR_PALETTE = [
  "#2563eb", "#d97706", "#0ea5e9", "#64748b",
  "#4cc38a", "#16a34a", "#e5484d", "#6b7280",
  "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
  "#06b6d4", "#f97316", "#84cc16", "#e11d48",
];

interface ManageStatusesModalProps {
  isOpen: boolean;
  onClose: () => void;
  statuses: CustomStatus[];
  onSave: (statuses: CustomStatus[]) => Promise<void>;
}

export default function ManageStatusesModal({
  isOpen,
  onClose,
  statuses: initialStatuses,
  onSave,
}: ManageStatusesModalProps) {
  const [statuses, setStatuses] = useState<CustomStatus[]>(initialStatuses);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState(COLOR_PALETTE[0]);
  const [addLabel, setAddLabel] = useState("");
  const [addColor, setAddColor] = useState(COLOR_PALETTE[8]);
  const [saving, setSaving] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatuses(initialStatuses);
      setEditingKey(null);
      setAddLabel("");
      setAddColor(COLOR_PALETTE[8]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const startEdit = (s: CustomStatus) => {
    setEditingKey(s.key);
    setEditLabel(s.label);
    setEditColor(s.color);
  };

  const confirmEdit = () => {
    if (!editingKey || !editLabel.trim()) return;
    setStatuses((prev) =>
      prev.map((s) =>
        s.key === editingKey
          ? { ...s, label: editLabel.trim(), color: editColor }
          : s
      )
    );
    setEditingKey(null);
  };

  const deleteStatus = (key: string) => {
    if (editingKey === key) setEditingKey(null);
    setStatuses((prev) => prev.filter((s) => s.key !== key));
  };

  const addStatus = () => {
    const label = addLabel.trim();
    if (!label) return;
    const slug = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    const key = `custom_${slug}_${Date.now().toString(36)}`;
    setStatuses((prev) => [...prev, { key, label, color: addColor }]);
    setAddLabel("");
  };

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = () => {
    const from = dragIndex.current;
    const to = dragOverIndex;
    if (from !== null && to !== null && from !== to) {
      setStatuses((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        return updated;
      });
    }
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    if (editingKey) confirmEdit();
    setSaving(true);
    try {
      await onSave(statuses);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Manage Statuses</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className={styles.list}>
          {statuses.map((s, i) => (
            <div
              key={s.key}
              className={`${styles.row} ${dragOverIndex === i ? styles.rowOver : ""}`}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={handleDrop}
              onDragEnd={() => {
                dragIndex.current = null;
                setDragOverIndex(null);
              }}
            >
              <span className={styles.dragHandle}>
                <IoReorderThree />
              </span>

              {editingKey === s.key ? (
                <div className={styles.editRow}>
                  <div className={styles.editInputRow}>
                    <input
                      className={styles.editInput}
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                    />
                    <button className={styles.confirmBtn} onClick={confirmEdit}>
                      <IoCheckmark />
                    </button>
                  </div>
                  <div className={styles.colorPaletteInline}>
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`${styles.colorSwatch} ${editColor === c ? styles.colorSwatchSelected : ""}`}
                        style={{ background: c }}
                        onClick={() => setEditColor(c)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <span className={styles.dot} style={{ background: s.color }} />
                  <span className={styles.label}>{s.label}</span>
                  <div className={styles.rowActions}>
                    <button
                      className={styles.iconBtn}
                      onClick={() => startEdit(s)}
                      title="Edit"
                    >
                      <IoPencil />
                    </button>
                    <button
                      className={styles.deleteIconBtn}
                      onClick={() => deleteStatus(s.key)}
                      title="Delete"
                    >
                      <IoTrash />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className={styles.addSection}>
          <div className={styles.addSectionLabel}>Add Status</div>
          <div className={styles.colorPalette}>
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.colorSwatch} ${addColor === c ? styles.colorSwatchSelected : ""}`}
                style={{ background: c }}
                onClick={() => setAddColor(c)}
              />
            ))}
          </div>
          <div className={styles.addRow}>
            <input
              className={styles.addInput}
              placeholder="Status name..."
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStatus()}
            />
            <button
              className={styles.addBtn}
              onClick={addStatus}
              disabled={!addLabel.trim()}
            >
              <IoAdd /> Add
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
