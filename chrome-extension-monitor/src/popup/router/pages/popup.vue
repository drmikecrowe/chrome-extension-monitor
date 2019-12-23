<template>
  <div class="container mx-auto p-2 centered">
    <div class="absolute top-0 right-0">
      <div class="p-1">
        <a href="#" @click="options" title="Configuration"><font-awesome-icon class="float-right" icon="cog"/></a>
      </div>
    </div>
    <div v-if="current" class="p-3">
      <a href="#" @click="add" title="Add to monitor list">
        <button
          class="t-button t-button-size-sm border block rounded inline-flex items-center justify-center px-4 py-2 text-sm text-white bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600"
        >
          <font-awesome-icon icon="plus-circle" size="xs" />
          <span class="pl-2 text-xs">Add {{ current["name"] }} to your monitor list</span>
        </button>
      </a>
    </div>
    <div class="pt-1 px-4 flex items-center">
      <div class="flex-auto bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-1" role="alert">
        <p class="text-xs">
          <font-awesome-icon icon="battery-quarter" />
          Please consider <a class="underline font-bold" href="https://www.patreon.com/bePatron?u=3955610" target="_blank">donating</a> just $1/mo. Each
          {{ pollsPerDay ? "of your " + pollsPerDay + " checks/day" : "checks" }} incurs a tiny cost...
        </p>
      </div>
    </div>

    <div class="clearfix"></div>
    <div class="pt-3">
      <t-table
        :headers="['Name', 'Issues', 'Reviews', 'Clear']"
        :data="details"
        :thead-class="{
          thead: '',
          tr: 'border-gray-700',
          th: 'uppercase font-bold p-2 bg-gray-400 text-gray-900 text-sm text-shadow',
        }"
      >
        <template v-slot:row="{ trClass, tdClass, row, rowIndex }">
          <tr :class="[trClass, rowIndex % 2 === 0 ? 'bg-gray-100' : '']">
            <td :class="[tdClass, 'text-left']">
              <a :href="row['url']" target="_blank" class="px-3" title="Open in Chrome Web Store">
                {{ row.name }}
                <font-awesome-icon icon="external-link-square-alt"
              /></a>
            </td>
            <td :class="['pl-4', row.issues.length ? 'issues' : '']">
              <router-link v-if="row.issues.length" :to="{ path: 'issues', query: { id: row['id'], url: row['url'] } }" class="px-3" title="Issues">
                {{ row.issues.length }}
                <font-awesome-icon icon="angle-double-right" size="lg" />
              </router-link>
              <span v-if="!row.issues.length" class="px-3">0</span>
            </td>
            <td :class="['pl-4']">
              <router-link v-if="row.reviews.length" :to="{ path: 'reviews', query: { id: row['id'], url: row['url'] } }" class="px-3" title="Issues">
                {{ row.reviews.length }}
                <font-awesome-icon icon="angle-double-right" size="lg" />
              </router-link>
              <span v-if="!row.reviews.length" class="px-3"
                >0 <a v-if="!row.reviews.length && !row.issues.length && !polling" href="#" @click="refresh(row)" title="Reload next poll"><font-awesome-icon icon="recycle"/></a
              ></span>
            </td>
            <td :class="tdClass">
              <a href="#" v-if="row.issues.length || row.reviews.length" @click="clear(row)" class="px-3" title="Clear"><font-awesome-icon icon="check" size="lg"/></a>
            </td>
          </tr>
        </template>
      </t-table>
      <div v-if="!current && details.length === 0">
        <p class="p-6">
          Navigate to your extension in the <a href="https://chrome.google.com/webstore/category/extensions" class="text-blue-600 visited:text-purple-600">Chrome Web Store</a> and
          click the icon again to add your extension...
        </p>
      </div>
    </div>
    <div class="p-2">
      <span class="absolute bottom-0 left-0 p-2 text-xs">
        <a href="https://www.patreon.com/bePatron?u=3955610" target="_blank">
          <button size="sm" class="patreon text-white t-button t-button-size-sm rounded-full border block inline-flex items-center justify-center px-2 py-1 text-sm ">
            <font-awesome-icon :icon="['fab', 'patreon']" size="xs" />
            <span class="pl-2 text-xs">Become a Patron!</span>
          </button>
        </a>
      </span>
      <span class="absolute bottom-0 right-0 px-2 shadow font-sans text-xs">As of: {{ lastRun | date }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import chromep from "chrome-promise";
import { get } from "lodash";
import { getStorage, getSettings, getMinutes } from "@/utils";
import { IScanResults, ICurrent } from "@/types";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faPatreon } from "@fortawesome/free-brands-svg-icons";
import { faExclamationCircle, faCheck, faAngleDoubleRight, faExternalLinkSquareAlt, faCog, faBatteryQuarter, faPlusCircle, faRecycle } from "@fortawesome/free-solid-svg-icons";

library.add(faExclamationCircle, faCheck, faAngleDoubleRight, faExternalLinkSquareAlt, faCog, faBatteryQuarter, faPatreon, faPlusCircle, faRecycle);

const log = require("debug")("mbfc:popup");

@Component
export default class Popup extends Vue {
  current: ICurrent | null = null;
  details: IScanResults[] = [];
  lastRun: number = 0;
  pollsPerDay: number = 0;
  polling: boolean = false;

  data() {
    this.updateData().then(() => {
      log(`Updated data`);
    });
    return {
      pollsPerDay: 0,
      lastRun: 0,
      current: null,
      details: [],
      polling: false,
    };
  }

  async updateData() {
    const [storedDetails, lastRun, settings, minutes] = await Promise.all([getStorage("details", []), getStorage("lastRun", 0), getSettings(), getMinutes()]);
    const myExtensions = settings["extensions.myExtensions"];
    log("myExtensions", myExtensions);
    let ids: string[] = [];
    if (myExtensions && myExtensions.length > 0) {
      let extensions = myExtensions.length;
      this.pollsPerDay = Math.round((extensions * 3600) / minutes);
      ids = myExtensions.map(detail => detail.id);
      log("ids we are tracking", ids);
      if (storedDetails && storedDetails.length > 0) {
        log("all details", storedDetails);
        this.details = storedDetails || [];
      }
    }
    this.current = await this.getWebstoreInfo(ids);
    if (lastRun) {
      this.lastRun = lastRun;
    }
  }

  async getWebstoreInfo(ids): Promise<ICurrent | null> {
    const tab = await chromep.tabs.getSelected();
    if (!tab) return null;
    const { url, title } = tab;
    log(url, title);
    if (!url || !title) return null;
    const parts = /([a-z]{32})/.exec(url);
    log(parts);
    if (!parts) return null;
    if (url.startsWith("https://chrome.google.com/webstore") && parts.length > 1) {
      const id = parts[1];
      if (ids.indexOf(id) === -1) {
        return {
          id,
          url,
          name: title.replace("- Chrome Web Store", ""),
        };
      }
    }
    return null;
  }

  async add() {
    log("adding to our tracker", this.current);
    const settings = await getSettings();
    const myIds = get(settings, "extensions.myExtensions", []);
    myIds.push(this.current);
    this.details.push({
      issues: [],
      reviews: [],
      ...(this.current as any),
    });
    this.current = null;
    await chromep.storage.sync.set({ "extensions.myExtensions": myIds });
    await this.backgroundUpdate();
  }

  async backgroundUpdate() {
    chrome.runtime.sendMessage({ type: "refresh" }, async response => {
      await this.updateData();
    });
  }

  async clear(row: IScanResults) {
    const { id } = row;
    const [stats, details] = await Promise.all([getSettings("stats"), getStorage("details", [])]);
    stats[id] = {
      reviews: Math.round(new Date().getTime() / 1000),
      issues: Math.round(new Date().getTime() / 1000),
    };
    log(stats);
    await Promise.all([chromep.storage.local.set({ details: this.details }), await chromep.storage.sync.set({ stats })]);
    await this.backgroundUpdate();
  }

  async refresh(row: IScanResults) {
    const { id } = row;
    const [stats, details] = await Promise.all([getSettings("stats"), getStorage("details", [])]);
    stats[id] = {
      reviews: 0,
      issues: 0,
    };
    log(stats);
    for (let detail of details) {
      if (detail.id === id) {
        detail.reviews = [];
        detail.issues = [];
      }
    }
    this.details = details;
    await Promise.all([chromep.storage.local.set({ details: this.details }), await chromep.storage.sync.set({ stats })]);
    this.polling = true;
    await this.backgroundUpdate();
  }

  async options() {
    chrome.runtime.openOptionsPage();
  }
}
</script>

<style scoped>
.centered {
  text-align: center;
}
.issues {
  color: red;
}
.patreon {
  background-color: rgb(232, 91, 70);
}
</style>
