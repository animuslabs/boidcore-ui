<template>
  <q-banner
    v-if="showBanner"
    class="bg-secondary text-white q-mb-md"
  >
    <div class="col-6 text-bold text-center">
      Games records are updated every 24 hours. Each cycle lasts 7 days. Top 5 players are rewarded every cycle.
    </div>
    <div class="col-6 text-right">
      <q-btn
        flat
        dense
        color="white"
        label="Dismiss"
        @click="showBanner = false"
      />
    </div>
  </q-banner>
  <!-- Global Config Info -->
  <div
    v-if="globalConfig"
    class="row justify-center items-center q-mb-md"
  >
    <q-card
      class="q-pa-md bg-transparent"
      flat
    >
      <div class="row q-gutter-lg text-center">
        <div class="text-subtitle1">
          Current Cycle <b>{{ currentCycle }}</b>
        </div>
        <div class="text-subtitle1">
          Time Remaining <b>{{ timeRemaining }}</b>
        </div>
      </div>
      <q-separator />
      <div class="q-mt-md text-center">
        <a
          href="https://docs.boid.com/boidverse/boidsquadron/Introduction.html"
          target="_blank"
          class="text-indigo-10 text-weight-bold"
          style="text-decoration: none"
        >Boid Squadron</a> |
        <a
          href="https://docs.boid.com/boidverse/boidvoid/Introduction.html"
          target="_blank"
          class="text-indigo-10 text-weight-bold"
          style="text-decoration: none"
        >Boid Void</a>
      </div>
    </q-card>
  </div>
  <!-- Game and Cycle Selection -->
  <div class="row justify-center items-center q-mb-md">
    <div
      class="row q-mb-xs q-gutter-xs"
    >
      <q-select
        v-model="selectedGame"
        :options="availableGames"
        label="Game"
        style="width: 160px"
        color="primary"
        label-color="primary"
        emit-value
        map-options
        outlined
      />
      <q-select
        v-model="selectedCycle"
        :options="availableCycles"
        label="Cycle"
        style="width: 90px"
        color="primary"
        label-color="primary"
        emit-value
        map-options
        outlined
      />
      <q-select
        v-model="selectedStat"
        :options="availableStats"
        label="Stat"
        style="width: 120px"
        color="primary"
        label-color="primary"
        emit-value
        map-options
        outlined
      />
      <q-btn
        color="grey-5"
        outline
        icon-right="refresh"
        @click="refreshData"
        :loading="loading"
      />
    </div>
  </div>
  <div class="row justify-center items-start q-gutter-sm">
    <q-card
      class="q-pa-md bg-transparent"
      flat
    >
      <q-table
        class="games-table"
        :rows="currentHighScores"
        :columns="columns"
        row-key="player"
        :loading="loading"
        title="🌟 This Cycle Heroes"
        flat
        :table-style="{ color: '#e2e8f0' }"
        :separator="'cell'"
        style="max-width: 450px"
        :pagination="{rowsPerPage: 10}"
      >
        <template #top-right>
          <q-btn
            flat
            dense
            icon="info"
            color="white"
          >
            <q-tooltip>Shows top performing players in the current cycle on a chosen stat.</q-tooltip>
          </q-btn>
        </template>
      </q-table>
    </q-card>
    <q-card
      class="q-pa-md bg-transparent"
      flat
    >
      <q-table
        class="games-table"
        :rows="allTimeHighScores"
        :columns="columns"
        row-key="player"
        :loading="loading"
        title="👑 Legends Board"
        :rows-per-page="20"
        flat
        :table-style="{ color: '#e2e8f0' }"
        :separator="'cell'"
        style="max-width: 450px"
        :pagination="{rowsPerPage: 10}"
      >
        <template #top-right>
          <q-btn
            flat
            dense
            icon="info"
            color="white"
          >
            <q-tooltip>Shows top performing players of all time on a chosen stat.</q-tooltip>
          </q-btn>
        </template>
      </q-table>
    </q-card>
    <q-card
      class="q-pa-md bg-transparent"
      flat
    >
      <q-table
        class="games-table"
        :rows="currentRewards"
        :columns="rewardColumns"
        row-key="player"
        :loading="loading"
        title="💰 Reward History"
        :rows-per-page="20"
        flat
        :table-style="{ color: '#e2e8f0' }"
        :separator="'cell'"
        style="max-width: 550px"
        :pagination="{rowsPerPage: 10}"
      >
        <template #top-right>
          <q-btn
            flat
            dense
            icon="info"
            color="white"
          >
            <q-tooltip>Shows rewards given out to players based on the chosen game and stat.</q-tooltip>
          </q-btn>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { gameRecordsTable, gameRewardsTable, globalConfigTable, processHighScores, processRewardRecords, getHighScores, getAllTimeHighScores, getGameRewards, type GameScore, type RewardRecord } from "src/lib/gaming"
import { onMounted, ref, computed, onUnmounted } from "vue"

const loading = ref(false)
const rawGames = ref<GameScore[]>([])
const rawRewards = ref<RewardRecord[]>([])
const selectedGame = ref<number | null>(null)
const selectedCycle = ref<number | null>(null)
const selectedStat = ref<string | null>(null)
const globalConfig = ref<any>(null)
const showBanner = ref(true)

// Computed properties for available options
const availableGames = computed(() => {
  const games = new Set(rawGames.value.map(g => g.game_id))
  return Array.from(games).map(id => ({
    label: id === 1 ? "Boid Squadron" : id === 2 ? "Boid Void" : `Game ${id}`,
    value: id
  }))
})

const availableCycles = computed(() => {
  const cycles = new Set(rawGames.value
    .filter(g => selectedGame.value === null || g.game_id === selectedGame.value)
    .map(g => g.cycle_number))
  return Array.from(cycles)
    .sort((a, b) => b - a) // Sort in descending order
    .map(cycle => ({
      label: cycle,
      value: cycle
    }))
})

const availableStats = computed(() => {
  const stats = new Set(rawGames.value.flatMap(g => Object.keys(g.scores)))
  return Array.from(stats).map(stat => ({ label: stat, value: stat }))
})

const columns = [
  { name: "rank", label: "Rank", field: "rank" },
  { name: "player", label: "Player", field: "player" },
  { name: "score", label: "Stat", field: "score" },
  {
    name: "date",
    label: "Date",
    field: "timestamp",
    format: (val:string) => val ? new Date(val).toLocaleDateString() : "-"
  }
]

const rewardColumns = [
  { name: "player", label: "Player", field: "player" },
  { name: "reward", label: "Reward", field: "reward" },
  {
    name: "date",
    label: "Date",
    field: "distribution_time",
    format: (val:string) => val ? new Date(val).toLocaleDateString() : "-"
  },
  {
    name: "cycle",
    label: "Cycle",
    field: "cycle"
  }
]

const currentHighScores = computed(() => {
  if (!selectedGame.value || !selectedCycle.value || !selectedStat.value) return []

  const scores = getHighScores(rawGames.value, selectedGame.value, selectedCycle.value, selectedStat.value)
  return scores.map((score, index) => ({
    rank: index + 1,
    player: score.player,
    score: selectedStat.value ? score.scores[selectedStat.value] : 0,
    timestamp: score.timestamp
  }))
})

const allTimeHighScores = computed(() => {
  if (!selectedGame.value || !selectedStat.value) return []

  const scores = getAllTimeHighScores(rawGames.value, selectedGame.value, selectedStat.value)
  return scores.map((score, index) => ({
    rank: index + 1,
    player: score.player,
    score: selectedStat.value ? score.scores[selectedStat.value] : 0,
    timestamp: score.timestamp
  }))
})

const currentRewards = computed(() => {
  if (!selectedGame.value || !selectedStat.value) return []

  const rewards = getGameRewards(rawRewards.value, selectedGame.value, selectedStat.value)
  return rewards.flatMap(reward =>
    reward.rewarded_players.map((player, index) => ({
      player,
      reward: reward.player_rewards[index],
      distribution_time: reward.distribution_time,
      cycle: reward.cycle_number
    }))
  )
})

const currentCycle = computed(() => {
  if (!globalConfig.value?.cycles_initiation_time) return null
  const initTime = new Date(globalConfig.value.cycles_initiation_time).getTime()
  const now = Date.now()
  const cycleLength = globalConfig.value.cycle_length_sec * 1000 // convert to ms
  const elapsedTime = now - initTime
  return Math.floor(elapsedTime / cycleLength) + 1
})

const timeRemaining = ref("")
const updateTimeRemaining = () => {
  if (!globalConfig.value?.cycles_initiation_time) return

  const now = Date.now()
  const initTime = new Date(globalConfig.value.cycles_initiation_time).getTime()
  const cycleLength = globalConfig.value.cycle_length_sec * 1000
  const currentCycleStart = initTime + (Math.floor((now - initTime) / cycleLength) * cycleLength)
  const cycleEnd = currentCycleStart + cycleLength
  const remaining = cycleEnd - now

  if (remaining <= 0) {
    timeRemaining.value = "Cycle ending..."
    // Refresh data when cycle ends
    refreshData()
    return
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

  timeRemaining.value = `${hours}h ${minutes}m ${seconds}s`
}

let timerInterval:NodeJS.Timer | null = null

onMounted(() => {
  refreshData()
  updateTimeRemaining()
  timerInterval = setInterval(updateTimeRemaining, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const refreshData = async() => {
  try {
    loading.value = true
    const [games, rewards, config] = await Promise.all([
      gameRecordsTable(),
      gameRewardsTable(),
      globalConfigTable()
    ])
    console.log("Global config:", config)
    rawGames.value = processHighScores(games)
    rawRewards.value = processRewardRecords(rewards)
    globalConfig.value = config[0]
    console.log("Processed global config:", globalConfig.value)
    // Set initial selections if none are set
    const firstGame = availableGames.value?.[0]
    if (!selectedGame.value && firstGame) {
      selectedGame.value = firstGame.value
    }
    const firstCycle = availableCycles.value?.[0]
    if (!selectedCycle.value && firstCycle) {
      selectedCycle.value = firstCycle.value
    }
    const firstStat = availableStats.value?.[0]
    if (!selectedStat.value && firstStat) {
      selectedStat.value = firstStat.value
    }
  } catch (error) {
    console.error("Error refreshing data:", error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.games-table {
  background: $grey-3;
  border-radius: 12px;
}

.games-table .q-table__top {
  background: $primary;
  color: white;
  font-size: 1.5em;
  font-weight: bold;
  border-radius: 12px 12px 0 0;
  padding: 16px;
}

.games-table .q-table thead tr th {
  background: $primary;
  color: white;
  font-size: 1.1em;
}

.games-table .q-table tbody tr:nth-child(1) {
  background: $amber;
  color: #2d3748;
}

.games-table .q-table tbody tr:nth-child(2) {
  background: $cyan-5;
}

.games-table .q-table tbody tr:nth-child(3) {
  background: $teal-3;
}

.games-table .q-table tbody td {
  font-size: 1.1em;
  color: black;
}
</style>
