import chromep from "chrome-promise";
import debug from "debug";
import { scan } from "./scanner";
import { get } from "lodash";
import { IScanResults } from "@/types";
import date from "@/filters/date";
import { getSettings, getStorage, getMinutes } from "@/utils";

const devMode = !chrome.runtime || !("update_url" in chrome.runtime.getManifest());
if (devMode) {
  localStorage.debug = "mbfc:*";
}

const log = debug("mbfc:background");

let interval: any = null;

// let todo = 1;
async function pollExtensions() {
  const overallStats = {
    newReviews: 0,
    newIssues: 0,
  };
  // if (!todo) return;
  // todo--;
  log("polling");
  const details = await getStorage("details");
  log("details from storage", details);
  const settings = await getSettings();
  const myIds = get(settings, "extensions.myExtensions", []);
  const stats = get(settings, "stats", {});
  log("stats from storage", stats);
  const newDetails: IScanResults[] = [];
  while (myIds.length) {
    const { id, name, url } = myIds.shift();
    if (!stats[id])
      stats[id] = {
        reviews: 0,
        issues: 0,
      };
    // if (devMode) {
    //   stats[id].reviews = 0;
    //   stats[id].issues = 0;
    // }
    const info = await scan(id, name, url, stats[id] || {});
    const { reviews, issues, last } = info;
    newDetails.push(info);
    overallStats.newReviews += reviews.length;
    overallStats.newIssues += issues.length;
    await chromep.storage.local.set({ details: newDetails });
    log(`${id} info: `, info);
  }
  log({ overallStats });
  let text = `0`;
  if (overallStats.newIssues > 0) {
    log(settings);
    text = `${overallStats.newIssues}`;
    chrome.browserAction.setBadgeText({ text });
    chrome.browserAction.setBadgeBackgroundColor({
      color: "red",
    });
  } else if (overallStats.newReviews > 0) {
    log(settings);
    text = `${overallStats.newReviews}`;
    chrome.browserAction.setBadgeText({ text });
    chrome.browserAction.setBadgeBackgroundColor({
      color: "green",
    });
  } else {
    chrome.browserAction.setBadgeText({
      text: "",
    });
  }
  await chromep.storage.local.set({ lastRun: new Date().getTime() / 1000 });
}

/* ***************************** [ Setup Chrome Events ] ***************************** */

const alarmName = "BackgroundTimer";

async function setupAlarms() {
  let [minutes, lastRun] = await Promise.all([await getMinutes(), await getStorage("lastRun")]);
  await chromep.alarms.clearAll();
  log(`Creating alarm ${alarmName} that runs in 1 minute and every ${minutes} thereafter.  Last run was `, date(lastRun));
  chrome.alarms.create(alarmName, { delayInMinutes: 1, periodInMinutes: minutes });
  await chromep.storage.local.set({ alarmMinutes: `${minutes}` });
  chrome.alarms.onAlarm.addListener(() => {
    log(`Alarm fired.`);
    pollExtensions();
  });
}

chrome.storage.onChanged.addListener(async () => {
  let [minutes, alaramMinutes] = await Promise.all([await getMinutes(), await getStorage("alarmMinutes")]);
  if (`${minutes}` !== `${alaramMinutes}`) {
    await setupAlarms();
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await chromep.storage.local.get();
  log(`Installed.  firstrun=`, settings);
  if (settings.firstrun != "done") {
    await chromep.storage.local.set({ firstrun: "done" });
    chrome.runtime.openOptionsPage();
  }
});

(async () => {
  await setupAlarms();
})().catch(err => {
  console.error(err);
});
