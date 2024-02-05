<template lang="pug">
q-card.q-ma-md.q-pa-md
  .centered
    h5 Booster
  h6.no-margin.text-weight-light Power Remaining
  h5 {{ booster.aggregate_pwr_remaining }}
  div(v-if="booster.pwr_add_per_round.toNumber()>0")
    h6.no-margin.text-weight-light Adding Power Daily
    h5 +{{ (roundsToDays(1) * booster.pwr_add_per_round.toNumber()).toFixed(0) }}
  div(v-if="booster.pwr_multiplier.toNumber()>0")
    h6.no-margin.text-weight-light Boosting Power Generated
    h5 +{{ booster.pwr_multiplier.toNumber()/2 }} %
  h6.no-margin.text-weight-light Expires
  h5 {{ roundStartTime(booster.expires_round).toLocaleDateString() }}
    q-tooltip
      p {{ roundStartTime(booster.expires_round).toLocaleString() }}

</template>
<script setup lang="ts">
import { AccountBooster } from "src/lib/types/boid.system"
import { roundStartTime, roundsToDays } from "src/lib/util"
const props = defineProps<{
  booster:AccountBooster
}>()

</script>
