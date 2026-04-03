import { AnalysisResult } from "@/app/api/analyze/route";

export interface UserHistoryItem {
  id: string;
  verdict: "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED";
  confidence: number;
  inputType: "text" | "url" | "pdf";
  preview: string;
  processedAt: string;
  result: AnalysisResult;
}

interface SyncUserInput {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

const HISTORY_PREFIX = "truthguard_history";
const SELECTED_PREFIX = "truthguard_selected_history";

function getHistoryKey(userId: string) {
  return `${HISTORY_PREFIX}:${userId}`;
}

function readCachedHistory(userId: string): UserHistoryItem[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    return JSON.parse(localStorage.getItem(getHistoryKey(userId)) || "[]");
  } catch {
    return [];
  }
}

function writeCachedHistory(userId: string, items: UserHistoryItem[]) {
  if (typeof window === "undefined" || !userId) return;
  localStorage.setItem(getHistoryKey(userId), JSON.stringify(items.slice(0, 20)));
}

export async function getUserHistory(userId: string): Promise<UserHistoryItem[]> {
  if (!userId) return [];

  try {
    const response = await fetch(`/api/history?userId=${encodeURIComponent(userId)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to load remote history");
    }

    const data = (await response.json()) as { history?: UserHistoryItem[] };
    const history = data.history || [];
    writeCachedHistory(userId, history);
    return history;
  } catch {
    return readCachedHistory(userId);
  }
}

export async function appendUserHistory(userId: string, item: UserHistoryItem): Promise<UserHistoryItem[]> {
  if (!userId) return [];

  try {
    const response = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, item }),
    });
    if (!response.ok) {
      throw new Error("Failed to save remote history");
    }

    const data = (await response.json()) as { history?: UserHistoryItem[] };
    const history = data.history || [];
    writeCachedHistory(userId, history);
    return history;
  } catch {
    const fallback = [item, ...readCachedHistory(userId).filter((entry) => entry.id !== item.id)].slice(0, 20);
    writeCachedHistory(userId, fallback);
    return fallback;
  }
}

export async function clearUserHistory(userId: string) {
  if (!userId) return;

  try {
    await fetch(`/api/history?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem(getHistoryKey(userId));
    }
  }
}

export async function syncUserProfile(input: SyncUserInput) {
  if (!input.uid) return;

  await fetch("/api/users/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function setSelectedHistoryItem(userId: string, item: UserHistoryItem) {
  if (typeof window === "undefined" || !userId) return;
  sessionStorage.setItem(`${SELECTED_PREFIX}:${userId}`, JSON.stringify(item));
}

export function getSelectedHistoryItem(userId: string): UserHistoryItem | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = sessionStorage.getItem(`${SELECTED_PREFIX}:${userId}`);
    return raw ? (JSON.parse(raw) as UserHistoryItem) : null;
  } catch {
    return null;
  }
}

export function clearSelectedHistoryItem(userId: string) {
  if (typeof window === "undefined" || !userId) return;
  sessionStorage.removeItem(`${SELECTED_PREFIX}:${userId}`);
}
