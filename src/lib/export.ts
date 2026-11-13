import { JobApplication, CustomStatus, WORK_MODE_LABELS, resolveStatusLabel } from "@/types/application";

export function exportApplicationsCSV(applications: JobApplication[], statuses: CustomStatus[]) {
  const headers = [
    "Company", "Position", "Location", "Work Mode", "Status", "Source",
    "Date Applied", "Follow-up Date", "Last Updated", "Salary", "Job URL",
    "Contact Person", "Contact Email", "Notes", "Interviews",
  ];

  const rows = applications.map((app) => [
    app.company,
    app.position,
    app.location,
    WORK_MODE_LABELS[app.workMode] || app.workMode,
    resolveStatusLabel(app.status, statuses),
    app.source || "",
    app.dateApplied,
    app.followUpDate || "",
    app.updatedAt.split("T")[0],
    app.salary || "",
    app.jobUrl || "",
    app.contactPerson || "",
    app.contactEmail || "",
    (app.notes || "").replace(/[\n\r]/g, " "),
    (app.interviews || []).map((i) => `${i.date} ${i.type}`).join("; "),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hired-log-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
