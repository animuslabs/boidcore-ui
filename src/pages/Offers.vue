<template lang="pug">
q-page(padding)
  div(v-if="!targetOffer").q-mt-lg
    .centered
      q-card.q-pa-md(style="max-width:90vw;").full-width
        .centered
          h3 Offers
        q-list( padding)
          offer-row(v-for="offer of offers" :offer="offer" :key="offer.offer_id.toNumber()").q-mt-sm.q-mb-sm
        //- q-markup-table(flat).q-mt-md
        //-   thead
        //-     tr
        //-       th ID
        //-       th Claimed
        //-       th Actions
        //-       th Limits
        //-       th Requirements
        //-       th Rewards
        //-   tbody
        //-     tr(v-for="offer of offers" @click="$router.push({name:'offer',params:{id:offer.offer_id.toString()}})").cursor-pointer.non-selectable
        //-       td.text-center {{offer.offer_id}}
        //-       td.text-center {{offer.total_claimed}}
        //-       td
        //-         pre {{JSON.stringify(offer.actions,null,2)}}
        //-       td
        //-         pre {{JSON.stringify(offer.limits,null,2)}}
        //-       td
        //-         pre {{JSON.stringify(offer.requirements,null,2)}}
        //-       td
        //-         pre {{JSON.stringify(offer.rewards,null,2)}}
  div(v-else)
    .centered
      q-card.q-pa-md(style="max-width:90vw;").full-width
        .centered
          h3 Offer: {{targetOffer.offer_id}}
</template>

<script lang="ts">
import { QPage, QCard } from "quasar"
import OfferRow from "src/components/OfferRow.vue"
import { Offer } from "src/lib/types/boid.system"
import { sysTables } from "src/stores/sysTables"
import { defineComponent } from "vue"

export default defineComponent({
  data() {
    return {}
  },
  async mounted() {
    if (this.queryOfferId) { await sysTables().loadOffer(this.queryOfferId) } else { await sysTables().loadOffers() }
    sysTables().loadOffers()
  },
  computed: {
    targetOffer():Offer | null {
      if (!this.queryOfferId) { return null }
      let exists = sysTables().offers[this.queryOfferId.toString()]
      return exists || null
    },
    queryOfferId():number | null {
      const booster = this.$route.params.id
      if (typeof booster != "string") { return null } else { return parseInt(booster) }
    },
    offers():Offer[] {
      return Object.values(sysTables().offers)
    }
  },
  watch: {
    queryOfferId(val) {
      if (!val) { sysTables().loadOffers() }
    }
  },
  components: { OfferRow }
})
</script>
