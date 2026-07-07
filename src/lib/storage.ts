import type { UserProfile } from "../types";

const DB_NAME = "german-pro-db";
const DB_VERSION = 1;
const STORE = "kv";
const PROFILE_KEY = "profile";

function now() {
  return new Date().toISOString();
}

function makeDeviceId() {
  const existing = localStorage.getItem("german-pro-device-id");
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem("german-pro-device-id", id);
  return id;
}

export function createDefaultProfile(): UserProfile {
  const created = now();
  return {
    profileVersion: 1,
    deviceId: makeDeviceId(),
    updatedAt: created,
    courseProgress: {
      currentLessonId: "refresher",
      completedLessonIds: [],
      streak: 0,
    },
    quizHistory: [],
    weakPoints: [],
    reviewQueue: [],
    settings: {
      reminderHour: 9,
      ttsRate: 0.82,
    },
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getProfile(): Promise<UserProfile> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(PROFILE_KEY);
    request.onsuccess = () => resolve((request.result as UserProfile | undefined) ?? createDefaultProfile());
    request.onerror = () => reject(request.error);
  });
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await openDb();
  const next = { ...profile, updatedAt: now() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(next, PROFILE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function replaceProfile(profile: UserProfile): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(profile, PROFILE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function mergeProfiles(local: UserProfile, remote: UserProfile): UserProfile {
  const latestProgress =
    new Date(remote.updatedAt).getTime() > new Date(local.updatedAt).getTime()
      ? remote.courseProgress
      : local.courseProgress;

  const byLatest = <T extends { id: string; updatedAt: string }>(a: T[], b: T[]) => {
    const map = new Map<string, T>();
    [...a, ...b].forEach((item) => {
      const current = map.get(item.id);
      if (!current || new Date(item.updatedAt) >= new Date(current.updatedAt)) {
        map.set(item.id, item);
      }
    });
    return [...map.values()];
  };

  return {
    ...local,
    updatedAt: now(),
    courseProgress: latestProgress,
    quizHistory: byLatest(local.quizHistory, remote.quizHistory),
    weakPoints: byLatest(local.weakPoints, remote.weakPoints),
    reviewQueue: byLatest(local.reviewQueue, remote.reviewQueue),
    settings: {
      ...local.settings,
      ...remote.settings,
      googleClientId: local.settings.googleClientId ?? remote.settings.googleClientId,
    },
  };
}

export function profileForCloud(profile: UserProfile): UserProfile {
  return {
    ...profile,
    settings: {
      ...profile.settings,
    },
  };
}
