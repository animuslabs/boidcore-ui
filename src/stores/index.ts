import { store } from "quasar/wrappers"
import { createPinia } from "pinia"
import { Router } from "vue-router"
import * as linkManager from "src/lib/linkManager"
import { boidAccount } from "src/stores/boidAccount"

declare module "pinia" {
  export interface PiniaCustomProperties {
    readonly router:Router;
  }
}

export default store((/* { ssrContext } */) => {
  const pinia = createPinia()

  linkManager.init()

  return pinia
})
