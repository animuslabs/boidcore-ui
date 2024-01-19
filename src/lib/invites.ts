import { PrivateKey, Serializer, UInt32, UInt64 } from "anchor-link"
import { LocalStorage } from "quasar"
import { keyFromString } from "src/lib/auth"
import config from "src/lib/config"
import { getAbi } from "src/lib/transact"
import { AccountCreate } from "src/lib/types/boid.system"
import { boidAccount } from "src/stores/boidAccount"

export async function generateNewInvite() {
  const acct = boidAccount()
  const loggedIn = acct.loggedIn
  if (!loggedIn) throw (new Error("not logged in"))
  const code = UInt64.from(UInt32.random())
  console.log(code.toString())
  const key = acct.saved[loggedIn.toString()]
  if (!key) throw new Error("need user key saved locally to generate invite key")
  return {
    key: await keyFromInvite(code),
    code
  }
}

export async function keyFromInvite(inviteCode:UInt64) {
  const acct = boidAccount()
  const loggedIn = acct.loggedIn
  if (!loggedIn) throw (new Error("not logged in"))
  const key = acct.saved[loggedIn.toString()]
  if (!key) throw new Error("need user key saved locally to generate invite key")
  const inviteKey = keyFromString(key.signMessage(inviteCode.byteArray).toString() + loggedIn.toString())
  return inviteKey
}

export async function signInviteCode(privKey:PrivateKey, inviteCode:number, accountCreate:AccountCreate) {
  const createEncoder = Serializer.encode({ object: accountCreate, abi: await getAbi(config.contracts.system), type: AccountCreate })
  const inviteEncoder = Serializer.encode({ type: "uint64", object: UInt64.from(inviteCode) })
  inviteEncoder.append(createEncoder)
  const sig = privKey.signMessage(inviteEncoder.array)
  return sig
}
