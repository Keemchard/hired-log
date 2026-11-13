import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
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

  const docSnap = await getDoc(docRef);
  if (!docSnap.exists() || docSnap.data().userId !== userId) {
    throw new Error("Unauthorized");
  }

  const { interviews, timeline, ...rest } = data as Record<string, unknown>;

  const sanitized = sanitizeApplicationData(
    {
      ...docSnap.data(),
      ...rest,
    } as Record<string, unknown>,
    extraValidStatuses
  );

  const updatePayload: Record<string, unknown> = {
    ...sanitized,
    userId,
    updatedAt: new Date().toISOString(),
  };

  if (interviews !== undefined) updatePayload.interviews = interviews;
  if (timeline !== undefined) updatePayload.timeline = timeline;

  await updateDoc(docRef, updatePayload);
}

export async function deleteApplication(
  id: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);

  const docSnap = await getDoc(docRef);
  if (!docSnap.exists() || docSnap.data().userId !== userId) {
    throw new Error("Unauthorized");
  }

  await deleteDoc(docRef);
}
