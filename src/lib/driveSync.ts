import type { UserProfile } from "../types";
import { normalizeProfile, profileForCloud } from "./storage";

const SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const FILE_NAME = "german-learning-profile.json";
const GIS_SRC = "https://accounts.google.com/gsi/client";

class DriveHttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
}

function requestToken(clientId: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    await loadScript(GIS_SRC);
    if (!window.google) {
      reject(new Error("Google Identity Services did not load."));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new Error(response.error ?? "Google authorization failed."));
      },
    });
    tokenClient.requestAccessToken();
  });
}

async function driveFetch<T>(token: string, url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) throw new DriveHttpError(response.status, `Drive request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

async function findProfileFile(token: string): Promise<string | undefined> {
  const params = new URLSearchParams({
    spaces: "appDataFolder",
    q: `name='${FILE_NAME}'`,
    fields: "files(id,name,modifiedTime)",
  });
  const result = await driveFetch<{ files: { id: string }[] }>(
    token,
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`
  );
  return result.files[0]?.id;
}

async function downloadProfile(token: string, fileId: string): Promise<UserProfile> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new DriveHttpError(response.status, `Could not download Drive profile: ${response.status}`);
  return normalizeProfile(await response.json());
}

async function uploadProfile(token: string, profile: UserProfile, fileId?: string): Promise<string> {
  const metadata = fileId ? { name: FILE_NAME } : { name: FILE_NAME, parents: ["appDataFolder"] };
  const boundary = "german_pro_boundary";
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(profileForCloud(profile), null, 2),
    `--${boundary}--`,
  ].join("\r\n");

  const url = fileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  const method = fileId ? "PATCH" : "POST";
  const result = await driveFetch<{ id: string }>(token, url, {
    method,
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  return result.id;
}

function isExpiredTokenError(error: unknown) {
  return error instanceof DriveHttpError && (error.status === 401 || error.status === 403);
}

async function withTokenRetry<T>(clientId: string, operation: (token: string) => Promise<T>): Promise<T> {
  const token = await requestToken(clientId);
  try {
    return await operation(token);
  } catch (error) {
    if (!isExpiredTokenError(error)) throw error;
    const freshToken = await requestToken(clientId);
    return operation(freshToken);
  }
}

export async function saveProfileToDrive(localProfile: UserProfile, clientId: string): Promise<UserProfile> {
  return withTokenRetry(clientId, async (token) => {
    const fileId = await findProfileFile(token);
    const syncedAt = new Date().toISOString();
    const profile = normalizeProfile({
      ...localProfile,
      settings: {
        ...localProfile.settings,
        lastSyncedAt: syncedAt,
        signedInHint: "Google Drive connected",
      },
    });
    await uploadProfile(token, profile, fileId);
    return profile;
  });
}

export async function restoreProfileFromDrive(clientId: string): Promise<UserProfile> {
  return withTokenRetry(clientId, async (token) => {
    const fileId = await findProfileFile(token);
    if (!fileId) throw new Error("No Drive backup found yet.");
    const restored = await downloadProfile(token, fileId);
    const syncedAt = new Date().toISOString();
    return normalizeProfile({
      ...restored,
      settings: {
        ...restored.settings,
        lastSyncedAt: syncedAt,
        signedInHint: "Google Drive connected",
      },
    });
  });
}
