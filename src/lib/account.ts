import { AccountMeta } from "src/lib/types/types"

export class ParsedAccountMeta {
  text:{
    tagline:string
    info:string
    eosAccount:string
    telosAccount:string
  } = {
      tagline: "",
      info: "",
      eosAccount: "",
      telosAccount: ""
    }

  media:{
    profile:string
    banner:string
  } = {
      profile: "QmeBTuGXw8Qq65V8kx2sN5VHB5kMaUzCv3vUi1hdGJCc1w",
      banner: ""
    }
}

const findVal = (term:string, arr:[string, string][]) => arr.find(([key, val]) => key == term)
const normalizeArr = (arr:[string, string][] | undefined) => {
  let obj:Record<string, string> = {}
  if (arr) { // Check if arr is defined before calling forEach
    arr.forEach(el => {
      obj[el[0]] = el[1]
    })
  }
  return obj
}

export function parseAccountMeta(meta:AccountMeta | undefined):ParsedAccountMeta {
  let parsed = new ParsedAccountMeta()

  // Check if meta is defined before accessing its properties
  if (meta) {
    parsed.text = Object.assign(parsed.text, normalizeArr(meta.text))
    parsed.media = Object.assign(parsed.media, normalizeArr(meta.media))
  }

  return parsed
}
