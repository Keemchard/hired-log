"use client";

import { useState, useEffect } from "react";
import { IoWarning } from "react-icons/io5";
import styles from "@/styles/modal.module.scss";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  companyName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  companyName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) setDeleting(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.deleteOverlay} onClick={deleting ? undefined : onCancel}>
      <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.deleteIcon}>
          <IoWarning />
        </div>
        <h3 className={styles.deleteTitle}>Delete Application</h3>
        <p className={styles.deleteText}>
          Are you sure you want to delete your application to{" "}
          <strong>{companyName}</strong>? This action cannot be undone.
        </p>
        <div className={styles.deleteActions}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
