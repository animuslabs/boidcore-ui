<template lang="pug">
q-page(padding)
  .div(v-if="!targetTeam").q-mt-lg
    .centered
      q-card.q-pa-md(style="width:635px; max-width:90vw;")
        .centered
          h3 Boid Teams
          TeamsList(:teams="teamsView")
  .centered(v-if="targetTeam")
    TeamCard(:team="targetTeam")

</template>

<script lang="ts">
import { defineComponent } from "vue"
import { sysTables } from "src/stores/sysTables"
import { Team } from "src/lib/types/boid.system"
import { CID } from "multiformats/cid"
import { getIpfs } from "src/lib/ipfs"
import TeamLeaderboard from "src/components/TeamLeaderboard.vue"
import TeamStats from "src/components/TeamStats.vue"
import TeamCard from "src/components/TeamCard.vue"
import TeamsList from "src/components/TeamsList.vue"

async function loadTeamMeta(team:Team) {
  // const cid = CID.decode(team.meta.array)
  // await getIpfs(cid)
}

export default defineComponent({
  setup() {
    return { CID, getIpfs }
  },
  data() {
    return {}
  },
  async mounted() {
    sysTables().loadAccounts()
    await sysTables().loadTeams()
  },
  computed: {
    targetTeam():Team | null {
      const targetTeam = this.$route.params.name
      if (typeof targetTeam != "string") { return null }
      const existing = this.teamsView.find(el => el.url_safe_name.toString() == targetTeam)
      if (existing) { return existing }
      return null
    },
    teamsView():Team[] {
      return Object.values(sysTables().teams)
    }
  },
  watch: {
    async "$route.params.name"(val:string | null) {
      if (!val || typeof val != "string") { return }
      console.log("val:", val)
      if (!this.targetTeam) { return }
      await sysTables().loadTeam(this.targetTeam.team_id.toNumber())
      await loadTeamMeta(this.targetTeam)
      await sysTables().loadAccounts()
    }
  },
  components: { TeamLeaderboard, TeamStats, TeamCard, TeamsList }
})
</script>
