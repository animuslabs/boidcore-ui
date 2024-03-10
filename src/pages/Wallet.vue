<template lang="pug">
q-page
  .centered.q-mt-md.q-mb-md
    h3 Wallet
  div(v-if="!acct.loggedIn")
    .centered
      h4 Login to continue
  div(v-if="walletData")
    .centered.q-gutter-md
      .col-auto
        .centered.q-mb-md
          q-card.q-pa-md(style="width:435px; max-width:90vw;")
            .centered.relative-position
              //- h5 Transfer
              q-btn.absolute-right(icon="refresh" @click="loadWallet()")
            div(v-if="walletData")
              .centered
                .centered.q-gutter-md
                  .col-auto
                    .centered
                      h6.no-margin Liquid Balance
                    .centered
                      h4.no-margin {{walletData.acct.balance.toNumber().toLocaleString()}} BOID
              div
                div.q-pa-sm.text-weight-light.bg-grey-2 To receive funds, send BOID tokens to the "boid" contract account with the memo "deposit boid_id={{walletData.acct.boid_id}}"
            q-separator(spaced)
            .centered.q-mt-md
              h5 Withdraw
            .centered
              div.text-weight-light send to an external Telos account
            .centered.q-gutter-md.items-center
              .col-auto
                .row
                  h6 Quantity
                .row
                  q-input(v-model.number="withdrawQuantity" type="number" :error="withdrawQuantity > walletData.acct.balance.toNumber()"  :errorMessage="'invalid quantity'" )
              .col-auto
                .row
                  h6 To
                .row
                  q-input(v-model="withdrawTo" :error="!validName(withdrawTo)" :errorMessage="'invalid name'" hint="Telos Account")
            .centered.q-mt-md
              q-btn(label="withdraw" @click="withdraw()" color="primary")
            q-separator(spaced)
            .centered.q-mt-md
              h5 Internal Transfer
            .centered
              div.text-weight-light Send to another Boid ID
            .centered.q-gutter-md.items-center
              .col-auto
                .row
                  h6 Quantity
                .row
                  q-input(v-model.number="xferQuantity" type="number" :error="xferQuantity > walletData.acct.balance.toNumber()"  :errorMessage="'invalid quantity'" )
              .col-auto
                .row
                  h6 To
                .row
                  q-input(v-model="xferTo" :error="!validName(xferTo)" :errorMessage="'invalid name'" hint="Boid ID")
            .centered.q-mt-md
              q-btn(label="transfer" @click="xfer()" color="primary")
            .row
      .col-auto
        .centered.q-gutter-md
          q-card.q-pa-md(style="width:435px; max-width:90vw;")
            .centered.relative-position
              h5 Stake
              q-btn.absolute-right(icon="refresh" @click="loadWallet()")
            .centered(v-if="walletData").q-pa-sm
              .centered
                .centered.q-gutter-md
                  .col-auto
                    .centered
                      h6.no-margin Self Staked
                    .centered
                      h4.no-margin {{walletData.acct.stake.self_staked.toNumber().toLocaleString()}} BOID
                  .col-auto
                    .centered
                      h6.no-margin Receiving Delegated Stake
                    .centered
                      h4.no-margin {{(walletData.acct.stake.received_delegated_stake.toNumber()*10000).toLocaleString()}} BOID
            div(v-if="unstaking").q-pa-sm
              .centered
                h6.no-margin Unstaking
              .centered.q-gutter-md
                .col-auto
                  .row
                    div quantity
                  .row
                    h5.no-margin {{unstaking?.quantity || 0}}
                .col-auto
                  .row
                    div redeemable
                  .row
                    div.no-margin {{roundStartTime(unstaking.redeemable_after_round.toNumber() + 1).toLocaleDateString() }}
                  .row
                    div.no-margin {{roundStartTime(unstaking.redeemable_after_round.toNumber() + 1).toLocaleTimeString() }}
                .col-auto
                  q-btn(icon="close" color="red" flat label="cancel" :disable="unstakeRedeemable" @click="cancelUnstake()")
                  q-separator
                  q-btn(icon="check" color="green" flat label="redeem" :disable="!unstakeRedeemable" @click="redeemUnstake()")
                    q-tooltip(v-if="!unstakeRedeemable")
                      p "not redeemable yet"
            q-separator.q-mt-lg
            q-tabs(v-model='stakeTab').q-mb-md
              q-tab(name='self' label="self stake" )
              q-tab(name='delegated' label="delegated stake")
            div(v-if="stakeTab == 'self'")
              //- .centered
              //-   h5 Stake to Self
              .centered.q-gutter-lg.items-center.q-pb-lg
                .col-auto
                  //- .row
                  //-   h5 Quantity
                  .row.q-gutter-md
                    .col-auto
                      q-input(v-model.number="selfStakeQuantity" type="number"  inputStyle="font-size:16px; text-align:right" suffix="BOID" style="width:150px" :error="selfStakeQuantity > walletData?.acct.balance.toNumber() || selfStakeQuantity<0" :errorMessage="'invalid quantity'" noErrorIcon :hideBottomSpace="false")
                  .centered.q-mt-md
                    q-btn(label="stake" @click="stakeSelf()" :flat="false" color="primary" :disable="selfStakeQuantity<=0" icon="add")
                q-separator(vertical)
                .col-auto
                  //- .row
                  //-   h5 Quantity
                  .row.q-gutter-md
                    .col-auto
                      q-input(v-model.number="selfUnstakeQuantity" type="number"  inputStyle="font-size:16px; text-align:right" suffix="BOID" style="width:150px" :error="selfUnstakeQuantity > walletData.acct.stake.self_staked.toNumber() || selfUnstakeQuantity<0" :errorMessage="'invalid quantity'" noErrorIcon :hideBottomSpace="false")
                  .centered.q-mt-md
                    q-btn(label="unstake" @click="unstakeSelf()" :flat="false" color="primary" :disable="selfUnstakeQuantity<=0" icon="remove")
            div(v-if="stakeTab == 'delegated'")
              .centered
                .centered.q-gutter-lg.q-pb-lg
                  .col-auto
                    .row
                      h5 Delegate To
                    .row.q-mb-md
                      q-input(v-model="delegateToName"  inputStyle="font-size:16px;" hint="boid_id" style="width:130px" :error="!validName(delegateToName)" noErrorIcon :errorMessage="'invalid boid id'" )
                    .row
                      h5 Quantity
                    .row.q-gutter-md
                      .col-auto
                        q-input(v-model.number="delegatedQuantity" type="number"  inputStyle="font-size:16px; text-align:right" suffix="10K-BOID" style="width:130px" :hint="(delegatedQuantity* 10000).toString()" )
                  .col-auto
                    .row
                      h5.text-capitalize lock Rounds
                    .row.q-gutter-md
                      .col-auto
                        q-input(v-model.number="delegatedLockRounds" type="number"  inputStyle="font-size:16px; text-align:right" suffix="Rounds" style="width:130px" :error="delegatedLockRounds < minimumLockRounds",:errorMessage="'lock rounds must be above the minimum: '+minimumLockRounds" )
                    .col-grow.relative-position
                      //- .absolute-center hi
                      div.q-mt-lg
                        .row
                          div Unstakable After:
                        .row.q-mb-sm
                          div {{stakeLockedTill}}
                        q-btn(label="delegate stake" @click="delegateStake()" :flat="false" color="primary" :disable="!validDedicatedStake")
            q-separator(spaced)
            .centered
              h5 Delegated Stakes
            div(v-if="walletData?.stakes && walletData.stakes.length > 0")
              .centered
                div.q-mt-sm Total: {{delegatedQuantityTotal.toLocaleString()}} BOID
              q-markup-table.q-mt-md( flat dense).full-width
                thead
                  tr
                    th End
                    th To
                    th Quantity
                    th Locked Until
                tbody
                  tr(v-for="stake of walletData.stakes" :key="stake.stake_id.toNumber()")
                    td
                      q-btn( @click="endStake(stake.stake_id)" icon="close" color="red" flat round size="sm" :disable="stakeLocked(stake)" )
                    td {{stake.to_boid_id}}
                    td {{(stake.stake_quantity.toNumber() * 10000).toLocaleString()}} BOID
                    td {{roundStartTime(stake.locked_until_round).toLocaleString()}}
            div(v-else)
              .text-weight-light.q-pa-md.bg-grey-2.full-width
                .centered No delegated stakes
          .centered
    div(style="height:100px;")
</template>

<script lang="ts">
import { UInt64 } from "anchor-link"
import { doActions, sendAuthActions, sysActions } from "src/lib/transact"
import { Account, DelegStake, Stake, StakeDeleg, Thisround, TokenUnstake } from "src/lib/types/boid.system"
import { validName, currentRound, roundStartTime, dateNow } from "src/lib/util"
import { boidAccount } from "src/stores/boidAccount"
import { sysTables } from "src/stores/sysTables"
import { defineComponent } from "vue"
import { linkAccount } from "src/stores/linkAccount"

export default defineComponent({
  setup() {
    return { acct: boidAccount(), sysTables: sysTables(), validName, currentRound, roundStartTime, dateNow, linkAccount: linkAccount() }
  },
  data() {
    return {
      stakeTab: "self",
      selfStakeQuantity: 0,
      delegateToName: "",
      delegatedLockRounds: 0,
      delegatedQuantity: 0,
      minimumLockRounds: 10,
      selfUnstakeQuantity: 0,
      withdrawQuantity: 0,
      withdrawTo: "",
      xferTo: "",
      xferQuantity: 0
    }
  },
  async mounted() {
    if (!this.sysTables.config) await this.sysTables.loadConfig()
    this.minimumLockRounds = ((this.sysTables.config?.stake.extra_stake_min_locked_rounds.toNumber()) || 0) + 1
    this.delegatedLockRounds = this.minimumLockRounds
  },
  methods: {
    async xfer() {
      if (!this.linkAccount.loggedIn) await this.linkAccount.login()
      const result = await doActions([sysActions.internalxfer(this.xferQuantity, this.xferTo)])
      console.log(result)
      this.loadWallet()
    },
    async withdraw() {
      if (!this.linkAccount.loggedIn) await this.linkAccount.login()
      const result = await doActions([sysActions.withdraw(this.withdrawQuantity, this.withdrawTo)])
      console.log(result)
      this.loadWallet()
    },
    async cancelUnstake() {
      await sendAuthActions([sysActions.stopUnstake()])
      this.loadWallet()
    },
    async redeemUnstake() {
      await sendAuthActions([sysActions.endUnstake()])
      this.loadWallet()
    },
    stakeLocked(stake:DelegStake):boolean {
      // console.log("stake locked method run")

      return roundStartTime(stake.locked_until_round.toNumber()).getTime() > this.dateNow
    },
    async unstakeSelf() {
      const result = await sendAuthActions([sysActions.unstakeInit(this.selfUnstakeQuantity)])
      console.log(result)
      this.loadWallet()
    },
    async endStake(stake_id:UInt64|number) {
      const result = await sendAuthActions([sysActions.endDelegStake(stake_id)])
      console.log(result)
      this.loadWallet()
    },
    loadWallet() {
      if (!this.acct.loggedIn) return
      this.sysTables.loadAccount(this.acct.loggedIn)
      this.sysTables.loadStakes(this.acct.loggedIn)
    },
    async stakeSelf() {
      const result = await sendAuthActions([sysActions.stake(this.selfStakeQuantity)])
      console.log(result)
      this.loadWallet()
      this.selfStakeQuantity = 0
    },
    async delegateStake() {
      const result = await sendAuthActions([sysActions.delegateStake(this.delegatedQuantity, this.delegateToName, currentRound() + this.delegatedLockRounds)])
      console.log(result)
      this.loadWallet()
      // this.delegateToName = ""
      this.delegatedQuantity = 0
      this.delegatedLockRounds = this.minimumLockRounds
    }
  },
  computed: {
    unstakeRedeemable():boolean {
      if (!this.walletData) return false
      const unstaking = this.walletData.acct.stake.unstaking[0]
      if (!unstaking) return false
      return roundStartTime(unstaking.redeemable_after_round.toNumber() + 1).getTime() < this.dateNow
    },
    delegatedQuantityTotal():number {
      if (!this.walletData) return 0
      return this.walletData.stakes.reduce((agg, el) => agg + el.stake_quantity.toNumber() * 10000, 0)
    },
    validDedicatedStake():boolean {
      return this.delegatedQuantity > 0 &&
        this.delegatedLockRounds >= this.minimumLockRounds &&
        validName(this.delegateToName)
    },
    stakeLockedTill():string {
      const targetRound = currentRound() + this.delegatedLockRounds
      const time = roundStartTime(targetRound)
      return time.toLocaleString()
    },
    unstaking():null|TokenUnstake {
      if (!this.walletData) return null
      const unstake = this.walletData.acct.stake.unstaking[0]
      if (!unstake) return null
      return unstake
    },
    walletData():{ acct:Account, stakes:DelegStake[] } | null {
      if (!this.acct.loggedIn) return null
      const acct = this.sysTables.accounts[this.acct.loggedIn]
      if (!acct) return null
      let stakes = this.sysTables.stakes[this.acct.loggedIn]
      if (!stakes) stakes = []
      return { acct, stakes }
    }
  },
  watch: {
    "acct.loggedIn": {
      immediate: true,
      handler(val) {
        if (val) this.loadWallet()
      }
    }
  }
})
</script>
