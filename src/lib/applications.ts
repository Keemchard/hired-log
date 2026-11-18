import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { JobApplication } from "@/types/application";
import { sanitizeApplicationData } from "./sanitize";

const COLLECTION_NAME = "applications";

export async function getApplications(
  userId: string
): Promise<JobApplication[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as JobApplication[];
}

export async function addApplication(
  userId: string,
  data: Omit<JobApplication, "id" | "userId" | "createdAt" | "updatedAt">,
  extraValidStatuses: string[] = []
): Promise<string> {
  const { interviews, timeline, ...rest } = data as Record<string, unknown>;
  const sanitized = sanitizeApplicationData(rest, extraValidStatuses);
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...sanitized,
    interviews: interviews || [],
    timeline: timeline || [],
    userId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateApplication(
  id: string,
  userId: string,
  data: Partial<Omit<JobApplication, "id" | "userId" | "createdAt">>,
  extraValidStatuses: string[] = []
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const { interviews, timeline, ...rest } = data as Record<string, unknown>;

  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  const hasAllRequired =
    rest.company && rest.position && rest.location && rest.dateApplied;

  if (hasAllRequired) {
    const sanitized = sanitizeApplicationData(rest, extraValidStatuses);
    Object.assign(updatePayload, sanitized, { userId });
  } else {
    if (rest.status !== undefined) {
      if (!extraValidStatuses.includes(rest.status as string)) {
        throw new Error(`Invalid status: ${rest.status}`);
      }
      updatePayload.status = rest.status;
    }
  }

  if (interviews !== undefined) updatePayload.interviews = interviews;
  if (timeline !== undefined) updatePayload.timeline = timeline;

  await updateDoc(docRef, updatePayload);
}

export async function deleteApplication(
  id: string,
  _userId: string
): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}
