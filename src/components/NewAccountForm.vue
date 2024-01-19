<template lang="pug">
q-card.q-ma-md.q-pa-md
  .q-ma-md
    q-form(@submit="step<3?step++:createAcct()")
      .row.q-gutter-md(v-if="step==1" style="height:170px;")
        .col(style="min-width:200px;")
          div Choose a unique Boid ID. This name can't be modified later. It can have 13 characters max including the suffix.
          h6 Enter your Boid ID Prefix
          q-input(v-model="boidIdInput" inputStyle="font-size:25px; text-align:center" :rules="boidIdInputRules")
        .col(style="min-width:200px;")
          div Every Boid ID has a suffix, the suffix is just cosmetic.
          .row.q-gutter-md
            .col-auto
              h6 Boid ID Suffix
              q-btn-dropdown(:label="boidIDSuffix" outline)
                q-list
                  q-item(clickable v-close-popup @click="boidIDSuffix = suffix.toString()" v-for="suffix of suffixes") {{suffix}}
            .col
              h6 Full Boid ID
              h5.no-margin {{fullBoidId}}
      .row(v-else style="height:100px;" @click="step=1").relative-posiiton.cursor-pointer
        .centered.full-width
          p Boid ID
        .centered.full-width
          h3.no-margin {{fullBoidId}}
      div(v-if="step==2")
        .q-mt-md
        h6 Email
        q-input(v-model="emailInput" inputStyle="font-size:25px; text-align:center" lazy-rules type="email" :rules="[ (val, rules) => rules.email(val) || 'Please enter a valid email address' ]")
      div(v-if="step>2")
        .centered.full-width
          p Email
        .centered.full-width
          h3.no-margin {{emailInput}}
      div(v-if="step==3")
        .q-mt-md
        h6 Password
        q-input(v-model="boidIdPw" inputStyle="font-size:25px; text-align:center" type="password" :rules="[(val,rules)=>val.length>3||'Password must be longer']" )
        h6 Confirm Password
        q-input(v-model="boidIdPw2" inputStyle="font-size:25px; text-align:center" type="password" :rules="[ (val, rules) => val == boidIdPw || 'Passwords must match' ]" )
      .centered.full-width.q-ma-md(v-if="step!=3")
        q-btn(@click="step--" label="< back" color="grey" flat :disable="step==1")
        q-btn(@click="step++" :label="`continue ${step}/3 >`" color="secondary" :disable="isBoidIdInputInvalid")
      .centered.q-ma-md(v-if="step==3")
        q-btn(@click="step--" label="< back" color="grey" flat)
        q-btn(v-if="!gold" color="primary" label="Create Account" type="submit" icon="add")
        div(v-else).q-mt-md
          .row.items-center.q-gutter-md
            .col
              q-btn( @click="payWithBoidAccount()" :disable="!acct.loggedIn" color="primary" :label="'Pay With Boid Account '+acct.loggedIn" padding="15px").full-width
              q-btn(label="Boid login" @click="showBoidLogin()").full-width
            .col
              q-btn( @click="payWithAnchorAccount()" :disable="!link.loggedIn.account" color="primary" :label="'Pay With Anchor Account '+link.loggedIn.account" padding="15px" ).full-width
              q-btn(label="anchor login" @click="link.login()").full-width

  div(v-if="gold")
    .centered Creation Cost: {{goldAcctCost.toLocaleString()}} BOID
</template>

<script lang="ts">
import { Name, PrivateKey } from "anchor-link"
import { Dialog } from "quasar"
import { keyFromString } from "src/lib/auth"
import { createAct, doActions, sendAuthActions, sendInviteClaimAction, sysActions } from "src/lib/transact"
import { boidAccount } from "src/stores/boidAccount"
import { sysTables } from "src/stores/sysTables"
import { linkAccount } from "src/stores/linkAccount"
import LoginDialog from "src/components/dialog/LoginDialog.vue"
import { Transfer } from "src/lib/types/token.types"
import config from "src/lib/config"
export default {
  props: {
    prefix: String,
    gold: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return { acct: boidAccount(), sysTables: sysTables(), link: linkAccount(), window, location }
  },
  data() {
    return {
      step: 1,
      keyInput: "",
      boidIdInput: "",
      emailInput: "",
      boidIdPw: "",
      boidIdPw2: "",
      boidIDSuffix: "oid"
    }
  },
  mounted() {
    console.log(this.prefix)

    this.sysTables.loadConfig()
    if (this.prefix) this.boidIdInput = this.prefix
  },
  methods: {
    genKey() {
      return keyFromString(this.fullBoidId.toLowerCase().trim() + this.emailInput.toLowerCase().trim() + this.boidIdPw.trim())
    },
    async payWithAnchorAccount() {
      const auth = this.link.loggedIn.auth
      const newBoidId = this.fullBoidId.toLowerCase().trim()
      if (!auth) return alert("auth error, not logged in")
      const key = this.genKey()
      const action = Transfer.from({
        from: this.link.loggedIn.account,
        to: config.contracts.system,
        quantity: `${this.goldAcctCost.toFixed(4)} BOID`,
        memo: "createaccount boid_id=" + newBoidId + "  owner=" + this.link.loggedIn.account
      })
      const result = await doActions([createAct("transfer", action, config.contracts.token, [auth as any]), sysActions.addKey(key.toPublic(), newBoidId, [auth])])
      if (result) Dialog.create({ message: "account created: " + this.fullBoidId }).onDismiss(() => this.$router.push({ name: "login" }))
    },
    async payWithBoidAccount() {
      const key = this.genKey()
      const action = sysActions.acctBuy({ boid_id: this.fullBoidId.toLowerCase().trim(), keys: [key.toPublic()], owners: [] })
      const result = await sendAuthActions([action])
      //@ts-ignore
      if (result && result.receipt) Dialog.create({ message: "account created: " + this.fullBoidId }).onDismiss(() => this.$router.push({ name: "login" }))
    },
    showBoidLogin() {
      Dialog.create({ component: LoginDialog })
    },
    async createAcct() {
      if (typeof this.$route.query.sponsor == "string" && typeof this.$route.query.code == "string" && typeof this.$route.query.key == "string") {
        const params = this.$route.query
        try {
          const key = this.genKey()
          // console.log(key.toString())
          // return
          const result = await sendInviteClaimAction(
            { boid_id: this.fullBoidId, keys: [key.toPublic()], owners: [] },
            params.sponsor as string,
            parseInt(params.code as string),
            PrivateKey.fromString(params.key as string)
          )
          console.log(result)

          if (result.receipts.length > 0) {
            Dialog.create({ message: "account created: " + this.fullBoidId }).onDismiss(() => this.$router.push({ name: "login" }))
          } else {
            Dialog.create({ message: "account creation error: " + result.errors[0].error })
          }
        } catch (error:any) {
          alert("invite link error: " + error.toString())
        }
      } else alert("invite link error")
      // if (this.boidIdPw != this.boidIdPw2) return
      // console.log("addkey")
      // const key = keyFromString(this.boidIdInput.toLowerCase() + this.emailInput.toLowerCase() + this.boidIdPw)
      // const pubKey = key.toPublic()
      // const result = await doActions([sysActions.addKey(pubKey)])
      // console.log(result)
      // if (!result) return
      // this.acct.saveAcct(this.boidIdInput, key, true)
      // this.acct.login(this.boidIdInput, true)
      // this.onOKClick()
    }

  },

  computed: {
    fullBoidId():string {
      return (this.boidIdInput + "." + this.boidIDSuffix).toLowerCase()
    },
    suffixes():Name[] {
      if (!this.sysTables.config) return []
      return this.sysTables.config.account.suffix_whitelist
    },
    goldAcctCost():number {
      const config = sysTables().config
      if (!config) return 0
      if (this.boidIdInput.length <= config.account.max_premium_prefix.toNumber()) return config.account.premium_purchase_price.toNumber()
      else return config.account.remove_sponsor_price.toNumber()
    },
    boidIdInputRules() {
      return [
        (val:string) => {
          const fullBoidId = this.fullBoidId
          const prefix = fullBoidId.split(".")[0]

          const prefixLength = prefix?.length || 0

          if (fullBoidId.length > 13) {
            return "Full Boid ID can have a max of 13 characters"
          }

          if (prefixLength < 4) {
            return "Boid ID prefix must have at least 4 characters"
          }

          const regex = /^[a-z1-5]*$/
          return regex.test(val) || "Boid ID can only have letters a-z and numbers 1-5"
        }
      ]
    },
    isBoidIdInputInvalid() {
      return this.boidIdInputRules.some((rule) => rule(this.boidIdInput) !== true)
    }
  }
}
</script>
