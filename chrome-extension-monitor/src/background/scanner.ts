/**
 * Copied from:
 * "author": "Chris Schmich <schmch@gmail.com>",
 * "license": "MIT",
 * "homepage": "https://github.com/schmich/chrome-extension-alerts#readme",
 */

import axios from "axios";
import debug from "debug";
import defaults from "lodash/defaults";
import { IStat, IScanResults } from "@/types";

const log = debug("mbfc:background");

export const scan = async (id: string, name: string, url: string, lastStats: IStat): Promise<IScanResults> => {
  const baseUrl = "https://us-central1-chrome-extension-monitor.cloudfunctions.net/chromeFeedback";

  defaults(lastStats, { reviews: 0, issues: 0 });
  const { reviews, issues } = lastStats;
  const scanUrl = `${baseUrl}?id=${id}&reviews=${reviews || 0}&issues=${issues || 0}`;
  log(`Polling ${scanUrl}`);
  try {
    const res = await axios.get(scanUrl);
    if (res.status === 200) {
      const data: IScanResults = res.data;
      const { reviews, issues, last } = data;
      const results: IScanResults = {
        id,
        name,
        url,
        issues,
        reviews,
        last,
      };
      log(`Returning results=`, results);
      return results;
    } else {
      throw new Error(`Invalid response from firebase: ${res.status}`);
    }
  } catch (err) {
    console.error(err);
  }
  const now = new Date().getTime();
  return {
    id,
    name,
    url,
    issues: [],
    reviews: [],
    last: { issues: now, reviews: now },
  };
};
