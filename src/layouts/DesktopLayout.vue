<template lang="pug">
q-layout.relative-position
  q-header(color="primary")
    q-toolbar(color="primary")
      //- h6.no-margin.font-comfortaa(style="text-overflow: ellipsis;white-space: nowrap") boid
      img(src="/boid_logo.png" height="40").q-pa-xs
      .centered.full-width
        q-tabs.gt-sm(v-bind="tabs")
          q-route-tab(v-for="tab of nav" v-bind="tab" :key="tab.label")
      q-btn(icon="settings" @click="showSettings()")
      q-btn(v-if="!acct.loggedIn" label="login" @click="login" icon="person" :stack="false" style="width:150px;")
      q-btn(v-else icon="person" :label="acct.loggedIn" style="width:250px;")
        q-menu(dense separator).no-border-radius
          q-list.bg-grey-1.text-red
            q-item.text-primary.text-weight-bold(clickable v-close-popup @click="$router.push({name:'account',params:{name:acct.loggedIn}})")
              q-item-section(avatar)
                q-icon(name="manage_accounts")
              q-item-section
                q-item-label.text-grey-8 My Account
              q-item-section(side)
            q-separator
            q-item.text-primary.text-weight-bold(clickable v-close-popup @click="login")
              q-item-section(avatar)
                q-icon(name="person_add")
              q-item-section
                q-item-label.text-grey-8 Add Account
              q-item-section(side)
            q-separator
          q-item(v-close-popup v-for="key,name in acct.saved" :key="name" clickable)
            q-item-section.cursor-pointer(@click="acct.login(name,true)")
              q-item-label {{ name }}
            q-item-section(side)
              q-btn(icon="delete" color="red" dense size="sm" rounded @click="acct.delSaved(name)")
          q-item.text-primary.text-weight-bold(clickable v-close-popup @click="user.login()")
            q-item-section(avatar)
              q-icon(name="login")
            q-item-section
              q-item-label.text-grey-8 Anchor Login
            q-item-section(side)
          q-item.text-primary.text-weight-bold(clickable v-close-popup @click="user.logout()" v-for="session of link.getSessions()")
            q-item-section(avatar)
              q-icon(name="login")
            q-item-section
              q-item-label.text-grey-8(v-if="session") {{session.auth.actor}}
            q-item-section(side)
          q-separator

  q-page-container
    router-view
</template>

<style lang="sass">

.boid-tabs
  color: $grey-1
</style>

<script lang="ts">
import { defineComponent, ref } from "vue"
import EssentialLink from "components/EssentialLink.vue"
// import LoginButton from '../components/menus/LoginButton.vue'
import { linkAccount } from "src/stores/linkAccount"
import { link } from "src/lib/linkManager"
import { ChainId, PermissionLevel, PermissionLevelType } from "anchor-link"
import { Dialog, QRouteTabProps, QTabsProps } from "quasar"
import { boidAccount } from "src/stores/boidAccount"
import Settings from "src/components/dialog/Settings.vue"
import { mainNav } from "src/router/routes"

const tabs:QTabsProps = {
  activeBgColor: "secondary",
  activeColor: "white",
  indicatorColor: "transparent",
  narrowIndicator: true,
  inlineLabel: true,
  shrink: true,
  stretch: true,
  contentClass: "boid-tabs"
}
export default defineComponent({
  name: "MainLayout",
  components: {
  },
  setup() {
    return { tabs, acct: boidAccount(), nav: mainNav }
  },
  data() {
    return { user: linkAccount(), link, showDialog: false }
  },
  mounted() {
    console.log(this.$route)
  },
  methods: {
    showSettings() {
      // Dialog.create({ message: "hi", persistent: true })
      this.$q.dialog({
        component: Settings,
        persistent: true
      }).onOk(() => {
        console.log("done")
      })
      // Dialog.create({
      //   component: Settings,
      //   cancel: false,
      //   persistent: true
      // }).onDismiss(() => {
      //   console.log("dismissed")
      // })
    },
    login() {
      this.$router.push({ name: "login" })
      // console.log("click login")
      // link.login()
    },
    logout() {
      console.log("click logout, delete session")
      link.logout()
    },
    deleteSession(permissionlevel:PermissionLevelType, chainId:string) {
      console.log("delete session")
      link.deleteSession(PermissionLevel.from(permissionlevel), ChainId.from(chainId))
    }
  },
  computed: {
    loggedIn():boolean {
      return Boolean(this.acct.loggedIn)
    },
    logoImage():string {
      // if (this.user.getLoggedIn) return this.getNetworkByChainId(this.user.getLoggedIn.chainId).logo
      return " "
    },
    userAuth():string {
      if (this.user.getLoggedIn) return this.user.getLoggedIn?.auth?.actor.toString() || " "
      else return " "
    }
  }
})
</script>
