import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { CustomStatus, DEFAULT_STATUSES } from "@/types/application";

const COLLECTION = "userSettings";

export async function getStatuses(userId: string): Promise<CustomStatus[]> {
  const ref = doc(db, COLLECTION, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return DEFAULT_STATUSES;
  const saved = snap.data().statuses as CustomStatus[] | undefined;
  return saved?.length ? saved : DEFAULT_STATUSES;
}

export async function saveStatuses(userId: string, statuses: CustomStatus[]): Promise<void> {
  const ref = doc(db, COLLECTION, userId);
  await setDoc(ref, { statuses }, { merge: true });
}
