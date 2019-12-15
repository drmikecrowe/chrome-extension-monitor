import * as $ from "jquery";
import debug from "debug";
const log = debug("mbfc:background");

let count = 0;

$(function() {
  const queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    $("#url").text(tabs[0].url);
  });

  chrome.browserAction.setBadgeText({ text: (++count).toString() });

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        color: "#555555"
      },
      function(msg) {
        log("result message:", msg);
      }
    );
  });
});
