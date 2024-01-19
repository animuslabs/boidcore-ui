import { CID } from "multiformats/cid"
import * as json from "multiformats/codecs/json"
import { sha256 } from "multiformats/hashes/sha2"
import { markRaw, reactive, ref, shallowReactive } from "vue"
import ax from "axios"
import { LocalStorage } from "quasar"
import config from "src/lib/config"
import { Bytes } from "anchor-link"
// import { IPFS, create } from "ipfs-core"
const IPFS = (window as any).Ipfs
export let ipfs:any
export async function createIpfs() {
  if (!ipfs) ipfs = await IPFS.create({ offline: true })
  console.log("ifps loaded")
  console.log(await ipfs.version())
  return ipfs
}

// base8.baseEncode()
// @ts-ignore
export async function jsonToCID(data:Record<string, any>):Promise<CID> {
  const bytes = json.encode(data)
  const hash = await sha256.digest(bytes)
  const cid = CID.create(1, json.code, hash)
  return cid
}

export async function jsonToBytes(data:Record<string, any>):Promise<Bytes> {
  const bytes = json.encode(data)
  const gmBytes = Bytes.from(bytes)
  return gmBytes
}

export const ipfsCache:Record<string, any> = shallowReactive({})

export const ipfsGateway = ref(getIpfsGateway())

export function getIpfsGateway():string {
  // return "https://ipfs.eospowerup.io"
  // return "http://localhost:8080"
  const url = LocalStorage.getItem("ipfsurl") || "https://ipfs.boid.com"
  if (!url || typeof url != "string") LocalStorage.remove("ipfsurl")
  return url as string
}
export function setIpfsGateway(url:string) {
  LocalStorage.set("ipfsurl", url)
  ipfsGateway.value = url
}

export async function getIpfs(cid:CID|string):Promise<any | null> {
  if (typeof cid == "string") cid = CID.parse(cid)
  const cache = ipfsCache[cid.toString()]
  console.log("ipfs cache:", cache)
  if (cache) return cache
  const result = await ax.get(`${ipfsGateway.value}/ipfs/${cid.toString()}`).catch(console.error)
  if (!result) return null
  // console.log(result.headers)
  const bytes = await jsonToBytes(result.data)
  console.log("json bytes:", bytes)
  // TODO figure out why cids don't match
  const dataCid = await jsonToCID(result.data)
  console.log(dataCid.toString())
  // from gateway: bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea
  //bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea
  // bafybeiahsrgcz6czdnalzzf4aehc3cigzqy6rwh37dt2guvulabazskdt4
  // console.log(cid.equals(dataCid))
  // console.log(cid.toV1().toString())
  // console.log(dataCid.toString())
  // console.log(dataCid.toString() == cid.toString())
  ipfsCache[cid.toString()] = result.data
  return result.data
}

export function ipfsUrl(cid:CID | string):string {
  return `${ipfsGateway.value}/ipfs/${cid.toString()}`
}

export async function jsonToIpfsCid(json:object):Promise<CID> {
  // Serialize the JSON object as a Uint8Array
  const jsonBuffer = new TextEncoder().encode(JSON.stringify(json))

  // Compute the hash of the serialized JSON
  const hash = await sha256.digest(jsonBuffer)

  // Create a CID with the hash and specify the IPLD codec
  const cid = new CID(1, 1, hash, hash.bytes)

  // // Encode the CID as a base58 string (starts with 'Q')
  // const cidString = cid.toString()

  return cid
}
