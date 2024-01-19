import { ABISerializableConstructor, ABISerializableObject, ABISerializableType, Name, NameType, Struct, UInt64, API, Int64Type } from "anchor-link"
import config from "src/lib/config"
import { Account, AcctMeta, Config, Global, Invite, Offer, Sponsor, Team, Booster, Stake, DelegStake } from "src/lib/types/boid.system"
import { link } from "./linkManager"

export async function getFullTable<T extends ABISerializableConstructor>(params:{code:NameType, table:NameType, scope?:NameType}, type:T):Promise<InstanceType<T>[]> {
  let lower_bound:any = null
  const rows:InstanceType<T>[] = []
  async function loop():Promise<void> {
    const result = await link.rpc.get_table_rows(Object.assign(params, { limit: 100, type, lower_bound }))
    result.rows.forEach(el => rows.push(el))
    if (result.more) lower_bound = result.next_key
    else return
    return loop()
  }
  await loop()
  return rows
}
/**
 * Returns account info or null for missing acct
 * @export
 * @param {NameType} acctName account to query
 */
export async function getAccountInfo(acctName:NameType) {
  try {
    return await link.rpc.get_account(acctName)
    // const result = await link.client.provider.call("/v1/chain/get_account", { account_name: acctName })
    // if (result.status != 200) return null
    // else return result.json
  } catch (error) {
    if (error) console.error(error.toString())
    console.error("error getting account:", acctName.toString())
    return null
  }
}

export async function getTable<T extends ABISerializableConstructor>(table:NameType, type:T, scope?:NameType, code:NameType = config.contracts.system):Promise<null | Array<InstanceType<T>>> {
  return getFullTable({ code, table, scope }, type)
}

async function getAccountStakes(account:Name) {
  const result = await link.rpc.get_table_rows({ table: "stakes", code: config.contracts.system, index_position: "secondary", lower_bound: account, upper_bound: account, type: DelegStake, limit: 1000 })
  return result.rows
}

export async function getRow<T extends ABISerializableConstructor>(table:NameType, lower_bound:NameType | Int64Type, keyName:keyof InstanceType<T>, type:T, scope?:NameType, code:NameType = config.contracts.system):Promise<null | InstanceType<T>> {
  if (typeof lower_bound == "string") lower_bound = Name.from(lower_bound)
  if (typeof lower_bound == "number") lower_bound = UInt64.from(lower_bound)
  const params = { table, code, lower_bound, limit: 1, type, scope }
  console.log(JSON.stringify(params, null, 2))
  const result = await link.rpc.get_table_rows(params)
  if (result.rows.length > 0) {
    const row = result.rows[0]
    console.log(JSON.stringify(row))

    if (!row) return null
    const target = row[keyName] as Name | UInt64
    if (!target) return null
    if (target.toString() == lower_bound.toString()) return row
  }
  return null
}
async function getSingleton<T extends ABISerializableConstructor>(table:NameType, type:T, code:NameType = config.contracts.system):Promise<null | InstanceType<T>> {
  const result = await link.rpc.get_table_rows({ table, code, limit: 1, type })
  if (result.rows[0]) return result.rows[0]
  else return null
}

export const sysQueries = {
  accounts: (boidId:NameType) => getRow("accounts", boidId, "boid_id", Account),
  boosters: (booster_id:Int64Type) => getRow("boosters", booster_id, "booster_id", Booster),
  offers: (offer_id:Int64Type) => getRow("offers", offer_id, "offer_id", Offer),
  sponsors: (boidId:NameType) => getRow("sponsors", boidId, "sponsor_boid_id", Sponsor),
  teams: (teamId:Int64Type) => getRow("teams", teamId, "team_id", Team),
  acctmeta: (boidId:NameType) => getRow("acctmeta", boidId, "boid_id", AcctMeta),
  invites: (boidId:NameType) => getTable("invites", Invite, boidId),
  stakes: (boidId:NameType) => getAccountStakes(Name.from(boidId)),
  invite: (sponsorId:NameType, inviteCode:UInt64|string|number) => getRow("invites", UInt64.from(inviteCode), "invite_code", Invite, sponsorId),
  global: () => getSingleton("global", Global),
  config: () => getSingleton("config", Config)
}
