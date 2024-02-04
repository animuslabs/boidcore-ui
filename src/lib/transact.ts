import { ABI, Action, AnyAction, Asset, Name, NameType, PrivateKey, PublicKey, PublicKeyType, Serializer, UInt32, UInt64, UInt64Type, UInt8, Bytes, UInt8Type } from "anchor-link"
import config from "./config"
import { link } from "./linkManager"
import { Transfer } from "./types/token.types"
import { Dialog, Notify, LoadingBar } from "quasar"
import { Account, AccountAuth, AccountBuy, AccountCreate, AccountEdit, AccountFree, AuthAddkey, Internalxfer, InviteAdd, InviteBuy, InviteRm, OfferClaim, OwnerAdd, OwnerRm, PowerClaim, Stake, StakeDeleg, TeamChange, UnstakeEnd, UnstakeInit, UnstakeStop, UnstkeDeleg, Withdraw } from "src/lib/types/boid.system"
import { boidAccount } from "src/stores/boidAccount"
import vue from "vue"
import { sysQueries } from "src/lib/queries"
import ax from "axios"
import { trpc } from "src/lib/trpc"
import { sleep, toObject } from "src/lib/util"
import { sysTables } from "src/stores/sysTables"
import { signInviteCode } from "src/lib/invites"
import { signActions } from "src/lib/auth"

function getAuth() {
  return [link.session?.auth || { actor: config.contracts.system, permission: "active" }]
}
export function createAct(name:string, data:Record<string, any> = {}, account = config.contracts.system, auth = getAuth()) {
  return Action.from({ account, name, authorization: auth, data })
}

export const sysActions = {
  accountEdit: (meta:Bytes) => createAct("account.edit", AccountEdit.from({ meta, boid_id: boidAccount().loggedIn || "" })),
  rmSponsor: () => createAct("account.free", AccountFree.from({ boid_id: boidAccount().loggedIn })),
  addKey: (key:PublicKeyType, boid_id = boidAccount().loggedIn, auth:any = getAuth()) => createAct("auth.addkey", AuthAddkey.from({ boid_id, key }), config.contracts.system, auth),
  buyInvites: (quantity:number) => createAct("invite.buy", InviteBuy.from({ boid_id: boidAccount().loggedIn, quantity })),
  addInvite: (invite_code:number|UInt32|UInt64, key:PublicKeyType) => createAct("invite.add", InviteAdd.from({ boid_id: boidAccount().loggedIn, invite_code, key })),
  rmInvite: (invite_code:number|UInt32|UInt64) => createAct("invite.rm", InviteRm.from({ sponsor_boid_id: boidAccount().loggedIn, invite_code })),
  stake: (quantity:number | UInt32) => createAct("stake", Stake.from({ quantity, boid_id: boidAccount().loggedIn })),
  delegateStake: (stake_quantity:number | UInt32, to_boid_id:NameType, lock_until_round:number) => createAct("stake.deleg", StakeDeleg.from({ from_boid_id: boidAccount().loggedIn, to_boid_id, stake_quantity, lock_until_round })),
  endDelegStake: (stake_id:UInt64Type) => createAct("unstke.deleg", UnstkeDeleg.from({ stake_id })),
  unstakeInit: (quantity:number |UInt32|string) => createAct("unstake.init", UnstakeInit.from({ boid_id: boidAccount().loggedIn, quantity })),
  endUnstake: () => createAct("unstake.end", UnstakeEnd.from({ boid_id: boidAccount().loggedIn })),
  stopUnstake: () => createAct("unstake.stop", UnstakeStop.from({ boid_id: boidAccount().loggedIn })),
  withdraw: (quantity:number|UInt32, to:NameType) => createAct("withdraw", Withdraw.from({ boid_id: boidAccount().loggedIn, quantity, to })),
  internalxfer: (quantity:number | UInt32, to_boid_id:NameType, memo = "") => createAct("internalxfer", Internalxfer.from({ from_boid_id: boidAccount().loggedIn, quantity, to_boid_id, memo })),
  claimOffer: (offer_id:UInt64Type, required_nft_action_ids:UInt64Type[] = []) => createAct("offer.claim", OfferClaim.from({ boid_id: boidAccount().loggedIn, offer_id, required_nft_action_ids })),
  acctBuy: (data:{ boid_id:NameType, keys:PublicKeyType[], owners:NameType[] }) => createAct("account.buy", AccountBuy.from({ payer_boid_id: boidAccount().loggedIn, new_account: data })),
  pwrClaim: () => createAct("power.claim", PowerClaim.from({ boid_id: boidAccount().loggedIn })),
  addOwner: (owner:NameType) => createAct("owner.add", OwnerAdd.from({ boid_id: boidAccount().loggedIn, owner })),
  rmOwner: (owner:NameType) => createAct("owner.add", OwnerRm.from({ boid_id: boidAccount().loggedIn, owner })),
  changeTeam: (new_team_id:UInt8Type, new_pwr_tax_mult:UInt8Type) => createAct("team.change", TeamChange.from({ boid_id: boidAccount().loggedIn, new_team_id, new_pwr_tax_mult }))
}

export async function doActions(actions:AnyAction[], alert = true) {
  try {
    const result = await link.transact({ actions })
    if (!result) return
    Notify.create({
      message: "Transaction Success",
      color: "positive",
      actions: [
        {
          icon: "link",
          href: config.explorer + "/transaction/" + result.transaction.id
        }
      ]
    })
    return result
  } catch (error:any) {
    console.log(error)
    Notify.create({
      message: "Transaction Failed!",
      color: "negative"
    })
  }
}

const abiCache:Record<string, ABI.Def> = {}
export async function getAbi(contract:NameType) {
  let abi:ABI.Def|undefined = abiCache[contract.toString()]
  if (!abi) {
    abi = (await link.rpc.get_abi(contract)).abi
    if (abi) abiCache[contract.toString()] = abi
  }
  if (!abi) {
    throw new Error(`No ABI for ${contract}`)
  }
  return abi
}

export async function getAuthEndpoints() {
  return ["http://localhost:8017"]
}

interface AdditionalType {
  accountMeta?:Record<string, unknown>
  teamMeta?:Record<string, unknown>
}
export async function sendAuthActions(actions:AnyAction[], additional?:AdditionalType, auth?:AccountAuth) {
  if (link.session?.auth) return doActions(actions)
  let notify
  try {
    const state = boidAccount()
    const boid_id = state.loggedIn
    if (!boid_id) throw (new Error("login first to transact"))
    const key = state.saved[boid_id]
    if (!key) throw new Error("key missing for account: " + boid_id)
    const pubkey = key.toPublic()
    if (!auth) {
      const row = await sysQueries.accounts(boid_id)
      if (!row) throw new Error("boid account not found")
      else auth = row.auth
    }
    const keyIndex = auth.keys.findIndex(el => el.equals(pubkey))
    if (keyIndex == -1) throw new Error("provided key doesn't exist on account auth")
    console.log(actions[0]?.data)
    const expires_utc_sec = Date.now() / 1000 + 10
    const body = {
      actions: actions as any,
      boid_id,
      keyIndex,
      sig: (await signActions(key, actions, auth.nonce, UInt32.from(expires_utc_sec))).toString(),
      expires_utc_sec,
      additional
    }
    console.log("data", body)

    notify = transactNotify()
    //@ts-ignore
    const result = await trpc.pushActions.mutate(body)
    console.log(result)
    transactNotify(result, notify)
    if (!result) Dialog.create({ message: "Error: " + result })
    await sleep(1000)
    return result
  } catch (error:any) {
    console.error(error)
    transactNotify(error.toString(), notify, true)
  }
}
interface CreateType {boid_id:NameType, keys:PublicKey[], owners:NameType[]}

function transactNotify(data?:any, cb?:any, error = false) {
  if (!data) {
    LoadingBar.start(15)
    return Notify.create({ message: "transaction pushed...", spinner: true, group: false, timeout: 8000, color: "primary" })
  } else {
    LoadingBar.stop()
    if (!cb) return
    cb({ // eslint-disable-line n/no-callback-literal
      message: error ? "Transaction Failed" : "Transaction Finished",
      spinner: false,
      color: error ? "red" : "primary",
      actions: [
        {

          label: "Details",
          color: "green",
          handler: () => {
            Dialog.create({
              title: "transaction result",
              message: `<pre> ${JSON.stringify(data, null, 2)} <pre/>`,
              html: true,
              fullWidth: true
            })
          }
        }

      ]

    }) // eslint-disable-line n/no-callback-literal
  }
}

export async function sendInviteClaimAction(create:CreateType, sponsor_boid_id:string, invite_code:number, claimKey:PrivateKey) {
  const notify = transactNotify()
  try {
    const new_account = AccountCreate.from(create)
    const data = {
      sponsor_boid_id,
      invite_code,
      sig: (await signInviteCode(claimKey, invite_code, new_account)).toString(),
      new_account: JSON.parse(JSON.stringify(new_account))
    }
    //@ts-ignore
    const result = await trpc.claimInvite.mutate(data)
    console.log(result)
    transactNotify(result, notify)
    return result
  } catch (error:any) {
    console.error(error)
    alert(error.toString())
    transactNotify(error, notify, true)
  }
}
