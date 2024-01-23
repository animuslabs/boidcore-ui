<template lang="pug">
q-dialog(ref="dialog" @hide="onDialogHide" )
  q-card.q-dialog-plugin
    .q-ma-md
      h3.q-mb-lg Settings
      q-form
        div.q-mt-lg
          h5 Relayer
          q-input(v-model="relayerInput" inputStyle="font-size:20px; text-align:center")
        div.q-mt-lg
          h5 IPFS Gateway
          q-input(v-model="ipfsInput" inputStyle="font-size:20px; text-align:center")
        div.q-mt-lg
          h5 Chain RPC (Telos Mainnet)
          q-input(v-model="chainRpcInput" inputStyle="font-size:20px; text-align:center")
        div.q-mt-lg
          h5 Boid History
          q-input(v-model="boidHistoryInput" inputStyle="font-size:20px; text-align:center")
    q-card-actions(align="right").q-mt-xl
      q-btn(color="grey" flat label="Cancel" @click="onCancelClick")
      q-btn(color="primary" label="Done" @click="onOKClick")
</template>

<script lang="ts">
import { APIClient } from "anchor-link"
import { QDialog } from "quasar"
import config, { getActiveHistory, getActiveRelayer, setHistory, setRelayer, activeChain } from "src/lib/config"
import { getIpfsGateway, setIpfsGateway } from "src/lib/ipfs"
import { link, getRpc } from "src/lib/linkManager"

export default {
  data() {
    return {
      relayerInput: "",
      ipfsInput: "",
      chainRpcInput: "",
      boidHistoryInput: ""
    }
  },
  emits: ["ok", "hide"],
  mounted() {
    this.relayerInput = getActiveRelayer(activeChain)
    this.ipfsInput = getIpfsGateway()
    this.chainRpcInput = getRpc()
    this.boidHistoryInput = getActiveHistory()
  },
  methods: {

    show() {
      (this.$refs.dialog as QDialog).show()
    },
    hide() {
      (this.$refs.dialog as QDialog).hide()
    },
    onDialogHide() {
      this.$emit("hide")
    },
    onOKClick() {
      this.$emit("ok")
      this.hide()
      setRelayer(this.relayerInput)
      setIpfsGateway(this.ipfsInput)
      link.setApi(this.chainRpcInput)
      setHistory(this.boidHistoryInput)
    },
    onCancelClick() {
      this.hide()
    }
  }
}
</script>
