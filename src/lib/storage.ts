import type { QuizRecord, ReviewRecord, UserProfile, WeakPointRecord } from "../types";

const DB_NAME = "german-pro-db";
const DB_VERSION = 1;
const STORE = "kv";
const PROFILE_KEY = "profile";
const FALLBACK_PROFILE_KEY = "german-pro-profile";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeQuizHistory(value: unknown): QuizRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((record, index) => ({
    id: stringValue(record.id, `quiz-${index}`),
    questionId: stringValue(record.questionId),
    answer: stringValue(record.answer),
    correct: booleanValue(record.correct),
    updatedAt: stringValue(record.updatedAt, now()),
  }));
}

function normalizeWeakPoints(value: unknown): WeakPointRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((record, index) => ({
    id: stringValue(record.id, `weak-${index}`),
    label: stringValue(record.label, "Practice item"),
    misses: numberValue(record.misses, 1),
    updatedAt: stringValue(record.updatedAt, now()),
  }));
}

function normalizeReviewQueue(value: unknown): ReviewRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((record, index) => ({
    id: stringValue(record.id, `review-${index}`),
    dueAt: stringValue(record.dueAt, now()),
    intervalDays: numberValue(record.intervalDays, 1),
    updatedAt: stringValue(record.updatedAt, now()),
  }));
}

export function normalizeProfile(value: unknown): UserProfile {
  const fallback = createDefaultProfile();
  if (!isRecord(value)) return fallback;

  const courseProgress = isRecord(value.courseProgress) ? value.courseProgress : {};
  const settings = isRecord(value.settings) ? value.settings : {};

  return {
    profileVersion: 1,
    deviceId: stringValue(value.deviceId, fallback.deviceId),
    updatedAt: stringValue(value.updatedAt, now()),
    courseProgress: {
      currentLessonId: stringValue(courseProgress.currentLessonId, fallback.courseProgress.currentLessonId),
      completedLessonIds: stringArray(courseProgress.completedLessonIds),
      streak: numberValue(courseProgress.streak, 0),
      lastStudiedAt: stringValue(courseProgress.lastStudiedAt) || undefined,
    },
    quizHistory: normalizeQuizHistory(value.quizHistory),
    weakPoints: normalizeWeakPoints(value.weakPoints),
    reviewQueue: normalizeReviewQueue(value.reviewQueue),
    settings: {
      googleClientId: stringValue(settings.googleClientId) || undefined,
      lastSyncedAt: stringValue(settings.lastSyncedAt) || undefined,
      signedInHint: stringValue(settings.signedInHint) || undefined,
      reminderHour: numberValue(settings.reminderHour, fallback.settings.reminderHour),
      ttsRate: numberValue(settings.ttsRate, fallback.settings.ttsRate),
    },
  };
}

function readFallbackProfile(): UserProfile | undefined {
  const raw = localStorage.getItem(FALLBACK_PROFILE_KEY);
  if (!raw) return undefined;
  try {
    return normalizeProfile(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

function writeFallbackProfile(profile: UserProfile) {
  localStorage.setItem(FALLBACK_PROFILE_KEY, JSON.stringify(normalizeProfile(profile)));
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
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get(PROFILE_KEY);
      request.onsuccess = () => {
        const profile = request.result ? normalizeProfile(request.result) : readFallbackProfile() ?? createDefaultProfile();
        writeFallbackProfile(profile);
        resolve(profile);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return readFallbackProfile() ?? createDefaultProfile();
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const next = normalizeProfile({ ...profile, updatedAt: now() });
  writeFallbackProfile(next);
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(next, PROFILE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return Promise.resolve();
  }
}

export async function replaceProfile(profile: UserProfile): Promise<void> {
  const next = normalizeProfile(profile);
  writeFallbackProfile(next);
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(next, PROFILE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return Promise.resolve();
  }
}

export function profileForCloud(profile: UserProfile): UserProfile {
  return {
    ...profile,
    settings: {
      ...profile.settings,
    },
  };
}
