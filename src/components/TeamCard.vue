<template lang="pug">
div
  q-card.q-pa-md(style="width:635px; max-width:90vw;").q-mt-lg
      .absolute-top-left.full-width
        q-btn(label="< all teams" @click="$router.push({name:'team'})")
      .q-ma-md.q-mt-lg
        .row
          .col-auto
            .row
              q-img(:src="ipfsUrl(teamIcon)" width="50px")
            .row.q-pt-sm
              h3 {{teamName}}
          .col
            .row.items-center.full-height
              .col-auto(v-for="link of targetTeamLinkData" :key="link.url")
                q-btn(:icon="link.icon" round type="a" :href="link.url"  ).text-grey-8
                  q-tooltip
                    p.text-capitalize {{link.label}}
        div(v-if="targetTeamText.summary").q-mt-sm
          p {{targetTeamText.summary}}
        div.q-mt-md
          h5 Team Stats
          team-stats(:team="team")
        div.q-mt-md(v-if="loggedIn && targetRow")
          h5 My Team Info
          div(v-if="targetRow.team.team_id.equals(team.team_id)")
            .centered
              h5 You are a member of this team
            .centered
              .centered.q-gutter-lg.no-wrap
                .col-auto
                  .centered
                    h6.no-margin Last Edit Round
                  .centered
                    h4.no-margin {{ targetRow.team.last_edit_round }}
                .col-auto
                  .centered
                    h6.no-margin Team Contribution
                  .centered
                    h4.no-margin {{ targetRow.team.team_cumulative_contribution }} BOID
          div(v-else)
            .centered
                h5 You are not on this team
            .centered.q-pt-md.q-mb-lg
              q-btn(label="Join Team" color="green" @click="joinTeam()" :loading="loading" :disable="!canChangeTeams")
              //- p {{ canChangeTeams }} {{ nextTeamChangeRound  }} {{ currentRound() }}
            .centered(v-if="!canChangeTeams")
                h5(style="width:450px;") You changed teams too recently
                p(style="width:450px;") you can change teams again after {{ roundStartTime(nextTeamChangeRound+1).toLocaleString() }}.
        div.q-mt-md
          h5 Team Leaderboard
          team-leaderboard(:members="teamLeaderboard")
</template>

<script lang="ts">
import { CID } from "multiformats/cid"
import TeamStats from "src/components/TeamStats.vue"
import TeamLeaderboard from "src/components/TeamLeaderboard.vue"
import { ipfsCache, ipfsUrl } from "src/lib/ipfs"
import { Account, Team } from "src/lib/types/boid.system"
import { TeamMeta } from "src/lib/types/types"
import { sysTables } from "src/stores/sysTables"
import { defineComponent, PropType } from "vue"
import { bytesToJson, currentRound, sleep, roundStartTime } from "src/lib/util"
import { link } from "src/lib/linkManager"
import { boidAccount } from "src/stores/boidAccount"
import { sendAuthActions, sysActions } from "src/lib/transact"
import { log } from "console"

const linkIcons = {
  twitter: "fa-brands fa-twitter",
  medium: "fa-brands fa-medium",
  telegram: "fa-brands fa-telegram",
  discord: "fa-brands fa-discord"
} as any

export default defineComponent({
  props: {
    team: {
      type: Object as PropType<Team>,
      required: true
    }
  },
  setup() {
    return { ipfsUrl, boidAccount: boidAccount(), sysTables: sysTables(), currentRound, roundStartTime }
  },
  data() {
    return {
      teamData: null as TeamMeta | null,
      link,
      loading: false
    }
  },
  methods: {
    async joinTeam() {
      if (!this.targetRow) return
      const joinAction = sysActions.changeTeam(this.team.team_id, this.team.min_pwr_tax_mult)
      this.loading = true
      try {
        if (this.targetRow.power.last_claimed_round.toNumber() != currentRound()) await sendAuthActions([sysActions.pwrClaim()])
        const result = await sendAuthActions([joinAction])
        console.log(result)
        await sleep(2000)
        await this.sysTables.loadTeam(this.team.team_id)
      } catch (error) {
        console.error(error)
      }
      this.loading = false
    }
  },
  computed: {
    canChangeTeams():boolean {
      return currentRound() > this.nextTeamChangeRound
    },
    nextTeamChangeRound():number {
      if (!this.loggedIn || !this.targetRow) return 0
      const config = this.sysTables.config
      if (!config) {
        this.sysTables.loadConfig()
        return 0
      }
      return this.targetRow.team.last_edit_round.toNumber() + config.team.change_min_rounds.toNumber()
    },
    loggedIn():string | null {
      return this.boidAccount.loggedIn
    },
    targetRow():Account | null | undefined {
      if (!this.loggedIn) return null
      else return this.sysTables.accounts[this.loggedIn]
    },
    teamIcon():string {
      if (!this.targetTeamMeta) { return "QmSjZGPnLP1w7JxWgcLgj3ymHMNkmkzjLa8UYecECNrJVp" }
      const iconData = this.targetTeamMeta.media.find(el => el[0] === "icon")
      return iconData ? iconData[1] : "QmSjZGPnLP1w7JxWgcLgj3ymHMNkmkzjLa8UYecECNrJVp"
    },
    teamLeaderboard():Account[] {
      if (!this.team) {
        return []
      }
      const team = this.team
      return Object.values(sysTables().accounts)
        .filter(el => el.team.team_id.equals(team.team_id))
        .sort((last, val) => val.power.rating.toNumber() - last.power.rating.toNumber())
        .slice(0, 20)
    },
    teamName():string {
      return this.team.url_safe_name
    },

    targetTeamMeta():TeamMeta {
      if (!this.team) return new TeamMeta()
      const data = this.teamData
      if (data) return data as TeamMeta
      return new TeamMeta()
    },
    targetTeamText():Record<any, string> {
      let results = {} as any
      this.targetTeamMeta.text.forEach((val) => {
        console.log(val)
        results[val[0]] = val[1]
      })
      return results
    },
    targetTeamLinkData():{
            url:string;
            icon:string;
            label:string;
        }[] {
      if (!this.targetTeamMeta) return [] //
      return this.targetTeamMeta.links.map(el => {
        return { icon: linkIcons[el[0].toLowerCase()] || "link", url: el[1], label: el[0] }
      })
      return []
    }
  },
  components: { TeamStats, TeamLeaderboard },
  watch: {
    team: {
      async handler() {
        if (this.team) this.teamData = await bytesToJson<TeamMeta>(this.team.meta)
      },
      immediate: true
    },
    loggedIn: {
      async handler() {
        if (this.loggedIn) this.sysTables.loadAccount(this.loggedIn)
      },
      immediate: true
    }
  }
})
</script>
