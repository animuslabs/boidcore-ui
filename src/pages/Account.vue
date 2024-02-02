<template lang="pug">
q-page(padding)
  .centered.q-mt-md.items-center
    div(style="width:60px")
    h3 Accounts
    q-btn(icon="person_search" @click="$router.push({name:'account'})" :disable="!targetAcct").q-ml-md
      q-tooltip
        p Account Search
  q-separator(spaced)
  .centered
    div(style="width:700px;max-width:90vw")
      div(v-if="!targetAcct")
        .centered(v-if="acct.loggedIn")
          q-btn(label="view my account" @click="$router.push({name:'account',params:{name:acct.loggedIn}})" icon-right="search")
        .centered
          h5 Or
        .centered
          h5 Search for account by Boid ID
        q-form(@submit="searchAcct()")
          .centered
            q-input(v-model="acctSearchInput" placeholder="Boid ID" ref="searchInput" :error="searchError" noErrorIcon)
          .centered
            q-btn(label="search" type="submit" :loading="searchLoading")
      div(v-else)
        .centered
          //- h2 {{targetAcct}}
          //- p {{meta}}
          .centered.items-center.q-gutter-md
            .col-auto
              q-img(:src="ipfsUrl(meta.media.profile)" width="200px" )
            .col-auto
              h2.no-margin {{targetAcct}}
              p.q-ma-sm {{meta.text.info}}
              .row.items-center
                p.text-weight-light.q-ma-sm EOS Account:
                p {{meta.text.eosAccount}}
              .row.items-center
                p.text-weight-light.q-ma-sm Telos Account:
                p {{meta.text.telosAccount}}
        q-separator(spaced="lg")
        .centered(v-if="targetRow")
          .row.q-gutter-md
            q-card.q-pa-md
              .centered
                h5 Auth
              q-separator
              div(style="max-width:100px; overflow: auto;")
                .row
                  h6.no-margin Keys
                .row
                  div {{targetRow.auth.keys}}
                .row
                  h6.no-margin Nonce
                .row
                  div {{targetRow.auth.nonce}}
              q-separator(spaced v-if="ownAcct")
              .centered
                q-btn(label="add acct key" color="secondary" outline @click="addAcctKey()").q-ma-sm
            q-card.q-pa-md
              .centered
                h5 Power
              q-separator
              .row
                h6.no-margin Rating
              .row
                div {{targetRow.power.rating}}
              .row
                h6.no-margin Last Claimed Round
              .row
                div {{targetRow.power.last_claimed_round}}
              .row
                h6.no-margin Boosters
              .row
                div {{targetRow.power.boosters}}
            q-card.q-pa-md
              .centered
                h5 Stake
              q-separator
              .row
                h6.no-margin Self Staked
              .row
                div {{targetRow.stake.self_staked}}
              .row
                h6.no-margin Received Stake
              .row
                div {{targetRow.stake.received_delegated_stake.toNumber() * 10000}}
              .row
                h6.no-margin Unstaking
              .row
                div {{targetRow.stake.unstaking}}
              q-separator(spaced)
              q-btn(label="wallet" @click="$router.push({name:'wallet'})")

            q-card.q-pa-md
              .centered
                h5 Team
              q-separator
              .row
                h6.no-margin Team Id
              .row
                div {{targetRow.team.team_id}}
              .row
                h6.no-margin last edit round
              .row
                div {{targetRow.team.last_edit_round}}
              .row
                h6.no-margin Contribution
              .row
                div {{targetRow.team.team_cumulative_contribution}}
              .row
                h6.no-margin Tax Rate
              .row
                div {{targetRow.team.team_tax_mult}}
            q-card.q-pa-md
              .centered
                h5 Other
              q-separator
              .row
                h6.no-margin Balance
              .row
                div {{targetRow.balance}}
              .row
                h6.no-margin Owners
              .row
                div {{targetRow.owners}}
              .row
                q-btn(label="add Owner" @click="addOwner()" outline).q-mt-sm
              .row
                h6.no-margin Sponsors
              .row
                div {{targetRow.sponsors}}
              q-separator(spaced v-if=" ownAcct &&targetRow.sponsors.length > 0")
              .centered(v-if=" ownAcct &&targetRow.sponsors.length > 0")
                q-btn(label="remove sponsor" :flat="false" outline color="secondary" @click="removeSponsor()").q-ma-sm
            q-card.q-pa-md
              .centered
                h5 Social
              q-separator
              div(style="max-width:200px; overflow: auto;")
                .row
                  h6.no-margin Account Metadata
                .row
                  pre {{targetMeta}}
              q-separator(spaced)
              q-btn(label="update account info" @click="updateAccountInfo()" color="secondary" outline  ).q-ma-sm
            q-card.q-pa-md
              .centered
                h5 Sponsor
              q-separator
              div(style="max-width:200px; overflow: auto;")
                .row
                  h6.no-margin Sponsor Data
                .row
                  div {{ targetSponsor }}
              //-   .row
              //-     div TODO will be pulled from history
              //-     //- div {{targetRow.social_ipfs_json}}
              //- q-separator(spaced)
              //- q-form(v-if="ownAcct" @submit="updateIpfs()")
              //-   q-input(v-model="ipfsJsonInput" placeholder="JSON string")
              //-   .centered
              //-     q-btn(label="update ipfs json" type="submit" color="secondary" outline  ).q-ma-sm
              q-btn(label="invites" type="a" href="/sponsor")
  q-separator(spaced="lg")
  .centered.q-mb-sm
    h4 Activity
    q-btn(icon="refresh" @click="loadHistoryFeed(1)")
  .centered
  q-markup-table(flat)
    thead
      th Time
      th Action
      th Parameters
    tbody
      tr(v-for="(action,index) of historyFeed").non-selectable
        td.text-center {{action.timeStamp}}
        td.text-center {{ action.actName }}
        td
          pre {{action}}
      //- td.text-center {{index+1}}
      //- td.text-center {{member.boid_id}}
      //- td.text-center {{member.stake.self_staked.toNumber().toLocaleString()}} BOID
      //- td.text-center {{member.power.rating}}

</template>

<script lang="ts">
import { Dialog, QInput } from "quasar"
import { getIpfs, ipfsCache, jsonToCID, ipfsUrl } from "src/lib/ipfs"
import { sysQueries } from "src/lib/queries"
import { Account, AccountEdit, AccountTeam, Sponsor } from "src/lib/types/boid.system"
import { sysTables } from "src/stores/sysTables"
import { defineComponent } from "vue"
import { sendAuthActions, sysActions, doActions } from "src/lib/transact"
import { boidAccount } from "src/stores/boidAccount"
import { link } from "src/lib/linkManager"
import AddKey from "src/components/dialog/AddKey.vue"
import { linkAccount } from "src/stores/linkAccount"
import EditAccountInfo from "src/components/dialog/EditAccountInfo.vue"
import ax from "axios"
import { NameType } from "anchor-link"
import { CID } from "multiformats/cid"
import { parseAccountMeta, ParsedAccountMeta } from "src/lib/account"
import { AccountMeta } from "src/lib/types/types"
import { accountFeed } from "src/lib/history"
import { bytesToJson, sleep } from "src/lib/util"
import AddOwner from "src/components/dialog/addOwner.vue"
import { string } from "zod"

export default defineComponent({
  setup() {
    return { sysTables: sysTables(), acct: boidAccount(), ipfsUrl }
  },
  data() {
    return {
      acctSearchInput: "",
      searchLoading: false,
      searchError: false,
      selfStakeQuantity: 0,
      delegatedStakeQuantity: 0,
      delegatedStakeTo: "",
      delegatedStakeRounds: 0,
      historyFeed: [] as any[],
      targetMetaValue: null as null | Record<string, any>,
      newOwnerName: "" as string
    }
  },
  async mounted() {
    await this.fetchTargetMeta()
    if (this.targetAcct) this.loadAccount(this.targetAcct)
    if (this.targetAcct) this.loadHistoryFeed(1)
  },
  methods: {
    async fetchTargetMeta() {
      const acct = this.acct.loggedIn
      if (!acct) return
      const metaRow = sysTables().acctmeta[acct]
      if (!metaRow || !metaRow.meta) return
      const meta = await bytesToJson<Record<string, any>>(metaRow.meta)
      console.log(meta)
      this.targetMetaValue = meta
    },

    async loadHistoryFeed(page:number) {
      if (!this.targetAcct) return
      this.historyFeed = await accountFeed(this.targetAcct, page)
    },
    async loadAccount(account:NameType | null) {
      if (!account) return
      this.sysTables.loadAccount(account)
      this.sysTables.loadSponsor(account)
      this.sysTables.loadAcctMeta(account)
    },
    async updateAccountInfo() {
      Dialog.create({ component: EditAccountInfo })
        .onOk(() => {
          this.loadAccount(this.targetAcct)
          setTimeout(() => {
            this.fetchTargetMeta()
          }, 3000)
        })
    },
    async addOwner() {
      if (!this.targetRow) return
      let newOwner:string|null = null
      if (this.targetRow.owners.length > 0) {
        let loggedIn = linkAccount().loggedIn.account
        if (!loggedIn) {
          await linkAccount().login()
          const account = linkAccount().loggedIn.account
          if (!account) return
          newOwner = account
        }
        if (!newOwner) return
      } else {
        Dialog.create({
          prompt: {
            model: this.newOwnerName
          },
          title: "Add owner",
          message: "Enter the chain account name to add to this boid account as an owner"

        }).onOk(async(data) => {
          console.log(data)
          console.log("new owner: ", data)
          await sendAuthActions([sysActions.addOwner(data)])
          await sleep(1000)
          await this.loadAccount(newOwner)
        })
      }

      if (this.targetRow.owners.length == 0) {
        // await sendAuthActions([sysActions.addOwner(loggedIn)])
        // await sleep(1000)
        // await this.loadAccount(loggedIn)
      } else {
        Dialog.create({ component: AddOwner, componentProps: { accountName: this.acct.loggedIn } })
          .onOk(async({ newOwnerName }) => {
            console.log("new owner: ", newOwnerName)
            await doActions([sysActions.addOwner(newOwnerName)])
            await sleep(1000)
            await this.loadAccount(newOwner)
          })
      }
    },
    async addAcctKey() {
      Dialog.create({
        component: AddKey
      }).onOk(async() => {
        if (this.targetAcct) await this.sysTables.loadAccount(this.targetAcct)
      })
    },
    async removeSponsor() {
      if (!this.acct.loggedIn) return
      const result = await sendAuthActions([sysActions.rmSponsor()])
      console.log(result)
      // const result = await doActions([sysActions.rmSponsor()])
      console.log(result)
      this.loadAccount(this.acct.loggedIn)
    },
    async searchAcct() {
      this.searchLoading = true
      await this.sysTables.loadAccount(this.acctSearchInput)
      const exists = this.sysTables.accounts[this.acctSearchInput]
      console.log(exists)
      if (exists) {
        this.$router.push({ name: "account", params: { name: exists.boid_id.toString() } })
        this.acctSearchInput = ""
        this.searchLoading = false
      } else {
        (this.$refs.searchInput as QInput).select()
        this.searchError = true
        setTimeout(() => this.searchLoading = false, 1000)
        setTimeout(() => this.searchError = false, 500)
        setTimeout(() => this.acctSearchInput = "", 500)
      }
    }
  },

  computed: {
    meta():ParsedAccountMeta {
      if (!this.targetMetaValue) return new ParsedAccountMeta()
      return parseAccountMeta(this.targetMetaValue as AccountMeta)
    },
    targetMeta():Record<string, any> | null {
      return this.targetMetaValue // Use the value fetched and stored by fetchTargetMeta
    },
    ownAcct():boolean {
      return this.acct.loggedIn == this.targetAcct
    },
    targetAcct():string|null {
      const acct = this.$route.params.name
      if (typeof acct == "string") return acct
      else return null
    },
    targetRow():Account | null |undefined {
      if (!this.targetAcct) return null
      else return this.sysTables.accounts[this.targetAcct]
    },
    targetSponsor():Sponsor | null |undefined {
      if (!this.targetAcct) return null
      else return this.sysTables.sponsors[this.targetAcct]
    }
  },
  watch: {
    async "$route.params.name"() {
      if (this.targetAcct) this.loadAccount(this.targetAcct)
    }
  }
})
</script>
