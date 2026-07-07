import type { UserProfile } from "../types";
import { mergeProfiles, profileForCloud } from "./storage";

const SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const FILE_NAME = "german-learning-profile.json";
const GIS_SRC = "https://accounts.google.com/gsi/client";

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
  if (!response.ok) throw new Error(`Drive request failed: ${response.status}`);
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
  if (!response.ok) throw new Error(`Could not download Drive profile: ${response.status}`);
  return response.json() as Promise<UserProfile>;
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

export async function syncWithDrive(localProfile: UserProfile, clientId: string): Promise<UserProfile> {
  const token = await requestToken(clientId);
  const fileId = await findProfileFile(token);
  const merged = fileId ? mergeProfiles(localProfile, await downloadProfile(token, fileId)) : localProfile;
  await uploadProfile(token, { ...merged, settings: { ...merged.settings, lastSyncedAt: new Date().toISOString() } }, fileId);
  return {
    ...merged,
    settings: {
      ...merged.settings,
      lastSyncedAt: new Date().toISOString(),
      signedInHint: "Google Drive connected",
    },
  };
}
