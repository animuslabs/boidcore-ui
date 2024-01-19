import { defineStore } from "pinia"
import { ABISerializable, ABISerializableConstructor, ABISerializableObject, Int64Type, Name, NameType, UInt64 } from "anchor-link"
import { markRaw, Raw, reactive, shallowReactive, UnwrapNestedRefs } from "vue"
import { LocalStorage, SessionStorage } from "quasar"
import { Account, Sponsor, Global, Config, Invite, Stake, Team, Booster, Offer, AcctMeta, DelegStake } from "src/lib/types/boid.system"
import { getFullTable, getTable, sysQueries } from "src/lib/queries"
import config, { activeChain } from "src/lib/config"

export const blankGlobal = Global.from({
  chain_name: activeChain.toLowerCase(),
  total_accounts: 0,
  total_power: 0,
  total_liquid_balance: 0,
  total_stake: 0,
  last_inflation_adjust_round: 0
})

export const blankSponsor = Sponsor.from({
  sponsor_boid_id: "",
  invites_balance: 0,
  invite_codes_unclaimed: 0,
  invite_codes_claimed: 0,
  sponsored_upgrades: 0,
  upgrades_total_earned: 0
})

interface rowMeta<T> {
  lastUpdated:Date
  value:T
}

interface SysTables {
  accounts:Record<string, Raw<Account>>
  sponsors:Record<string, Raw<Sponsor>>
  boosters:Record<string, Raw<Booster>>
  offers:Record<string, Raw<Offer>>
  teams:Record<string, Raw<Team>>
  acctmeta:Record<string, Raw<AcctMeta>>
  invites:Record<string, Raw<Invite[]>>
  stakes:Record<string, Raw<DelegStake[]>>
  global:Raw<Global>
  config:Raw<Config> | null
}

const emptySysTables:SysTables = {
  accounts: shallowReactive({}),
  sponsors: shallowReactive({}),
  invites: shallowReactive({}),
  stakes: shallowReactive({}),
  teams: shallowReactive({}),
  acctmeta: shallowReactive({}),
  boosters: shallowReactive({}),
  offers: shallowReactive({}),
  global: markRaw(blankGlobal),
  config: null
}

export const sysTables = defineStore({
  id: "sysTables",
  state: () => (reactive(emptySysTables)),
  getters: {
  },
  actions: {
    restoreData() {
      for (const key of Object.keys(emptySysTables)) {
        const keys = LocalStorage.getAllKeys().filter(el => el.includes(activeChain + "-" + key))
        // console.log(keys)
        for (const jsonData of keys) {
          try {
            const data = JSON.parse(LocalStorage.getItem(jsonData) as string)
            if (!data) {
              LocalStorage.remove(jsonData)
              continue
            }
            if (key == "accounts") this.accounts[data.boid_id] = markRaw(Account.from(data))
            else if (key == "sponsors") this.sponsors[data.sponsor_boid_id] = markRaw(Sponsor.from(data))
            else if (key == "teams") this.teams[data.team_id.toString()] = markRaw(Team.from(data))
            else if (key == "global") this.global = markRaw(Global.from(data))
            else if (key == "boosters") this.boosters[data.booster_id.toString()] = markRaw(Booster.from(data))
            else if (key == "offers") this.offers[data.offer_id.toString()] = markRaw(Offer.from(data))
            else if (key == "acctmeta") this.acctmeta[data.boid_id.toString()] = markRaw(AcctMeta.from(data))
            // console.log(this.sponsors)
          } catch (error) {
            console.log(error)
            LocalStorage.remove(jsonData)
          }
        }
      }
    },
    loadGlobal: () => loadSingleton("global"),
    loadConfig: () => loadSingleton("config"),
    loadAccount: (boidId:NameType) => loadRow("accounts", boidId),
    loadAcctMeta: (boidId:NameType) => loadRow("acctmeta", boidId),
    loadBooster: (boosterId:Int64Type) => loadRow("boosters", boosterId),
    loadSponsor: (boidId:NameType) => loadRow("sponsors", boidId),
    loadInvites: (boidId:NameType) => loadTable("invites", boidId),
    loadStakes: (boidId:NameType) => loadTable("stakes", boidId),
    loadTeam: (teamId:Int64Type) => loadRow("teams", teamId),
    loadOffer: (offerId:Int64Type) => loadRow("offers", offerId),
    loadTeams: () => loadAllRows("teams", Team, "team_id"),
    loadAccounts: () => loadAllRows("accounts", Account, "boid_id"),
    loadBoosters: () => loadAllRows("boosters", Booster, "booster_id"),
    loadOffers: () => loadAllRows("offers", Offer, "offer_id")
  }

})

function saveLocal(key:string, data:Record<string, any>) {
  LocalStorage.set(`${activeChain}-${key}`, JSON.stringify(data))
}

function clearLocal(key:string):void {
  if (LocalStorage.has(`${activeChain}-${key}`)) LocalStorage.remove(`${activeChain}-${key}`)
}

async function loadRow(
  tableName:"accounts"|"sponsors"|"teams"|"boosters"|"offers"|"acctmeta",
  searchTerm:NameType | Int64Type,
  scope?:NameType | UInt64
) {
  let data
  if (scope) throw new Error("scoped row query not implemented")
  else data = await sysQueries[tableName](searchTerm)
  const key = `${tableName}-${searchTerm.toString()}`
  console.log("loadRow:", tableName, searchTerm, data)
  if (!data) return clearLocal(key)
  sysTables()[tableName][searchTerm.toString()] = markRaw(data)
  saveLocal(key, data)
}

async function loadTable(
  tableName:"invites"|"stakes",
  scope:NameType|UInt64
) {
  const data = await sysQueries[tableName](scope)
  if (!data) return
  sysTables()[tableName][scope.toString()] = markRaw(data)
}

async function loadAllRows<T extends ABISerializableConstructor>(
  tableName:"teams"|"accounts"|"boosters"|"offers",
  type:T,
  keyName:keyof InstanceType<T>,
  scope:Int64Type |NameType = config.contracts.system
) {
  console.log("load all rows:", tableName)

  const rows = await getTable(tableName, type, scope)
  if (!rows) return
  for (const row of rows) {
    const targetKey = row[keyName] as Name | UInt64
    const key = `${tableName}-${targetKey.toString()}`
    sysTables()[tableName][targetKey.toString()] = markRaw(row) as any
    saveLocal(key, row)
  }
}

async function loadSingleton(
  tableName:"global"|"config"
) {
  const data = await sysQueries[tableName]()
  if (!data) return
  sysTables()[tableName] = markRaw(data as any)
  saveLocal(tableName, data)
}
