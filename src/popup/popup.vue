<template>
  <div class="container mx-auto p-4 centered">
    <t-table :headers="['Name', 'Issues', 'Reviews', 'Commands']" :data="details">
      <template v-slot:row="props">
        <tr :class="[props.trClass, props.rowIndex % 2 === 0 ? 'bg-gray-100' : '']">
          <td :class="props.tdClass">
            {{ props.row.name }}
          </td>
          <td :class="props.tdClass">
            {{ props.row.issues.length }}
          </td>
          <td :class="props.tdClass">
            {{ props.row.reviews.length }}
          </td>
          <td :class="props.tdClass">
            <a href="#">Clear</a>
          </td>
        </tr>
      </template>
    </t-table>
  </div>
</template>

<script>
import Vue from "vue";
import Extension from "./extension.vue";
import { getStorage } from "../background";
import { IScanResults } from "../types";

const log = require("debug")("mbfc:popup");

export default {
  data() {
    getStorage("details").then(data => {
      log(data);
      this.details = data;
    });
    return {
      details: [],
    };
  },
  components: {
    extension: Extension,
  },
};
</script>

<style scoped>
.centered {
  text-align: center;
}
</style>
