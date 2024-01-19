<template lang="pug">
div
  .centered
    .centered.q-gutter-lg.no-wrap
      .col-auto
        .centered
          h6.no-margin Members
        .centered
          h4.no-margin {{team.members}}
      .col-auto
        .centered
          h6.no-margin Owner
        .centered
          h4.no-margin {{team.owner}}
      .col-auto
        .centered
          h6.no-margin Team Power
        .centered
          h4.no-margin {{team.power}}
      .col-auto
        .centered
          h6.no-margin Team Stake
        .centered
          h4.no-margin {{team.stake.self_staked}}
      .col-auto
        .centered
          h6.no-margin Tax Rate
        .centered
          h4.no-margin {{team.min_pwr_tax_mult.toNumber()/2 }}%
</template>

<script lang="ts">
import { Team } from "src/lib/types/boid.system"
import { defineComponent, PropType } from "vue"

export default defineComponent({
  props: {
    team: {
      type: Object as PropType<Team>,
      required: true
    }
  },
  data() {
    return {

    }
  }
})
</script>
