<template lang="pug">
q-dialog(ref="dialog" @hide="onDialogHide")
  q-card.q-dialog-plugin
    .q-ma-md
      h5 Edit Account Info
      div.q-mt-lg
        h5 Profile Image (IPFS Hash)
        .row.items-center.q-gutter-md
          .col-auto
            q-img(:src="ipfsUrl(profileImage)" width="80px")
          .col
            q-input(v-model="profileImage" inputStyle="font-size:20px;")
      div.q-mt-lg
        h5 About me
          q-input(v-model="infoText" inputStyle="font-size:20px;" type="textarea")
      div.q-mt-lg
        h5 EOS Account
          q-input(v-model="eosAccount" inputStyle="font-size:20px;")
      div.q-mt-lg
        h5 Telos Account
          q-input(v-model="telosAccount" inputStyle="font-size:20px;")

    q-card-actions(align="right")
      q-btn(color="grey" label="Cancel" @click="onCancelClick" flat)
      q-btn(color="primary" label="OK" @click="onOKClick")
</template>

<script lang="ts">
import { QDialog } from "quasar"
import { defineComponent, PropType } from "vue"
import { AccountMeta } from "src/lib/types/types"
import { boidAccount } from "src/stores/boidAccount"
import { sysTables } from "src/stores/sysTables"
import { ipfsUrl, jsonToBytes, createIpfs, ipfsCache, getIpfs, jsonToIpfsCid } from "src/lib/ipfs"
import { sendAuthActions, sysActions } from "src/lib/transact"
import { CID } from "multiformats/cid"
import { parseAccountMeta } from "src/lib/account"
import { bytesToJson } from "src/lib/util"

export default defineComponent({
  async mounted() {
    const meta = this.targetMeta as AccountMeta
    console.log("meta:", meta) // Log the raw meta data
    const parsed = parseAccountMeta(meta)
    console.log("parsed:", parsed) // Log the parsed meta data
    this.profileImage = parsed.media.profile
    this.infoText = parsed.text.info
    this.eosAccount = parsed.text.eosAccount
    this.telosAccount = parsed.text.telosAccount
    this.fetchAndParseMeta()
  },
  data: function() {
    return {
      ipfsUrl,
      profileImage: "",
      infoText: "",
      eosAccount: "",
      telosAccount: "",
      targetMetaValue: null as null | Record<string, any>
    }
  },
  props: {

  },
  emits: ["ok", "hide"],
  computed: {
    targetMeta():Record<string, any> | null {
      const acct = boidAccount().loggedIn
      if (!acct) return null
      const metaRow = sysTables().acctmeta[acct]
      if (!metaRow) return null
      const meta = bytesToJson(metaRow.meta)
      return meta
    }
  },
  methods: {
    async fetchAndParseMeta() {
      const acct = boidAccount().loggedIn
      if (!acct) return
      const metaRow = sysTables().acctmeta[acct]
      if (!metaRow || !metaRow.meta) return
      const meta = await bytesToJson<AccountMeta>(metaRow.meta) // handle the promise properly
      console.log(meta)
      this.targetMetaValue = meta // update a data property
      const parsed = parseAccountMeta(this.targetMetaValue as AccountMeta)
      console.log("parsed:", parsed) // Log the parsed meta data
      this.profileImage = parsed.media.profile
      this.infoText = parsed.text.info
      this.eosAccount = parsed.text.eosAccount
      this.telosAccount = parsed.text.telosAccount
    },
    show() {
      (this.$refs.dialog as QDialog).show()
    },
    hide() {
      (this.$refs.dialog as QDialog).hide()
    },
    onDialogHide() {
      this.$emit("hide")
    },
    async onOKClick() {
      const newMeta = new AccountMeta()
      newMeta.text.push(["info", this.infoText])
      newMeta.media.push(["profile", this.profileImage])
      newMeta.text.push(["eosAccount", this.eosAccount])
      newMeta.text.push(["telosAccount", this.telosAccount])
      const result = await jsonToBytes(newMeta)
      console.log(result.toString())
      console.log("loggedin", boidAccount().loggedIn)
      console.log("AccountMetaData:", result.toString())

      await sendAuthActions([sysActions.accountEdit(result)], { accountMeta: newMeta as any })
      this.$emit("ok")
      this.hide()
    },
    onCancelClick() {
      this.hide()
    }
  }
})
</script>
