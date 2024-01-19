<template lang="pug">
q-page(padding)
  .centered.q-mb-md
    h3 Sponsor Dashboard
  .centered.q-gutter-md
  .centered
    .absolute-center(style="top:200px" v-if="!goldAcct").z-top
      h3(v-if="!acct.loggedIn") Login to continue
      h3(v-if="!goldAcct") Upgrade to Gold acount to enable Sponsorship
    .col-auto(:style="goldAcct?'':'filter:blur(6px)'")
      div(style="width:700px;max-width:90vw")
        div
          .centered.q-mt-sm.q-gutter-md
            q-card.q-pa-md(style="width:435px; max-width:90vw;")
              // div {{sponsorRow}}
              .centered.relative-position
                h5 Invites
                q-btn.absolute-right(icon="refresh" @click="loadSponsorData()")
              .centered
                .centered.q-gutter-md
                  .col-auto
                    .centered
                      h6.no-margin Invites Available
                    .centered
                      h2.no-margin {{ sponsorRow.invites_balance }}
                  .col-auto
                    .centered
                      h6.no-margin Invites Used
                    .centered
                      h2.no-margin {{ sponsorRow.invite_codes_claimed }}
                  q-separator.gt-xs(vertical)
                  .col-auto
                    .centered
                      h6.no-margin Purchase invites
                    .centered.q-ma-md
                      q-form(@submit="purchaseInvites()")
                        .row.no-wrap
                          q-input(v-model="purchaseInviteNum" type="number" input-style="font-size:25px; text-align:center" style="width:80px;")
                          q-btn(label="buy" type="submit")
              .centered.q-mt-md
                h5 Sponsored Upgrades
                small.text-weight-light Sponsors earn BOID when sponsored accounts pay to upgrade to a full account.
              .centered.q-gutter-md
                .col-auto
                  .centered
                    h6.no-margin Sponsored Accounts Upgraded
                  .centered
                    h2.no-margin {{ sponsorRow.sponsored_upgrades }}
                .col-auto
                  .centered
                    h6.no-margin BOID earned from Upgrades
                  .centered
                    h2.no-margin {{ sponsorRow.upgrades_total_earned }}
          .centered.q-mt-md
            q-card.q-pa-md(style="width:435px; max-width:90vw; ")
              .centered
                h5 Invite Codes {{invites.length}}/{{inviteCodesMax}}
                small.text-weight-light Invites are removed when they are used to create an account or they expire.
                small.text-weight-light Expired or deleted invite codes can be recreated until they are used.
              q-list.q-mt-lg
                q-card.q-mb-lg(v-for="invite of invites" style="border-radius: 8px;").bg-grey-1
                  .row.items-center.q-gutter-sm
                    .col-auto
                      q-btn(icon="close" color="red" @click="deleteLink(invite.invite_code)" flat)
                      q-tooltip
                        p delete link
                    .col-auto
                      .row
                        .col-auto
                          div(style="width:110px; overflow:auto")
                            h6 {{ invite.key }}
                        q-separator(vertical spaced)
                        .col-auto
                          q-btn( v-if="!invite.expired" label="copy link" icon="content_copy" @click="linkUrlToClipboard(invite.invite_code)")
                          q-btn( v-else label="EXPIRED" disable)
                      .row.items-center.q-mt-md
                        .col-auto(style="overflow: auto; width:206px;")
                          .row
                            small Created: {{ roundStartTime(invite.created_round).toLocaleDateString() + " "+roundStartTime(invite.created_round).toLocaleTimeString() }}
                          .row
                            small Expires: {{invite.expires.toLocaleDateString()}} {{ invite.expires.toLocaleTimeString() }}
                        .col-grow
                        .col-auto
                          div
                        .col
                      .q-mt-md
                      //- q-separator(spaced)
                q-card.q-mb-lg.bg-grey-1(v-if="addingLink")
                  .row.items-center.q-gutter-sm
                    .col-auto.q-mr-sm
                      q-skeleton(type="QBtn" width="50px")
                    .col-auto
                      .row
                        .col-auto
                          div(style="width:110px; overflow:auto")
                            q-skeleton(type="text" height="40px")
                        q-separator(vertical spaced)
                        .col-auto
                          q-skeleton(type="QBtn" width="120px" height="30px")
                      .row.items-center.q-mt-md
                        .col-auto(style="overflow: auto; width:206px;")
                          .row
                            q-skeleton(type="rect" width="140px" height="15px")
                          .row.q-mt-sm
                            q-skeleton(type="rect" width="140px" height="15px")
                        .col-grow
                        .col-auto
                          div
                        .col
                      .q-mt-md
                .centered
                  q-btn(label="New Invite Code" icon="add" @click="createNewInvite()" :disable="disableNewInvite")
                  q-tooltip(v-if="disableNewInvite")
                    p Purchase Invites first
          .q-mb-xl
</template>

<script lang="ts">
import { boidAccount } from "src/stores/boidAccount"
import { defineComponent } from "vue"
// import { useQuasar } from "quasar"
import { Dialog, Notify } from "quasar"
import { trpc } from "src/lib/trpc"
import { sendAuthActions, sysActions } from "src/lib/transact"

import { Invite, Sponsor } from "src/lib/types/boid.system"
import { blankSponsor, sysTables } from "src/stores/sysTables"
import { sysQueries } from "src/lib/queries"
import { generateNewInvite, keyFromInvite } from "src/lib/invites"
import { UInt64 } from "anchor-link"
import { roundStartTime } from "src/lib/util"
type InviteLink = (object & { _count:{ used:number } })

export default defineComponent({
  setup() {
    return { acct: boidAccount(), sys: sysTables(), roundStartTime }
  },
  data() {
    return {
      purchaseInviteNum: 1 as number | null,
      // invites: [] as InviteLink[],
      showDisabled: false,
      loading: false,
      addingLink: false
    }
  },
  mounted() {
    if (!this.sys.config) this.sys.loadConfig()
  },
  methods: {
    async loadSponsorData() {
      await this.loadSponsorRow()
      await this.loadInvites()
    },
    async deleteLink(id:UInt64) {
      if (!this.acct.loggedIn) return
      await sendAuthActions([sysActions.rmInvite(id)])
      this.loadInvites()
    },
    async linkUrlToClipboard(inviteCode:UInt64) {
      if (!this.acct.loggedIn) return
      const url = this.$route
      console.log(location.host)
      console.log(location.origin)

      const link = `${location.origin}/join?sponsor=${this.acct.loggedIn}&code=${inviteCode.toString()}&key=${(await keyFromInvite(inviteCode)).toString()}`
      await navigator.clipboard.writeText(link)
      Notify.create({ message: "Copied invite link to clipboard", icon: "check" })
    },
    purchaseInvites() {
      Dialog.create({
        message: `
        <p> confirm purchase ${this.purchaseInviteNum} invites? </p>
        <strong> Cost: ${this.purchaseCost} BOID </strong>
        <p> Will be deducted from your BOID balance </p>
        `,
        html: true,
        ok: "confirm",
        cancel: "cancel"

      }).onOk(async() => {
        if (!this.purchaseInviteNum) return
        const result = await sendAuthActions([sysActions.buyInvites(this.purchaseInviteNum)])
        console.log(result)
        //@ts-ignore
        if (result?.receipt) console.log(result.receipt.receipt)
        //@ts-ignore
        if (result?.success) console.log(result.success)

        await this.loadSponsorData()

        // alert("not implemented yet")
        // const result = await trpc.pushActions()
        // sendAuthActions(D)
      })
    },
    async loadInvites() {
      if (!this.acct.loggedIn) return
      await this.sys.loadInvites(this.acct.loggedIn)
    },
    async createNewInvite() {
      const loggedIn = this.acct.loggedIn
      if (!loggedIn) return
      try {
        this.addingLink = true
        const data = await generateNewInvite()
        console.log(data)
        const result = await sendAuthActions([sysActions.addInvite(data.code.toNumber(), data.key.toPublic())])
        console.log(result)
        this.addingLink = false
        this.loadSponsorData()
      } catch (error) {
        console.log(error)
      }
      this.addingLink = false
    },
    async loadSponsorRow() {
      if (this.acct.loggedIn) this.sys.loadSponsor(this.acct.loggedIn)
      if (this.acct.loggedIn) console.log(this.sys.sponsors[this.acct.loggedIn]?.toJSON())
    }
  },
  computed: {
    inviteCodesMax():number {
      const config = this.sys.config
      const confMax = config?.account.sponsor_max_invite_codes.toNumber() || 5
      return Math.min(this.sponsorRow.invites_balance.toNumber(), confMax)
    },
    goldAcct():boolean {
      if (!this.acct.loggedIn) return false
      const acct = this.sys.accounts[this.acct.loggedIn]
      if (!acct) return false
      return acct.sponsors.length == 0
    },
    disableNewInvite():boolean {
      return this.sponsorRow.invites_balance.toNumber() == 0
    },
    codesAvailable():number {
      return this.sponsorRow.invites_balance.toNumber() - this.invites.length
    },
    invites():Array<Invite & {expired:boolean, expires:Date}> {
      if (!this.acct.loggedIn) return []
      const invites = this.sys.invites[this.acct.loggedIn]
      if (!invites) return []
      const modified:any = []
      let expiresRounds = 3
      let roundLengthSec = 3600
      let roundsStartedMs = 923848
      if (this.sys.config) {
        expiresRounds = this.sys.config.account.invite_code_expire_rounds.toNumber()
        roundLengthSec = this.sys.config.time.round_length_sec.toNumber()
        roundsStartedMs = this.sys.config.time.rounds_start_sec_since_epoch.toNumber() * 1000
      }
      invites.forEach(el => {
        const expires = new Date((roundsStartedMs + (el.created_round.toNumber() * roundLengthSec * 1000) + ((expiresRounds * roundLengthSec) * 1000)))
        const expired = Date.now() > expires.getTime()
        modified.push(Object.assign(el, { expired, expires }))
      })
      return modified.reverse()
    },
    expiredInvites():Invite[] {
      return []
    },
    sponsorRow():Sponsor {
      if (!this.acct.loggedIn) return blankSponsor
      return this.sys.sponsors[this.acct.loggedIn] || blankSponsor
    },
    purchaseCost():number {
      if (this.purchaseInviteNum) return this.purchaseInviteNum * 10000
      else return 0
    }
  },
  watch: {
    // "acct.loggedIn"() {
    //   this.loadInvites()
    //   this.loadSponsorRow()
    // }
    "acct.loggedIn": {
      immediate: true,
      handler(val) {
        this.loadSponsorData()
      }
    }
  }
})
</script>
