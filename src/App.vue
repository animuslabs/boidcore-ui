<template>
  <router-view />
</template>

<script lang="ts">
import { boidAccount } from "src/stores/boidAccount"
import { sysTables } from "src/stores/sysTables"
import { defineComponent } from "vue"
import * as link from "src/lib/linkManager"
import config from "src/lib/config"

export default defineComponent({
  name: "App",
  setup() {
    return { acct: boidAccount(), sys: sysTables() }
  },
  async mounted() {
    if (config.desktopMode) this.$router.replace({ name: "desktopHome" })
    // link.init() // already initialized in stores index
    this.acct.restoreLogin()
    this.sys.restoreData()
    this.sys.loadGlobal()
  }
})
</script>
