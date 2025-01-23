import { link } from "./linkManager"

export interface GameScore {
  player:string
  game_id:number
  cycle_number:number
  scores:{ [statName:string]:number }
  timestamp?:string
}

export interface RewardRecord {
  game_id:number
  cycle_number:number
  stat_name:string
  total_reward:string
  rewarded_players:string[]
  player_rewards:string[]
  distribution_time:string
}

export const gameRecordsTable = async() => {
  try {
    const result = await link.rpc.get_table_rows({
      code: "scores.boid",
      scope: "scores.boid",
      table: "gamerecords",
      json: true,
      limit: 10000// Increased limit to get more scores
    })
    return result.rows
  } catch (error) {
    console.error("Error fetching game records:", error)
    throw error
  }
}

export const gameRewardsTable = async() => {
  try {
    const result = await link.rpc.get_table_rows({
      code: "scores.boid",
      scope: "scores.boid",
      table: "rewardsrec",
      json: true,
      limit: 10000 // Increased limit to get more scores
    })
    return result.rows
  } catch (error) {
    console.error("Error fetching game records:", error)
    throw error
  }
}

export const processHighScores = (records:any[]):GameScore[] => {
  return records.map(record => ({
    player: record.player,
    game_id: record.game_id,
    cycle_number: record.cycle_number,
    timestamp: record.game_completion_time,
    scores: record.stats_names.reduce((acc:{ [key:string]:number }, name:string, index:number) => {
      acc[name] = record.stats_values[index]
      return acc
    }, {})
  }))
}

export const processRewardRecords = (records:any[]):RewardRecord[] => {
  return records.map(record => ({
    game_id: record.game_id,
    cycle_number: record.cycle_number,
    stat_name: record.stat_name,
    total_reward: record.total_reward,
    rewarded_players: record.rewarded_players,
    player_rewards: record.player_rewards,
    distribution_time: record.distribution_time
  }))
}

export const getHighScores = (scores:GameScore[], gameId:number, cycleName:number, statName:string) => {
  return scores
    .filter(score => score.game_id === gameId && score.cycle_number === cycleName && score.scores[statName] !== undefined)
    .sort((a, b) => (b.scores[statName] ?? 0) - (a.scores[statName] ?? 0)) // Using nullish coalescing operator
}

export const getGameRewards = (rewards:RewardRecord[], gameId:number, cycleName:number, statName:string) => {
  return rewards
    .filter(reward =>
      reward.game_id === gameId &&
      reward.cycle_number === cycleName &&
      reward.stat_name === statName)
    .sort((a, b) => new Date(b.distribution_time).getTime() - new Date(a.distribution_time).getTime())
}

export const getAllTimeHighScores = (scores:GameScore[], gameId:number, statName:string) => {
  return scores
    .filter(score => score.game_id === gameId && score.scores[statName] !== undefined)
    .sort((a, b) => (b.scores[statName] ?? 0) - (a.scores[statName] ?? 0))
}
