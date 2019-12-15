import chromep from "chrome-promise";
import debug from "debug";
import { isDevMode } from "./utils";
import { scan } from "./scanner";
import { get } from "lodash";

const devMode = isDevMode();
const log = debug("mbfc:background");

let interval = null;

async function getSettings() {
  const settings = await chromep.storage.sync.get();
  log("settings", settings);
  return settings;
}

async function getStorage() {
  const storage = await chromep.storage.local.get();
  log("storage", storage);
  return storage;
}

let todo = 1;

async function startInterval() {
  const started = !!interval;
  if (interval) {
    clearInterval(interval);
  }
  const settings = await getSettings();
  let ms;
  if (devMode) {
    ms = 10 * 1000;
  } else {
    const frequency = settings["notifications.frequency"].split(" ");
    ms = parseInt(frequency[0]);
    switch (frequency[1]) {
      case "days":
      case "day":
        ms = ms * 60;
      case "hours":
      case "hour":
        ms = ms * 60;
      case "minutes":
      case "minute":
        ms = ms * 60;
      case "seconds":
      case "second":
        ms = ms * 1000;
        break;
    }
  }
  log(
    `I will poll every ${ms} milliseconds, ${ms / 1000} seconds, ${ms /
      1000 /
      60} minutes`
  );
  interval = setInterval(polling, 1000 * 10);
  if (!started) await polling();
}

const drawIcon = (text, color, backColor) => {
  var canvas = document.createElement("canvas"); // Create the canvas
  canvas.width = 19;
  canvas.height = 19;
  let left = 10;
  let top = 12;

  var context = canvas.getContext("2d");
  if (backColor === "white") {
    context.fillStyle = color;
    context.fillRect(0, 0, 19, 19);
    context.fillStyle = backColor;
    context.fillRect(1, 1, 17, 17);
    left -= 1;
  } else {
    context.fillStyle = backColor;
    context.fillRect(0, 0, 19, 19);
  }

  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "small-caption";
  context.fillText(text, left, top);
  return context.getImageData(0, 0, 19, 19);
};

const colorMap = {
  whiteOnBlue: { color: "white", backColor: "#0a44ff" },
  blackOnLightBlue: { color: "black", backColor: "#94adff" },
  blackOnWhite: { color: "black", backColor: "white" },
  blackOnRed: { color: "black", backColor: "#ffb4b5" },
  whiteOnRed: { color: "white", backColor: "#ff171c" },
  whiteOnGreen: { color: "white", backColor: "green" },
  blackOnYellow: { color: "black", backColor: "yellow" }
};

async function polling() {
  const overallStats = {
    newReviews: 0,
    newIssues: 0
  };
  if (!todo) return;
  todo--;
  log("polling");
  const storage = await getStorage();
  const stats = get(storage, "stats", {});
  const details = get(storage, "details", {});
  log("stats from storage", stats);
  log("details from storage", details);
  const settings = await getSettings();
  const myIds = get(settings, "extensions.myExtensions", []);
  while (myIds.length) {
    const { id, name } = myIds.shift();
    if (!stats[id])
      stats[id] = {
        reviews: 0,
        issues: 0
      };
    if (isDevMode) {
      stats[id].reviews = 0;
      stats[id].issues = 0;
    }
    const info = await scan(id, name, stats[id] || {});
    const { reviews, issues, last } = info;
    details[id] = info;
    overallStats.newReviews += reviews.length;
    overallStats.newIssues += issues.length;
    await chromep.storage.local.set({ details });
    log(`${id} info: `, info);
  }
  log({ overallStats });
  let text = `0`;
  let selector = colorMap.whiteOnGreen;
  if (overallStats.newIssues > 0) {
    selector = colorMap.whiteOnRed;
    text = `${overallStats.newIssues}`;
  }
  chrome.browserAction.setBadgeText({ text: `${overallStats.newReviews}` });
  chrome.browserAction.setIcon({
    imageData: drawIcon(text, selector.color, selector.backColor)
  });
}

chrome.storage.onChanged.addListener(changes => {
  let dirty = false;
  Object.keys(changes).forEach(key => {
    dirty = dirty || key.split(".").length === 2;
  });
  if (dirty) {
    startInterval();
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  const firstrun = settings["firstrun"];
  if (firstrun != "done") {
    await chromep.storage.local.set({ firstrun: "done" });
    chrome.runtime.openOptionsPage();
  }
});

startInterval();
