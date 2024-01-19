import { NameType } from "anchor-link"
import { history } from "src/lib/trpc"
import ms from "ms"

export async function accountFeed(boid_id:NameType, page = 1) {
  page--
  if (page < 0) page = 0
  let start = new Date(Date.now() - ms("90d"))
  start.setHours(0)
  start.setSeconds(0)
  start.setMinutes(0)
  start.setMilliseconds(0)
  const result = await history.actions.query({
    actions: ["account.edit", "account.free", "auth.addkey", "auth.rmkey", "internalxfer", "invite.add", "invite.claim", "offer.claim", "owner.add", "owner.rm", "pwrmod.add", "pwrmod.rm", "stake", "stake.deleg", "team.change", "unstake.init", "unstake.stop", "unstake.end", "withdraw"],
    // actions: ["account.edit"],
    skip: page * 20,
    filter: { boid_id: boid_id.toString() },
    // start: start.toISOString(),
    limit: 100,
    sort: "desc"
  })
  console.log(result)
  return result
}
// export async function accountFeed(boid_id:NameType, page = 0) {
//   const result = await history.actions.query({
//     actions: ["logpwradd", "logpwrclaim"],
//     skip: page * 20,
//     filter: { boid_id: boid_id.toString() },
//     start: new Date(Date.now() - ms("90d")).toISOString(),
//     limit: 100
//   })
//   console.log(result)
//   return result
// }
