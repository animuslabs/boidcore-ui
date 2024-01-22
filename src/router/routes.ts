import { QRouteTabProps } from "quasar"
import { RouteRecordRaw } from "vue-router"

const routes:RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "home", component: () => import("pages/IndexPage.vue") },
      { path: "/login", name: "login", component: () => import("pages/Login.vue") },
      { path: "/a/:name?", name: "account", component: () => import("pages/Account.vue") },
      { path: "/join", name: "join", component: () => import("pages/Join.vue") },
      { path: "/sponsor", name: "sponsor", component: () => import("pages/Sponsor.vue") },
      { path: "/wallet", name: "wallet", component: () => import("pages/Wallet.vue") },
      { path: "/t/:name?", name: "team", component: () => import("pages/Team.vue") },
      { path: "/booster/:id?", name: "booster", component: () => import("pages/Boosters.vue") },
      { path: "/offer/:id?", name: "offer", component: () => import("pages/Offers.vue") }
    ]
  },
  {
    path: "/desktop",
    name: "desktop",
    component: () => import("layouts/DesktopLayout.vue"),
    children: [
      { path: "/desktop/home", name: "desktopHome", component: () => import("src/pages/desktop/DesktopHome.vue") }

    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue")
  }
]

export default routes

export const mainNav:QRouteTabProps[] = [
  { icon: "home", label: "Home", to: { name: "home" } },
  { icon: "account_balance_wallet", label: "Wallet", to: { name: "wallet" } },
  { icon: "groups", label: "Acounts", to: { name: "account" } },
  { icon: "fa-solid fa-gift", label: "Sponsor", to: { name: "sponsor" } },
  { icon: "person_add", label: "Join", to: { name: "join" } },
  { icon: "workspaces", label: "Teams", to: { name: "team" } },
  { icon: "fa-solid fa-cloud-bolt", label: "Boosters", to: { name: "boster" } },
  { icon: "swap_horiz", label: "Offers", to: { name: "offer" } }
]
