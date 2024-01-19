import { defineStore } from "pinia"
import { LinkSession, NameType, PermissionLevelType, PrivateKey } from "anchor-link"
import { markRaw, reactive, shallowReactive } from "vue"
import { LocalStorage, SessionStorage } from "quasar"
const savedStoreKey = "savedBoidAccounts"
const savedLoggedInKey = "savedLoggedIn"

function getSavedAccounts() {
  const sessionSaved = SessionStorage.getItem(savedStoreKey) || {}
  const localSaved = LocalStorage.getItem(savedStoreKey) || {}
  const saved = Object.assign(localSaved, sessionSaved) as Record<string, string>
  const typed:Record<string, PrivateKey> = {}
  for (const acctName of Object.keys(saved)) {
    try {
      const stringKey = saved[acctName]
      if (typeof stringKey == "string") typed[acctName] = markRaw(PrivateKey.fromString(stringKey))
    } catch (error) {
      console.log(acctName, error)
    }
  }
  return typed
}

function getLoggedIn(store:LocalStorage|SessionStorage) {
  return store.getItem(savedLoggedInKey) as string | null
}
function setLoggedIn(newData:string|null, store:LocalStorage|SessionStorage) {
  return store.set(savedLoggedInKey, newData)
}

interface BoidAccountState {
  loggedIn:string | null
  saved:Record<string, PrivateKey>
}
// const freshState = new BoidAccountState()

export const boidAccount = defineStore({
  id: "boidAccount",
  state: ():BoidAccountState => (reactive({
    loggedIn: null,
    saved: getSavedAccounts()
  })),
  getters: {

  },
  actions: {
    loadSaved() {
      this.saved = getSavedAccounts()
    },
    restoreLogin() {
      console.log("restore login...")

      const sessionLogin = getLoggedIn(SessionStorage)
      if (typeof sessionLogin == "string") return this.login(sessionLogin, false)
      const localLogin = getLoggedIn(LocalStorage)
      if (typeof localLogin == "string") return this.login(localLogin, true)
    },
    login(acctName:NameType, saveAccount = true) {
      console.log("logging in:", acctName.toString())
      const store = saveAccount ? LocalStorage : SessionStorage
      store.set(savedLoggedInKey, acctName.toString())
      const clear = !saveAccount ? LocalStorage : SessionStorage
      // clear.set(savedLoggedInKey, null)
      clear.remove(savedLoggedInKey)
      this.loggedIn = acctName.toString()
    },
    logout() {
      this.loggedIn = null
    },
    saveAcct(acctName:NameType, key:PrivateKey, saveAccount = true) {
      let existing:Record<string, string> = {}
      const store = saveAccount ? LocalStorage : SessionStorage
      existing = store.getItem(savedStoreKey) || {}
      existing[acctName.toString()] = key.toString()
      store.set(savedStoreKey, existing)
      this.loadSaved()
    },
    delSaved(acctName:NameType) {
      let sessionSaved = (SessionStorage.getItem(savedStoreKey) || {}) as Record<string, string>
      let localSaved = (LocalStorage.getItem(savedStoreKey) || {}) as Record<string, string>
      if (sessionSaved[acctName.toString()]) {
        delete sessionSaved[acctName.toString()]
        SessionStorage.set(savedStoreKey, sessionSaved)
      }
      if (localSaved[acctName.toString()]) {
        delete localSaved[acctName.toString()]
        LocalStorage.set(savedStoreKey, localSaved)
      }
      if (acctName.toString() == this.loggedIn) this.logout()
      this.loadSaved()
    },
    clearSaved() {
      this.saved = {}
      LocalStorage.remove("savedBoidAccounts")
    }
  }
})
