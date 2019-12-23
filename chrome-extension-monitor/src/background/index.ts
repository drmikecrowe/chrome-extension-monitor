import chromep from "chrome-promise";
import debug from "debug";
import { scan } from "./scanner";
import get from "lodash/get";
import { IScanResults } from "@/types";
import date from "@/filters/date";
import { getSettings, getStorage, getMinutes, isDevMode } from "@/utils";

const devMode = isDevMode();

const log = debug("mbfc:background");

async function pollExtensions() {
  const overallStats = {
    newReviews: 0,
    newIssues: 0,
  };
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
    if (!stats[id]) {
      stats[id] = {
        reviews: 0,
        issues: 0,
      };
    }
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

const setup = async () => {
  console.log("onInstalled....");
  scheduleRequest();
  scheduleWatchdog();
  const settings = await chromep.storage.local.get();
  log(`Installed.  firstrun=`, settings);
  if (settings.firstrun != "done") {
    await chromep.storage.local.set({ firstrun: "done" });
    chrome.runtime.openOptionsPage();
  }
};

/* ***************************** [ Setup Chrome Events ] ***************************** */

// create alarm for watchdog and fresh on installed/updated, and start fetch data
chrome.runtime.onInstalled.addListener(setup);

// fetch and save data when chrome restarted, alarm will continue running when chrome is restarted
chrome.runtime.onStartup.addListener(() => {
  console.log("onStartup....");
  startRequest();
});

// alarm listener
chrome.alarms.onAlarm.addListener(alarm => {
  // if watchdog is triggered, check whether refresh alarm is there
  if (alarm && alarm.name === "watchdog") {
    chrome.alarms.get("refresh", alarm => {
      if (alarm) {
        console.log("Refresh alarm exists.");
      } else {
        // if it is not there, start a new request and reschedule refresh alarm
        console.log("Refresh alarm doesn't exist, starting a new one");
        startRequest();
        scheduleRequest();
      }
    });
  } else {
    // if refresh alarm triggered, start a new request
    startRequest();
  }
});

// schedule a new fetch every 30 minutes
async function scheduleRequest() {
  let [minutes, lastRun] = await Promise.all([await getMinutes(), await getStorage("lastRun", 0)]);
  console.log(`schedule refresh alarm to ${minutes} minutes...`);
  await chromep.storage.local.set({ alarmMinutes: `${minutes}` });
  chrome.alarms.create("refresh", { periodInMinutes: minutes });
}

// schedule a watchdog check every 5 minutes
async function scheduleWatchdog() {
  console.log(`schedule watchdog alarm to 5 minutes...`);
  chrome.alarms.create("watchdog", { periodInMinutes: 5 });
}

// fetch data and save to local storage
async function startRequest() {
  console.log("polling extensions...");
  await pollExtensions();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  debug(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
  if (request.type == "refresh") {
    log(`Manual Refresh fired.`);
    pollExtensions().then(() => sendResponse());
    return true;
  }
});

chrome.storage.onChanged.addListener(async () => {
  let [minutes, alaramMinutes] = await Promise.all([await getMinutes(), await getStorage("alarmMinutes", 0)]);
  if (`${minutes}` !== `${alaramMinutes}`) {
    await chromep.alarms.clearAll();
    scheduleRequest();
    scheduleWatchdog();
  }
});

(async () => {
  const alarms = await chromep.alarms.getAll();
  for (let alarm of alarms) {
    console.log(`${alarm.name} is present with period of ${alarm.periodInMinutes} period and ${alarm.scheduledTime} scheduled minutes`);
  }
})().catch(err => {
  console.error(err);
});
