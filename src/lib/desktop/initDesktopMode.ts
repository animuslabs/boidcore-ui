
import { MacOSAutoLauncher, LinuxAutoLauncher, WindowsAutoLauncher, AutoLauncher, initAutoLauncher } from "./autoLauncher"
import config from "./config"

import { invoker } from "./invoker"
import { getErrorMessage } from "src/lib/util"

export async function initDesktopMode() {
  try {
    console.log("initializing Desktop Mode")
    await config.init()
    await initAutoLauncher()
    // // setup autoLauncher
    // const osType = await tauri.os.type()
    // invoker.infoLogger("OS TYPE: " + osType)
    // const appPath = await tauri.invoke("get_this_binary") as string // this is not the same as appDir: appPath -> appDir
    // invoker.infoLogger("get_this_binary : " + appPath)
    // let osAutoLauncher
    // if (osType === "Darwin") {
    //   osAutoLauncher = new MacOSAutoLauncher({ appName, appPath, native })
    // } else if (osType === "Windows_NT") {
    //   // From Windows 11 Tests: get_this_binary returns a string with a prefix "\\?\" on C:\Users......". On boot, autostart can't locate "\\?\c:\DIR\subspace-desktop.exe
    //   const winAppPath = appPath.startsWith("\\\\?\\") ? appPath.replace("\\\\?\\", "") : appPath
    //   osAutoLauncher = new WindowsAutoLauncher({ appPath: winAppPath, appName, native })
    // } else {
    //   osAutoLauncher = new LinuxAutoLauncher({ appName, appPath, configDir: await tauri.path.configDir() })
    // }

    // const initAutoLauncher = new AutoLauncher({ config, osAutoLauncher })
    // await initAutoLauncher.init()
  } catch (error) {
    invoker.errorLogger(getErrorMessage(error))
  }
}
