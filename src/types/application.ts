export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "technical"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface CustomStatus {
  key: string;
  label: string;
  color: string;
}

export const DEFAULT_STATUSES: CustomStatus[] = [
  { key: "applied", label: "Applied", color: "#2563eb" },
  { key: "screening", label: "Screening", color: "#d97706" },
  { key: "interview", label: "Interview", color: "#0ea5e9" },
  { key: "technical", label: "Technical", color: "#64748b" },
  { key: "offer", label: "Offer", color: "#4cc38a" },
  { key: "accepted", label: "Accepted", color: "#16a34a" },
  { key: "rejected", label: "Rejected", color: "#e5484d" },
  { key: "withdrawn", label: "Withdrawn", color: "#6b7280" },
];

export interface Interview {
  id: string;
  date: string;
  type: "phone" | "technical" | "behavioral" | "onsite" | "other";
  notes?: string;
}

export const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  phone: "Phone Screen",
  technical: "Technical",
  behavioral: "Behavioral",
  onsite: "Onsite",
  other: "Other",
};

export interface TimelineEvent {
  id: string;
  date: string;
  type: "created" | "status_change" | "interview_added" | "note_updated" | "edited";
  description: string;
}

export const JOB_SOURCES: Record<string, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  glassdoor: "Glassdoor",
  referral: "Referral",
  company_site: "Company Website",
  handshake: "Handshake",
  other: "Other",
};

export type WorkMode = "remote" | "onsite" | "hybrid" | "wfh";

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  position: string;
  location: string;
  workMode: WorkMode;
  status: string;
  dateApplied: string;
  salary?: string;
  jobUrl?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  followUpDate?: string;
  source?: string;
  interviews?: Interview[];
  timeline?: TimelineEvent[];
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

export function resolveStatusLabel(status: string, statuses: CustomStatus[] = []): string {
  return statuses.find((s) => s.key === status)?.label ?? status;
}

export function resolveStatusColor(status: string, statuses: CustomStatus[] = []): string {
  return statuses.find((s) => s.key === status)?.color ?? "#6b7280";
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
  wfh: "Work From Home",
};
