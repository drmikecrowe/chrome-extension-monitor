<template>
  <div>

  </div>
</template>

<script lang="ts">
import debug from "debug";
const log = debug("mbfc:extension");

import { Component, Prop, Vue } from "vue-property-decorator";
import { IScanResults } from "@/types";

@Component
export default class HelloWorld extends Vue {
  // The props are defined here with the annotation @Prop()
  @Prop()
  private scan!: IScanResults;

  data() {
    return {
      title: this.scan.name,
    };
  }
}
</script>
