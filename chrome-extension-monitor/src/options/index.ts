import { isDevMode } from "@/utils";
const ReleaseNotes = require("./documentation/ReleaseNotes.md");
const Documentation = require("./documentation/Documentation.md");
const About = require("./documentation/About.md");
const Donate = require("./documentation/Donate.md");

require("chrome-options/dist/main.min.js");

require("./custom.css");

const log = require("debug")("mbfc:options");

const setup = () => {
  const chromeOptions = (chrome as any).options;
  if (!chromeOptions) return true;
  if (chromeOptions.opts.title === "Section") return false;

  log(`Configuring options`);

  chromeOptions.opts.autoSave = true;

  chromeOptions.opts.title = "Section";

  chromeOptions.opts.about = About;

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

  const pollTimes = ["15 minutes", "1 hour", "24 hours"];
  if (isDevMode()) pollTimes.unshift("2 minutes");
  chromeOptions.addTab("Notifications", "", [
    { type: "h3", desc: "Check Frequency" },
    {
      name: "frequency",
      desc: "",
      type: "select",
      options: pollTimes,
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
      html: Donate,
    },
  ]);
};

if (setup()) {
  setTimeout(setup, 1000);
}
