import { defineStore } from "pinia"
import { reactive, type UnwrapNestedRefs, type UnwrapRef } from "vue"
import { link } from "src/lib/linkManager"
import { LinkSession, PermissionLevelType, NameType } from "anchor-link"

const state = reactive({
  account: null as null | string,
  auth: null as null | PermissionLevelType,
  chainId: null as null | string,
  wallet: null as null | NameType
})

export const linkAccount = defineStore({
  id: "linkAccount",
  state: ():UnwrapNestedRefs<typeof state> => state,
  getters: {
    getLoggedIn: (state) => {
      return state.account != null ? state : null
    }
  },
  actions: {
    setUser(session:LinkSession | false) {
      this.account = session ? session.auth.actor.toString() : null
      this.auth = session ? session.auth : null
      this.chainId = session ? session.chainId.toString() : null
      this.wallet = session ? session.metadata.name : null
    },
    async login() {
      try {
        await link.login()
      } catch (error) {
        console.error("Login failed:", error)
      }
    },
    async logout() {
      try {
        await link.logout()
      } catch (error) {
        console.error("Logout failed:", error)
      }
    }
  }
})
