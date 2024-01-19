import { boot } from "quasar/wrappers"
import { getName } from "@tauri-apps/api/app"
import config from "src/lib/config"
//@ts-ignore
window.global ||= window

export default boot(async({ app }) => {
  const appName = await getName().catch(_err => console.log("not running in desktop mode"))
  if (appName == "boid-desktop") {
    console.log("running in desktop mode")
    config.desktopMode = true
    const { initDesktopMode } = await import("../lib/desktop/initDesktopMode")
    await initDesktopMode()
  }

  // // create Config instance and initialize it
  // const configDir = await tauri.path.configDir()
  // const config = new Config({ appName: APP_NAME, configDir, tauri: tauriInvoker })

  // try {
  //   await config.init()
  //   // make config available as global prop
  //   app.config.globalProperties.$config = config
  // } catch (error) {
  //   tauriInvoker.errorLogger(error)
  //   store.setError({ title: "errorPage.initConfigFailed" })
  // }

  // // set node name from config (empty string is default value)
  // const { nodeName } = (await config.readConfigFile())
  // store.setNodeName(config, nodeName)

  // try {
  //   await initUpdater(tauri, store.setHasNewUpdate)
  // } catch (error) {
  //   tauriInvoker.errorLogger(error)
  //   store.setError({ title: "errorPage.initUpdaterFailed" })
  // }

  // // create Client instance
  // const api = createApi(LOCAL_RPC)
  // const client = new Client({ api, config, tauri: tauriInvoker })
  // // make client available as global prop
  // app.config.globalProperties.$client = client

  // // create AutoLauncher instance and initialize it
  // try {
  //   const osType = await tauri.os.type()
  //   tauriInvoker.infoLogger("OS TYPE: " + osType)
  //   // TODO: consider moving inside TauriInvoker
  //   const appPath = await tauri.invoke("get_this_binary") as string // this is not the same as appDir: appPath -> appDir
  //   tauriInvoker.infoLogger("get_this_binary : " + appPath)

  //   let osAutoLauncher

  //   if (osType === "Darwin") {
  //     osAutoLauncher = new MacOSAutoLauncher({ appName: APP_NAME, appPath, native, tauri: tauriInvoker })
  //   } else if (osType === "Windows_NT") {
  //     // From Windows 11 Tests: get_this_binary returns a string with a prefix "\\?\" on C:\Users......". On boot, autostart can't locate "\\?\c:\DIR\subspace-desktop.exe
  //     const winAppPath = appPath.startsWith("\\\\?\\") ? appPath.replace("\\\\?\\", "") : appPath
  //     osAutoLauncher = new WindowsAutoLauncher({ appPath: winAppPath, appName: APP_NAME, native, tauri: tauriInvoker })
  //   } else {
  //     osAutoLauncher = new LinuxAutoLauncher({ appName: APP_NAME, appPath, configDir, tauri: tauriInvoker })
  //   }

  //   const autoLauncher = new AutoLauncher({ config, osAutoLauncher, tauri: tauriInvoker })
  //   await autoLauncher.init()

  //   // make autoLauncher available as global prop
  //   app.config.globalProperties.$autoLauncher = autoLauncher
  // } catch (error) {
  //   tauriInvoker.errorLogger(error)
  //   store.setError({ title: "errorPage.initAutoLauncherFailed" })
  // }

  // app.use(VueApexCharts)

  // // include I18n instance for internationalization
  // const i18n = createI18n({ locale: "en-US", messages })
  // app.use(i18n)
})
