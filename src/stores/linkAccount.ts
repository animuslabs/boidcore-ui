import { defineStore } from "pinia"
import { LinkSession, NameType, PermissionLevelType } from "anchor-link"
import { reactive, shallowReactive } from "vue"
import { link } from "src/lib/linkManager"

class LoggedInState {
  account:null | string = null
  auth:null | PermissionLevelType = null
  chainId:null | string = null
  wallet:null | NameType = null
}

export const linkAccount = defineStore({
  id: "linkAccount",
  state: () => (reactive({ loggedIn: new LoggedInState() })),
  getters: {
    getLoggedIn: (state) => {
      const t = state.loggedIn.account != null
      return t ? state.loggedIn : false
    }
  },
  actions: {
    setUser(session:LinkSession | false) {
      console.log("set link user", session)
      this.loggedIn.account = session ? session.auth.actor.toString() : null
      this.loggedIn.auth = session ? session.auth : null
      this.loggedIn.chainId = session ? session.chainId.toString() : null
      this.loggedIn.wallet = session ? session.metadata.name : null
      console.log(this.loggedIn)
    },
    async login() {
      const result = await link.login()
    },
    async logout() {
      const result = await link.logout()
    }
  }
})
