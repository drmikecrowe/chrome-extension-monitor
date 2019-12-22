import chromep from "chrome-promise";
import { get } from "lodash";

const log = require("debug")("mbfc:utils");

export async function getSettings(item: string | null = null, deflt: any = {}) {
  const settings = await chromep.storage.sync.get();
  log("settings", settings);
  if (item) {
    return get(settings, item, deflt);
  }
  return settings;
}

export async function getStorage(item: string | null = null, deflt: any = {}) {
  const storage = await chromep.storage.local.get();
  log("storage", storage);
  if (item) {
    return get(storage, item, deflt);
  }
  return storage;
}

export async function getMinutes(): Promise<number> {
  const settings = await getSettings();
  let minutes = 0;
  const frequency = settings["notifications.frequency"];
  if (!frequency || frequency.indexOf(" ") === -1) return 0;
  const parts = frequency.split(" ");
  minutes = parseInt(parts[0]);
  switch (parts[1]) {
    case "days":
    case "day":
      minutes = minutes * 60;
    case "hours":
    case "hour":
      minutes = minutes * 60;
      break;
  }
  return minutes;
}

export const isDevMode = (): boolean => {
  const devMode = !chrome.runtime || !("update_url" in chrome.runtime.getManifest());
  if (devMode) {
    localStorage.debug = "mbfc:*";
  }
  return devMode;
};
