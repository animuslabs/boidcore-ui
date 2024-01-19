import { UInt16, Bytes } from "anchor-link"
import { date } from "quasar"
import { trpc } from "src/lib/trpc"
import { sysTables } from "src/stores/sysTables"
import { ref } from "vue"

export function toObject(data:Record<string, any>):Record<string, any> {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === "bigint"
      ? value.toString()
      : value // return everything else unchanged
  ))
}
export const sleep = (ms:number) => new Promise(res => setTimeout(res, ms))
export function roundStartTime(round:number|UInt16) {
  const { roundLengthMs, roundsStartedMs } = getTimeData()
  return new Date(roundsStartedMs + ((parseInt(round.toString()) * roundLengthMs)))
}
function getTimeData() {
  const sys = sysTables()
  const data = {
    roundLengthMs: 3600000,
    roundsStartedMs: 1697766227000
  }
  if (sys.config) {
    data.roundLengthMs = sys.config.time.round_length_sec.toNumber() * 1000
    data.roundsStartedMs = sys.config.time.rounds_start_sec_since_epoch.toNumber() * 1000
  }
  return data
}

export function currentRound():number {
  const { roundLengthMs, roundsStartedMs } = getTimeData()
  return Math.floor((Date.now() - roundsStartedMs) / roundLengthMs)
}

export function validName(name:string) {
  const regex = /(^[a-z1-5.]{0,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/
  return Boolean(regex.exec(name))
}

export let dateNow = ref(Date.now())
setInterval(() => dateNow.value = Date.now(), 10000)

export function getErrorMessage(error:unknown):string | undefined {
  if (error instanceof Error) {
    return error.message
  } else if (typeof error === "string") {
    return error
  } else {
    return
  }
}
export function toFixed(num:number, precision:number):string {
  return num.toFixed(precision)
}

export async function bytesToJson<T>(bytes:Bytes):Promise<T> {
  try {
    // Step 1: Decode bytes to string
    const decoder = new TextDecoder() // Assumes UTF-8 encoding
    const jsonString = decoder.decode(bytes.array)

    // Step 2: Parse string to JSON
    const data = JSON.parse(jsonString)

    return data
  } catch (error) {
    console.error("Error converting bytes to JSON:", error)
    throw new Error("Error converting bytes to JSON" + error)
  }
}
