import chromep from "chrome-promise";
import { get } from "lodash";

const log = require("debug")("mbfc:utils");

export async function getSettings(item: string | null = null) {
  const settings = await chromep.storage.sync.get();
  log("settings", settings);
  if (item) {
    return get(settings, item, {});
  }
  return settings;
}

export async function getStorage(item: string | null = null) {
  const storage = await chromep.storage.local.get();
  log("storage", storage);
  if (item) {
    return get(storage, item, {});
  }
  return storage;
}

export async function getMinutes(): Promise<number> {
  const settings = await getSettings();
  let minutes;
  const frequency = settings["notifications.frequency"].split(" ");
  minutes = parseInt(frequency[0]);
  switch (frequency[1]) {
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
