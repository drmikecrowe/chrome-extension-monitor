<template>
  <div class="container mx-auto">
    <div class="p-2">
      <div class="inline-flex w-full">
        <router-link :to="{ path: '/' }" title="Return" class="w-full">
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l w-full">
            <font-awesome-icon icon="angle-double-left" size="lg" />
            Back
          </button>
        </router-link>
        <a :href="webUrl" target="_blank" title="Web Store" class="w-full">
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r w-full">
            Extension Page in Web Store
            <font-awesome-icon icon="external-link-square-alt" size="lg" />
          </button>
        </a>
      </div>
    </div>
    <div class="clearfix"></div>
    <div class="p-2">
      <t-table class="table-auto" :data="list">
        <template v-slot:thead="{ trClass, thClass }">
          <thead :class="thClass">
            <tr :class="trClass">
              <th v-for="(item, index) in ['Date', 'Rating', 'Comment']" :key="index" :class="[thClass]">
                {{ item }}
              </th>
            </tr>
          </thead>
        </template>
        <template v-slot:row="{ trClass, tdClass, row, rowIndex }">
          <tr :class="[trClass, rowIndex % 2 === 0 ? 'bg-gray-100' : '']">
            <td :class="[tdClass, 'w-3/12']">
              {{ row.createdAt | date }}
            </td>
            <td :class="[tdClass, 'w-2/12 text-center']">
              <span v-for="(_, index) in Array(5)" :key="index">
                <font-awesome-icon :icon="[row.rating > index ? 'fas' : 'far', 'star']" />
              </span>
            </td>
            <td :class="[tdClass, 'w-7/12']">
              <div class="comment-cell">{{ row.comment }}</div>
            </td>
          </tr>
        </template>
      </t-table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { get, find } from "lodash";
import { getStorage, getSettings } from "@/utils";
import { IScanResults } from "@/types";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { faAngleDoubleLeft, faExternalLinkSquareAlt, faStar as fasStar } from "@fortawesome/free-solid-svg-icons";
library.add(faAngleDoubleLeft, faExternalLinkSquareAlt, farStar, fasStar);

const log = require("debug")("mbfc:issues");

@Component
export default class Reviews extends Vue {
  list: any[] = [];

  data() {
    this.loadReviews();
    return {
      webUrl: get(this, "$router.currentRoute.query.url", "#"),
      list: [],
    };
  }

  async loadReviews() {
    const id: string = get(this, "$router.currentRoute.query.id");
    getStorage("details", []).then((data: IScanResults[]) => {
      if (!data || !id || data.length === 0) return;
      log("all details", data);
      const item: IScanResults | undefined = find(data, (o: IScanResults) => o.id === id);
      if (item) {
        this.list = item.reviews;
      }
      log("list: ", this.list);
    });
  }
}
</script>

<style>
.comment-cell {
  overflow-x: hidden;
  word-break: break-word;
}
</style>
