<template lang="pug">
q-dialog(ref="dialog" @hide="onDialogHide").q-pa-md
  q-card.q-dialog-plugin.q-pa-md
    .q-ma-md.q-pa-md
      Login(:hideAdvanced="true" :redirect="false" @loggedIn="hide()")
</template>

<script lang="ts">import { QDialog } from "quasar"
import Login from "src/pages/Login.vue"

export default {
  props: {
    // ...your custom props
  },
  emits: [
    // REQUIRED
    "ok",
    "hide"
  ],
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      (this.$refs.dialog as QDialog).show()
    },
    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      (this.$refs.dialog as QDialog).hide()
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
  },
  components: { Login }
}
</script>
