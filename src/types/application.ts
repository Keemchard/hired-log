export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "technical"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type WorkMode = "remote" | "onsite" | "hybrid" | "wfh";

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  position: string;
  location: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  dateApplied: string;
  salary?: string;
  jobUrl?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  technical: "Technical",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: "#2563eb",
  screening: "#d97706",
  interview: "#0ea5e9",
  technical: "#64748b",
  offer: "#4cc38a",
  accepted: "#16a34a",
  rejected: "#e5484d",
  withdrawn: "#6b7280",
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
  wfh: "Work From Home",
};
