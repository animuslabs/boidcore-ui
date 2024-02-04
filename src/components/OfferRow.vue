<template lang="pug">
q-item.bg-grey-2.rounded-borders
  div.q-mb-md.q-mt-sm.full-width
    .row.full-width
      .col-auto
        h5 Offer {{offer.offer_id}}
    .row.q-gutter-md
      .col-auto
        h6(v-if="parsedOffer.requirements") Requirements
      .col-auto
        h6(v-if="parsedOffer.actions") Required Actions
        div(v-if="act.balance_payment.toNumber()> 0")
          div Pay: {{act.balance_payment.toNumber().toLocaleString()}} BOID
      .col-auto(v-if="act.nft_actions.length>0")
        h6 NFT Actions
        div(v-for="(action,i) in act.nft_actions")
          div Required NFT Template: #[a(:href="`https://telos.neftyblocks.com/templates/nft.boid/${action.template_id.toString()}`" target="_blank" ) {{action.template_id}}]
            q-tooltip
              p The NFT Template you need to deposit
          div Lock Rounds: {{action.lock_rounds}}
            q-tooltip
              p How many rounds in the future the NFT will be locked for when this offer is triggered
      .col-auto
        h6 Rewards
        div(v-if="rwrd.activate_booster_ids.length>0")
          div(v-for="boosterId of rwrd.activate_booster_ids") Activates Booster: #[a(href="" @click.prevent="null" @click="$router.push({name:'booster',params:{id:boosterId.toString()}})") {{boosterId}}]
      .col-grow
      .col-auto
        div Quantity Remaining: {{offer.limits.offer_quantity_remaining.toNumber().toLocaleString()}}
        div Expires Round: {{offer.limits.available_until_round.toNumber().toLocaleString()}}
        div Total Claimed: {{offer.total_claimed.toNumber().toLocaleString()}}
        //- div {{offer.limits}}
        //- div {{currentRound()}}
      .col-auto.items-center
        q-btn(label="claim" :disable="parsedOffer.disabled" @click="claimOffer()" outline)

</template>

<script lang="ts">
import { UInt64 } from "anchor-link"
import { Dialog } from "quasar"
import { sendAuthActions, sysActions } from "src/lib/transact"
import { Offer, OfferAction, OfferRequirements, OfferRewards } from "src/lib/types/boid.system"
import { currentRound } from "src/lib/util"
import { boidAccount } from "src/stores/boidAccount"
import { sysTables } from "src/stores/sysTables"
import { defineComponent, PropType } from "vue"

export default defineComponent({
  props: {
    offer: {
      required: true,
      type: Object as PropType<Offer>
    }
  },
  data() {
    return {
      round: 0,
      currentRound,
      targetAssetId: ""
    }
  },
  async mounted() {
    sysTables().loadConfig()
  },
  methods: {
    claimOffer() {
      Dialog.create({
        message: `
        <div>Are you sure you want to claim this Offer?</div>
        </br>
        <h5>Actions:</h5>
        <pre>${JSON.stringify(this.offer.actions, null, 2)}</pre>
        <h5>NFT ID if required:</h5>
        `,
        html: true,
        ok: { label: "Claim" },
        cancel: true,
        prompt: {
          model: this.targetAssetId
        }
      }).onOk(async(nftId) => {
        console.log("nft given:", nftId, "from:", typeof nftId)
        const acct = boidAccount().loggedIn
        if (!acct) return alert("login to claim offer")
        await sysTables().loadAccount(acct)
        const acctRow = sysTables().accounts[acct]
        if (!acctRow) return
        let actions = [sysActions.claimOffer(this.offer.offer_id, nftId.length > 0 ? [nftId] : [])]
        console.log("last claimed:", acctRow.power.last_claimed_round.toNumber())
        console.log("current round:", currentRound())
        if (acctRow.power.last_claimed_round.toNumber() != currentRound()) await sendAuthActions([sysActions.pwrClaim()])
        await sendAuthActions(actions)
      })
    }
  },
  computed: {
    rwrd():OfferRewards {
      return this.offer.rewards
    },
    req():OfferRequirements {
      return this.offer.requirements
    },
    act():OfferAction {
      return this.offer.actions
    },
    parsedOffer():{ requirements:boolean, actions:boolean, disabled:boolean } {
      const req = this.offer.requirements
      const act = this.offer.actions
      const limits = this.offer.limits
      let parsed = {
        requirements: req.min_balance.toNumber() > 0 ||
                      req.min_cumulative_team_contribution.toNumber() > 0 ||
                      req.min_power.toNumber() > 0 ||
                      req.min_stake.toNumber() > 0 ||
                      req.team_id.length > 0,
        actions: act.balance_payment.toNumber() > 0 ||
                 act.delegated_stake.toNumber() > 0 ||
                 act.nft_actions.length > 0,
        disabled: limits.available_until_round.toNumber() < currentRound() ||
                  limits.offer_quantity_remaining.toNumber() == 0

      }
      return parsed
    }
  }
})
</script>
