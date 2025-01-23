<template>
  <!-- Game and Cycle Selection -->
  <div class="row justify-center items-center q-mb-md">
    <div
      class="row q-ma-md"
    >
      <q-select
        v-model="selectedGame"
        :options="availableGames"
        label="Select Game"
        style="width: 130px"
        emit-value
        map-options
      />
      <q-select
        v-model="selectedCycle"
        :options="availableCycles"
        label="Select Cycle"
        style="width: 110px"
        emit-value
        map-options
      />
      <q-select
        v-model="selectedStat"
        :options="availableStats"
        label="Select Stat"
        style="width: 120px"
        emit-value
        map-options
      />
    </div>
  </div>
  <div class="row justify-center items-center q-gutter-md">
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
      >
        <template #top-right>
          <q-btn
            color="primary"
            icon-right="refresh"
            label="Refresh"
            @click="refreshData"
            :loading="loading"
            class="q-px-md"
          />
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
      />
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
      />
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { gameRecordsTable, gameRewardsTable, processHighScores, processRewardRecords, getHighScores, getAllTimeHighScores, getGameRewards, type GameScore, type RewardRecord } from "src/lib/gaming"
import { onMounted, ref, computed } from "vue"

const loading = ref(false)
const rawGames = ref<GameScore[]>([])
const rawRewards = ref<RewardRecord[]>([])
const selectedGame = ref<number | null>(null)
const selectedCycle = ref<number | null>(null)
const selectedStat = ref<string | null>(null)

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
  return Array.from(cycles).map(cycle => ({ label: `Cycle ${cycle}`, value: cycle }))
})

const availableStats = computed(() => {
  const stats = new Set(rawGames.value.flatMap(g => Object.keys(g.scores)))
  return Array.from(stats).map(stat => ({ label: stat, value: stat }))
})

const columns = [
  { name: "rank", label: "Rank", field: "rank" },
  { name: "player", label: "Player", field: "player" },
  { name: "score", label: "Score", field: "score" },
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
    format: (val:string) => {
      if (!val) return "-"
      const date = new Date(val + "Z")
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    }
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
  if (!selectedGame.value || !selectedCycle.value || !selectedStat.value) return []

  const rewards = getGameRewards(rawRewards.value, selectedGame.value, selectedCycle.value, selectedStat.value)
  return rewards.flatMap(reward =>
    reward.rewarded_players.map((player, index) => ({
      player,
      reward: reward.player_rewards[index],
      distribution_time: reward.distribution_time
    }))
  )
})

const refreshData = async() => {
  loading.value = true
  try {
    const [gameRecords, rewardRecords] = await Promise.all([
      gameRecordsTable(),
      gameRewardsTable()
    ])
    rawGames.value = processHighScores(gameRecords)
    rawRewards.value = processRewardRecords(rewardRecords)
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

onMounted(() => {
  refreshData()
})
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
