import debug from "debug";
import { ReleaseNotes } from "./ReleaseNotes";
import { Documentation } from "./Documentation";

require("chrome-options/dist/main.min.js");

require("./custom.css");

const log = debug("mbfc:options");

const setup = () => {
  const chromeOptions = (chrome as any).options;
  if (!chromeOptions) return true;
  if (chromeOptions.opts.title === "Section") return false;

  log(`Configuring options`);

  chromeOptions.opts.autoSave = true;

  chromeOptions.opts.title = "Section";

  chromeOptions.opts.about = '<p>This extension is open-source, and is based here: <a href="https://github.com/drmikecrowe/chrome-extension-monitor">Github Project Page</a></p>';

  chromeOptions.addTab("Documentation", [
    {
      type: "html",
      html: Documentation,
    },
  ]);

  chromeOptions.addTab("Extensions", "", [
    { type: "h3", desc: "Enter your extensions" },
    {
      type: "list",
      name: "myExtensions",
      head: true,
      sortable: false,
      fields: [
        { type: "text", name: "name", desc: "Friendly display name" },
        { type: "text", name: "id", desc: "Extension ID (32-letters)" },
        { type: "text", name: "url", desc: "The Chrome Web Store URL" },
      ],
    },
  ]);

  chromeOptions.addTab("Notifications", "", [
    { type: "h3", desc: "Check Frequency" },
    {
      name: "frequency",
      desc: "",
      type: "select",
      options: ["15 minutes", "1 hour", "24 hours"],
      default: "1 hour",
    },
    { type: "h3", desc: "Badge Notifications" },
    {
      name: "badge",
      desc: "",
      type: "object",
      options: [
        { name: "new_review", desc: "New Review", default: true },
        { name: "new_support", desc: "New Support Entry", default: true },
      ],
    },
    { type: "h3", desc: "Desktop Notifications" },
    {
      name: "desktop",
      desc: "",
      type: "object",
      options: [
        { name: "new_review", desc: "New Review", default: true },
        { name: "new_support", desc: "New Support Entry", default: true },
      ],
    },
  ]);

  chromeOptions.addTab("Release Notes", [
    {
      type: "html",
      html: ReleaseNotes,
    },
  ]);

  chromeOptions.addTab("Donate", [
    {
      type: "html",
      html:
        "<p>We would greatly appreciate any donations you are willing to give (especially recurring ones!). &nbsp;Maintaining this extension and adding new features takes a fair amount of time, and donations help encourage more benefits and features.</p>" +
        "<p>You can donate in multiple ways:</p>" +
        "<ul>" +
        '<li>Via <a href="https://paypal.me/drmikecrowe" target="_blank">PayPal</a></li>' +
        '<li>Via <a href="https://www.patreon.com/solvedbymike" target="_blank">Patreon</a></li>' +
        "</ul>  ",
    },
  ]);
};

if (setup()) {
  setTimeout(setup, 1000);
}
