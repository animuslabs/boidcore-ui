<template lang="pug">
q-dialog(ref="dialog" @hide="onDialogHide")
  q-card.q-dialog-plugin
    .q-ma-md
      h4 Add key to account
      //- h6.text-capitalize paste key directly
      //- q-input(v-model="keyInput" type="text")
      //- .centered
      //-   h3 or
      h6.text-capitalize generate key using login
      q-form(@submit="addKey()")
        h6 Boid ID
        q-input( v-model="boidIdInput" inputStyle="font-size:25px; text-align:center" disable)
        .q-mt-md
        h6 Email
        q-input(v-model="emailInput" inputStyle="font-size:25px; text-align:center" lazy-rules type="email" :rules="[ (val, rules) => rules.email(val) || 'Please enter a valid email address' ]")
        .q-mt-md
        h6 Password
        q-input(v-model="boidIdPw" inputStyle="font-size:25px; text-align:center" type="password" :rules="[(val,rules)=>val.length>3||'Password must be longer']" )
        h6 Confirm Password
        q-input(v-model="boidIdPw2" inputStyle="font-size:25px; text-align:center" type="password" :rules="[ (val, rules) => val == boidIdPw || 'Passwords must match' ]" )
        .centered.q-ma-md
          q-btn(color="primary" label="Add Key" type="submit" icon="add")

    q-card-actions(align="right")
      q-btn(color="grey" label="Cancel" @click="onCancelClick" flat )
</template>

<script lang="ts">
import { QDialog } from "quasar"
import { keyFromString } from "src/lib/auth"
import { sysActions, doActions } from "src/lib/transact"
import { boidAccount } from "src/stores/boidAccount"

export default {
  setup() {
    return { acct: boidAccount() }
  },
  data() {
    return {
      keyInput: "",
      boidIdInput: "",
      emailInput: "",
      boidIdPw: "",
      boidIdPw2: "",
      dialog: {} as QDialog
    }
  },
  props: {
    // ...your custom props
  },

  emits: ["ok", "hide"],
  mounted() {
    this.dialog = this.$refs.dialog as QDialog
    if (this.acct.loggedIn) this.boidIdInput = this.acct.loggedIn
  },

  methods: {
    async addKey() {
      if (this.boidIdPw != this.boidIdPw2) return
      console.log("addkey")
      const key = keyFromString(this.boidIdInput.toLowerCase() + this.emailInput.toLowerCase() + this.boidIdPw)
      const pubKey = key.toPublic()
      const result = await doActions([sysActions.addKey(pubKey)])
      console.log(result)
      if (!result) return
      this.acct.saveAcct(this.boidIdInput, key, true)
      this.acct.login(this.boidIdInput, true)
      this.onOKClick()
    },
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.dialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.dialog.hide()
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit("hide")
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit("ok")
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },

    onCancelClick() {
      // we just need to hide the dialog
      this.hide()
    }
  }
}
</script>
