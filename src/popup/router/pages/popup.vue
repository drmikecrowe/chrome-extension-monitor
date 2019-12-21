<template>
  <div class="container mx-auto p-2 centered">
    <t-card v-if="current" :data="current">
      Add {{ current["name"] }} to your monitor list?
      <a href="#" title="Add to monitor list"><t-button v-on:click="add" size="" variant="success" class="py-1 px-2">Add</t-button></a>
    </t-card>
    <div class="pt-1 flex items-center">
      <div class="flex-auto content-left bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-1" role="alert">
        <p class="text-xs">
          <font-awesome-icon icon="battery-quarter" /> Please consider donating just $1/mo. Each {{ pollsPerDay ? "of your " + pollsPerDay + " checks/day" : "checks" }} goes thru
          our servers and incurs a tiny cost...
        </p>
      </div>
      <div class="flex-auto content-right">
        <a href="#" title="Configuration"><font-awesome-icon v-on:click="options" class="float-right" icon="cog"/></a>
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
              <span v-if="!row.reviews.length" class="px-3">0</span>
            </td>
            <td :class="tdClass">
              <a href="#" v-if="row.issues.length || row.reviews.length" @click="clear(row)" class="px-3" title="Clear"><font-awesome-icon icon="check" size="lg"/></a>
            </td>
          </tr>
        </template>
      </t-table>
    </div>
    <div class="p-2">
      <span class="absolute bottom-0 left-0 p-2">
        <button size="sm" class="patreon text-white t-button t-button-size-sm rounded-full border block inline-flex items-center justify-center px-2 py-1 text-sm ">
          <font-awesome-icon :icon="['fab', 'patreon']" size="xs" />
          <a class="pl-2 text-xs" href="https://www.patreon.com/bePatron?u=3955610" target="_blank">Become a Patron!</a>
        </button>
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
import { faExclamationCircle, faCheck, faAngleDoubleRight, faExternalLinkSquareAlt, faCog, faBatteryQuarter } from "@fortawesome/free-solid-svg-icons";

library.add(faExclamationCircle, faCheck, faAngleDoubleRight, faExternalLinkSquareAlt, faCog, faBatteryQuarter, faPatreon);

const log = require("debug")("mbfc:popup");

@Component
export default class Issues extends Vue {
  current: ICurrent | null = null;
  details: IScanResults[] = [];
  lastRun: number = 0;
  pollsPerDay: number = 0;

  data() {
    Promise.all([getStorage("details"), getStorage("lastRun"), getSettings(), getMinutes()]).then(results => {
      let [data, lastRun, settings, minutes] = results;
      let extensions = settings["extensions.myExtensions"].length;
      this.pollsPerDay = Math.round((extensions * 3600) / minutes);
      if (data) {
        log("all details", data);
        this.details = data || [];
        const ids = data.map(detail => detail.id);
        log("ids we are tracking", ids);
        this.getWebstoreInfo(ids).then(data => {
          log("chrome webstore info", data);
          this.current = data;
        });
      }
      if (lastRun) {
        this.lastRun = lastRun;
      }
    });
    return {
      current: null,
      details: [],
    };
  }

  async getWebstoreInfo(ids): Promise<ICurrent | null> {
    const tab = await chromep.tabs.getSelected();
    if (!tab) return null;
    const { url, title } = tab;
    if (!url || !title) return null;
    const parts = /([a-z]{32})/.exec(url);
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

  async add(item) {
    log("adding to our tracker", this.current);
    const settings = await getSettings();
    const myIds = get(settings, "extensions.myExtensions", []);
    myIds.push(this.current);
    await chromep.storage.sync.set({ "extensions.myExtensions": myIds });
  }

  async clear(row: IScanResults) {
    const { id } = row;
    const [stats, details] = await Promise.all([getSettings("stats"), getStorage("details")]);
    stats[id] = {
      reviews: new Date().getTime(),
      issues: new Date().getTime(),
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
