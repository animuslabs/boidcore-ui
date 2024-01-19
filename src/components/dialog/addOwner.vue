<template lang="pug">
q-dialog(ref="dialogRef", @hide="onDialogHide")
  q-card.q-dialog-plugin.q-pa-lg
    h5 Adding new Owner to account: {{accountName}}
    p Ensure you are currently logged in via anchor with an existing owner account
    div.q-pa-lg
      p Enter new Owner account name
      q-input(v-model="data.newOwnerName" inputStyle="font-size:25px; text-align:center")
    .centered
      q-btn(label="add owner" outline @click="onOKClick")
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar"
import { reactive } from "vue"
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const data = reactive({
  newOwnerName: ""
})
const props = defineProps<{
  accountName:string
  }>()

defineEmits([
  ...useDialogPluginComponent.emits
])

function onOKClick() {
  onDialogOK({ newOwnerName: data.newOwnerName })
}
</script>
