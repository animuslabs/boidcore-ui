<template lang="pug">
q-page(padding)
  .div(v-if="!targetMod").q-mt-lg
    .centered
      q-card.q-pa-md(style="width:640px; max-width:90vw;")
        .centered
          h3 Boosters
        q-markup-table.q-mt-md( flat dense ).full-width
          thead
            tr
              th Booster ID
              th Power Multiplier
              th Power Add (per round)
              th expires after rounds
              th aggregate power capacity
          tbody
            tr(v-for="booster of boosters" :key="booster.booster_id.value" @click="$router.push({name:'booster',params:{id:booster.booster_id.toString()}})" ).cursor-pointer.non-selectable
              td.text-center
                h5.text-subtitle2 {{booster.booster_id}}
              td.text-center
                h5.text-subtitle2 {{booster.pwr_multiplier}}
              td.text-center
                h5.text-subtitle2 {{booster.pwr_add_per_round}}
              td.text-center
                h5.text-subtitle2 {{booster.expire_after_elapsed_rounds}}
              td.text-center
                h5.text-subtitle2 {{booster.aggregate_pwr_capacity}}
  div(v-else).q-pt-lg
    .centered
      q-card.q-pa-md(style="width:935px; max-width:90vw;")
        .centered.q-pb-md
          h3 Power Mod: {{targetMod.booster_id}}
        .centered.q-mb-md.q-gutter-sm
          .col-auto
            .centered
              h6.no-margin Aggregate Capacity
            .centered
              h5.no-margin {{targetMod.aggregate_pwr_capacity}}
          .col-auto
            .centered
              h6.no-margin Expires after
            .centered
              h5.no-margin {{targetMod.expire_after_elapsed_rounds}} rounds
          .col-auto
            .centered
              h6.no-margin Pwr Multiplier
            .centered
              h5.no-margin {{targetMod.pwr_multiplier.toNumber() /2}} %
          .col-auto
            .centered
              h6.no-margin Power Add (per round)
            .centered
              h5.no-margin {{targetMod.pwr_add_per_round}}
        //- div {{targetMod}}
        div.q-mt-lg
          h5 Booster Offers
          div Claim an offer below to activate this Power Mod
          //- div {{targetOffers}}
          q-toggle(v-model="filterActive" label="Show Active Only" color="primary")
          q-list
            div(v-for="offer of targetOffers")
              offer-row.q-ma-md(:offer="offer")
</template>

<script lang="ts">
import { Offer, Booster } from "src/lib/types/boid.system"
import { sysTables } from "src/stores/sysTables"
import { defineComponent } from "vue"
import OfferRow from "src/components/OfferRow.vue"
import { currentRound } from "src/lib/util"

export default defineComponent({
  components: { OfferRow },
  setup() {},
  data() {
    return {
      currentRound: currentRound(),
      filterActive: true
    }
  },
  async mounted() {
    console.log(this.$router.currentRoute)

    if (this.queryBoosterId) await sysTables().loadBooster(this.queryBoosterId)
    else await sysTables().loadBoosters()
    await sysTables().loadOffers()
  },
  computed: {
    queryBoosterId():number|null {
      const booster = this.$route.params.id
      if (typeof booster != "string") return null
      else return parseInt(booster)
    },
    targetMod():Booster | null {
      if (!this.queryBoosterId) return null
      let exists = sysTables().boosters[this.queryBoosterId.toString()]
      return exists || null
    },
    targetOffers():Offer[] {
      if (!this.targetMod) return []
      const boosterId = this.targetMod.booster_id.toNumber()
      const allOffers = Object.values(sysTables().offers)
      if (this.filterActive) {
        return allOffers.filter(offer =>
          offer.rewards.activate_booster_ids.array.includes(boosterId) &&
        offer.limits.available_until_round.toNumber() >= this.currentRound &&
        offer.limits.offer_quantity_remaining.toNumber() > 0
        )
      }
      return allOffers.filter(offer =>
        offer.rewards.activate_booster_ids.array.includes(boosterId)
      )
    },
    boosters():Booster[] {
      return Object.values(sysTables().boosters)
    }
  },
  watch: {
    queryBoosterId(val) {
      if (!val) sysTables().loadBoosters()
    }
  }
})
</script>
