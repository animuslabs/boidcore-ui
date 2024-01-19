<template lang="pug">
div
  q-markup-table.q-mt-md( flat separator="cell").full-width
    thead
      tr
        th Logo
        th name
        th owner
        th # members
        th power
        //- th metadata (ipfs)
    tbody
      tr(v-for="(team,index) of teams" :key="team.team_id.toNumber()" @click="$router.push({name:'team',params:{name:team.url_safe_name}})" ).cursor-pointer.non-selectable.relative-position
        td.text-center
          //- div {{icons[index]}}
          q-img(:src="icons[index]" width="50px" style="border-radius: 20%;")
        td.text-center {{team.url_safe_name}}
        td.text-center {{team.owner}}
        td.text-center {{team.members}}
        td.text-center {{team.power}}
</template>

<script lang="ts">
import { CID } from "multiformats/cid"
import { ipfsCache, ipfsUrl } from "src/lib/ipfs"
import { Team } from "src/lib/types/boid.system"
import { TeamMeta } from "src/lib/types/types"
import { bytesToJson } from "src/lib/util"
import { defineComponent, PropType } from "vue"

export default defineComponent({
  data: function() {
    return {
      teamDataMap: {} as Record<string, TeamMeta|undefined>
    }
  },
  props: {
    teams: {
      type: Array as PropType<Team[]>,
      required: true
    }
  },
  computed: {
    icons():string[] {
      return this.teams.map(team => {
        let data:TeamMeta|undefined = this.teamDataMap[team.team_id.toString()]
        if (!data) data = new TeamMeta()
        const iconData = data.media.find(el => el[0] === "icon")
        return ipfsUrl(iconData ? iconData[1] : "QmSjZGPnLP1w7JxWgcLgj3ymHMNkmkzjLa8UYecECNrJVp")
      })
    }
  },
  watch: {
    teams: {
      handler() {
        this.teams.forEach(async(team) => {
          console.log(team.team_id.toString())

          this.teamDataMap[team.team_id.toString()] = await bytesToJson<TeamMeta>(team.meta)
        })
      },
      immediate: true
    }
  }
})
</script>
