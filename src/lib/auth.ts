import { AnyAction, Bytes, KeyType, Name, PrivateKey, Serializer, UInt32, UInt8 } from "anchor-link"
import { sha256 } from "hash.js"
import { getAbi } from "src/lib/transact"
import { sysTables } from "src/stores/sysTables"
import config from "./config"
import { boidAccount } from "src/stores/boidAccount"

export function keyFromString(string:string):PrivateKey {
  const hash = sha256().update(string).digest()
  const bytes = Bytes.from(hash)
  const key = new PrivateKey(KeyType.K1, bytes)
  return key
}

export async function signActions(privKey:PrivateKey, actions:AnyAction[], nonce:UInt8, expires_utc_sec:UInt32) {
  const abi = await getAbi(config.contracts.system)
  const global = sysTables().global
  const state = boidAccount()
  const boid_id = state.loggedIn
  if (!boid_id) throw (new Error("login first to transact"))

  const message = Serializer.encode({ object: actions, abi, type: "Action[]" })
  const nonceBytes = Serializer.encode({ type: "uint8", object: nonce })
  const expiresBytes = Serializer.encode({ type: "uint32", object: expires_utc_sec })
  const chainNameBytes = Serializer.encode({ type: Name, object: global.chain_name })
  const accountBytes = Serializer.encode({ type: Name, object: boid_id })

  message.append(nonceBytes)
  // message.append(expiresBytes)
  // message.append(chainNameBytes)
  // message.append(accountBytes)

  const sig = privKey.signMessage(message.array)
  return sig
}
