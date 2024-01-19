<template lang="pug">
div
  q-markup-table(flat)
    thead
      th Rank
      th Boid ID
      th Stake
      th Power
    tbody
      tr(v-for="(member,index) of members" @click="$router.push({name:'account',params:{name:member.boid_id.toString()}})").cursor-pointer.non-selectable
        td.text-center {{index+1}}
        td.text-center {{member.boid_id}}
        td.text-center {{member.stake.self_staked.toNumber().toLocaleString()}} BOID
        td.text-center {{member.power.rating}}
</template>

<script lang="ts">
import { Account } from "src/lib/types/boid.system"
import { defineComponent, PropType } from "vue"

export default defineComponent({
  props: {
    members: {
      type: Array as PropType<Account[]>,
      required: true
    }
  },
  data() {
    return {

    }
  }
})
</script>
