import { UInt16, Bytes, UInt16Type } from "anchor-link"
import ms from "ms"
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
export function getTimeData() {
  const sys = sysTables()
  return {
    roundLengthMs: (sys.config?.time.round_length_sec?.toNumber() || 46800) * 1000,
    roundsStartedMs: (sys.config?.time.rounds_start_sec_since_epoch?.toNumber() || 1705967066) * 1000
  }
}

export function roundsToDays(numRounds:UInt16Type) {
  const data = getTimeData()
  const oneDay = ms("1d") / data.roundLengthMs
  return oneDay * parseInt(numRounds.toString())
}

export function currentRound():number {
  const { roundLengthMs, roundsStartedMs } = getTimeData()
  return Math.floor((Date.now() - roundsStartedMs) / roundLengthMs)
}
export function currentRoundProgress():number {
  const { roundLengthMs, roundsStartedMs } = getTimeData()
  return (Date.now() - roundsStartedMs) / roundLengthMs
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

export function downloadStringAsTextFile(content:string, filename:string) {
  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
