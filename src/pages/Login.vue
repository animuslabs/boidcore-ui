<template lang="pug">
div.q-ma-md
  .centered.q-mt-xl
    h4.text-weight-light {{advanced?'Advanced':''}} Login
  .centered.relative-position(v-if="!advanced")
    div.absolute-center(v-if="loading")
      q-spinner(size="50px")
    .centered(:style="loading?'width:100%; filter:blur(4px); opacity:.8':''")
      q-form(@submit="attemptLogin()" style="max-width:400px; width:100vw; ")
        h6 Boid ID
        q-input(@focus="clearError()" v-model="boidIdInput" inputStyle="font-size:25px; text-align:center" :errorMessage="boidIdErrorMsg" :error="boidIDError")
        .q-mt-md
        h6 Email
        q-input(@focus="clearError()" v-model="emailInput" inputStyle="font-size:25px; text-align:center" lazy-rules :errorMessage="boidIdErrorMsg" type="email" :rules="[ (val, rules) => rules.email(val) || 'Please enter a valid email address' ]")
        .q-mt-md
        h6 Password
        q-input( @focus="clearError()" v-model="boidIdPw" inputStyle="font-size:25px; text-align:center" type="password" )
        .q-mt-md
        .row
          q-checkbox(v-model="savePw" label="Remember Account")
          .col-grow
          q-btn(label="login" color="primary" :flat="false" :disable="disableLogin" type="submit")
        .centered
          h5.text-negative {{mainError}}
  .div(v-else)
    .centered
      h6 Login with your chain owner account to manage your linked boid account
    .centered
      q-form(@submit="loadAccount()" style="max-width:400px; width:100vw; ")
        h6 Boid ID
        q-input(@focus="clearError()" v-model="boidIdInput" inputStyle="font-size:25px; text-align:center" :errorMessage="boidIdErrorMsg" :error="boidIDError")
        .centered
          q-btn(label="load account" type="submit" :loading="loading")
        //- div {{targetRow}}
        div(v-if="targetRow")
          .centered
            h6 owner accounts linked
          .centered
            .col-auto(v-for="owner of targetRow.owners")
              .centered
                h4 {{owner}}
          .centered
            h6 You must login with a linked owner account to continue
          .centered
            q-btn(label="owner wallet login" @click="anchorLogin()" :flat="false" color="blue-9")
  q-separator.q-mt-xl(v-if="!hideAdvanced")
  .centered.q-pt-md(v-if="!hideAdvanced")
    q-btn(label="advanced login" icon="person" outline :flat="false" v-if="!advanced" @click="advanced = true")
    q-btn(label="basic login" icon="person" outline :flat="false" v-if="advanced" @click="advanced = false")

</template>

<script lang="ts">
import { defineComponent } from "vue"
import { boidAccount } from "src/stores/boidAccount"
import { sysQueries } from "src/lib/queries"
import { PrivateKey } from "anchor-link"
import * as ecc from "eosjs-ecc"
import { keyFromString } from "src/lib/auth"
import { Account } from "src/lib/types/boid.system"
import { link } from "src/lib/linkManager"
import { linkAccount } from "src/stores/linkAccount"
import { downloadStringAsTextFile } from "src/lib/util"
import { Notify } from "quasar"

export default defineComponent({
  emits: {
    loggedIn: Boolean
  },
  props: {
    hideAdvanced: {
      type: Boolean,
      default: false
    },
    redirect: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    return { acct: boidAccount(), linkAcct: linkAccount() }
  },
  data() {
    return {
      loading: false,
      boidIdInput: "",
      mainError: "",
      emailInput: "",
      boidIdPw: "",
      savePw: true,
      boidIdErrorMsg: "",
      advanced: false,
      targetRow: null as Account | null

    }
  },
  methods: {
    async anchorLogin() {
      await link.login()
      this.acct.login(this.boidIdInput, false)
    },
    async loadAccount() {
      this.loading = true
      this.targetRow = null
      this.targetRow = await sysQueries.accounts(this.boidIdInput)
      if (!this.targetRow) this.boidIdErrorMsg = "account doesn't exist"
      setTimeout(() => this.loading = false, 1000)
    },
    async chainLogin() {

    },
    async attemptLogin() {
      this.loading = true
      try {
        const acctRow = await sysQueries.accounts(this.boidIdInput)
        if (!acctRow) {
          this.boidIdErrorMsg = "invalid Boid ID"
          this.loading = false
          return
        }
        const key = keyFromString(this.boidIdInput.toLowerCase().trim() + this.emailInput.toLowerCase().trim() + this.boidIdPw.trim())
        const pubKey = key.toPublic()
        const keyIndx = acctRow.auth.keys.findIndex(el => el.equals(pubKey))
        if (keyIndx == -1) {
          this.mainError = "Invalid login, check credentials."
          this.loading = false
          return
        }
        console.log("key index:", keyIndx)
        const txt = `boid id: ${this.boidIdInput.toLowerCase().trim()}\nemail: ${this.emailInput.toLowerCase().trim()}\npw: ${this.boidIdPw.trim()}`
        Notify.create({
          message: "Please backup your login credentials",
          timeout: 8000,
          icon: "priority_high",
          iconColor: "white",
          actions: [{
            label: "Download Backup",
            color: "warning",

            handler: () => {
              downloadStringAsTextFile(txt, `boid-backup-${this.boidIdInput.toLowerCase().trim()}.txt`)
            }
          }]
        })
        this.acct.saveAcct(this.boidIdInput, key, this.savePw)
        this.acct.login(this.boidIdInput, this.savePw)
        if (this.redirect) this.$router.push({ name: "account", params: { name: this.boidIdInput.toLowerCase() } })
        this.$emit("loggedIn", true)
      } catch (error) {
        this.loading = false
        console.error(error)
      }
      setTimeout(() => this.loading = false, 2000)
    },
    clearError() {
      this.mainError = ""
      this.boidIdErrorMsg = ""
    }
  },
  computed: {
    disableLogin():boolean {
      return !(this.boidIdInput.length > 3 && this.boidIdPw.length > 3)
    },
    boidIDError():boolean {
      return this.boidIdErrorMsg.length > 0
    }
  },
  watch: {
    advanced() {
      this.targetRow = null
      this.boidIdInput = ""
    }
  }
})
</script>
