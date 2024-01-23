import { boot } from "quasar/wrappers"
import { LocalStorage } from "quasar"
import AnchorLink, { LinkChannelSession, APIClient, ChainId, LinkSession, PermissionLevel, TransactArgs } from "anchor-link"
import AnchorLinkBrowserTransport from "anchor-link-browser-transport"
import { linkAccount } from "src/stores/linkAccount"
import config, { activeChain } from "src/lib/config"
// const client = new APIClient({ url: "https://eos.api.animus.is" })
// const client = new APIClient({ url: "https://testnet.telos.caleos.io" })
const client = new APIClient({ url: "https://telos.testnet.boid.animus.is" })
// const session:LinkChannelSession = {}
interface StoredSession {
  auth:{actor:string, permission:string},
  chainId:string
}
class LinkManager {
  store:typeof linkAccount
  appName = config.linkData.appName
  session:LinkSession | null = null
  transport = new AnchorLinkBrowserTransport({ storagePrefix: "anchor" })
  client:APIClient = new APIClient({ url: config.linkData.nodeUrl })
  rpc!:typeof client.v1.chain
  link = new AnchorLink({
    transport: this.transport,
    chains: [config.linkData]
  })

  constructor(usrStore:typeof linkAccount) {
    this.store = usrStore
    this.try_restore_session()
  }

  setApi(client:string) {
    const newClient = new APIClient({ url: client })
    this.client = newClient
    this.rpc = newClient.v1.chain
    LocalStorage.set("chainRpc-" + activeChain, client)
  }

  async transact(args:TransactArgs) {
    if (this.session === null) return console.log("no session, login first")
    const res = await this.session.transact(args)
    return res
  }

  async login() {
    const identity = await this.link.login(this.appName)
    if (identity) {
      const { session } = identity
      this.session = session
      console.log(session)

      this.setApi(getRpc())
      this.try_restore_session()
      console.log(session.auth)
    }
  }

  async logout() {
    if (this.session) {
      await this.link.removeSession(
        this.appName,
        this.session.auth,
        this.session.chainId
      )
      this.session = null
      this.setApi(getRpc())
      this.store().setUser(false)
      // this.try_restore_session()
    } else {
      console.log("you can't logout if there is no active session")
    }
  }

  async deleteSession(permissionlevel:PermissionLevel, chainId:ChainId):Promise<void> {
    if (!this.session) return this.link.removeSession(this.appName, permissionlevel, chainId)
    console.log(this.session.auth.equals(permissionlevel))
    console.log(this.session.chainId.equals(chainId))
    if (this.session.auth.equals(permissionlevel) && this.session.chainId.equals(chainId)) {
      console.log("current session")
      this.logout()
    } else {
      await this.link.removeSession(this.appName, permissionlevel, chainId)
    }
  }

  async restore_session(permissionlevel:any, chainId:string):Promise<void> {
    const session = await this.link.restoreSession(
      this.appName,
      permissionlevel,
      chainId
    )
    // console.log(session);
    if (session) {
      this.session = session
      this.setApi(getRpc())
      this.store().setUser(session)
    }
  }

  async try_restore_session():Promise<false | LinkSession> {
    const session = await this.link.restoreSession(this.appName)
    if (session) {
      console.log(
        `${session.chainId} session reestablished for ${session.auth}`
      )
      this.session = session
      this.setApi(getRpc())
      this.store().setUser(session)
      return session
    } else {
      console.log("no saved sessions available")
      this.setApi(getRpc()) // set api to default chain
      return false
    }
  }

  getSessions():StoredSession[] {
    const key = `anchor-${this.appName}-list`
    // const sessions = await this.link.listSessions(this.appName)
    // console.log(sessions)

    if (LocalStorage.has(key)) {
      const data = LocalStorage.getItem(key)?.toString()
      if (data) return JSON.parse(data)
      else return []
    } else {
      return []
    }
  }
}

let link!:LinkManager
function init() {
  if (link) return
  link = new LinkManager(linkAccount)
  link.setApi(getRpc())
}
export function getRpc() {
  return LocalStorage.getItem("chainRpc-" + activeChain) as string || config.linkData.nodeUrl
}

export { link, init }
