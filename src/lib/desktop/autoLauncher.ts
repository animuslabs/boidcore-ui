import * as native from "./native"
import { ChildReturnData } from "./types"
import config, { ConfigType } from "./config"
import { invoker } from "./invoker"
import { getErrorMessage } from "src/lib/util"
import * as tauri from "@tauri-apps/api"
const appName = "boid-desktop"

interface WinOrMacAutoLauncherProps {
  appName:string,
  appPath:string,
}

interface LinuxAutoLauncherProps {
  appName:string,
  appPath:string,
  configDir:string;
}

export class LinuxAutoLauncher {
  private appName:string
  private appPath:string
  private configDir:string

  constructor({ appName, appPath, configDir }:LinuxAutoLauncherProps) {
    this.appName = appName
    this.appPath = appPath
    this.configDir = configDir
  }

  public async enable(minimized:boolean):Promise<ChildReturnData> {
    await this.createAutostartDir()
    const response:ChildReturnData = { stderr: [], stdout: [] }
    const hiddenArg = minimized ? " --minimized" : ""
    await invoker.createLinuxAutoLaunchFile(hiddenArg)
    response.stdout.push("success")
    return response
  }

  public async disable():Promise<ChildReturnData> {
    const response:ChildReturnData = { stderr: [], stdout: [] }
    await invoker.removeLinuxAutoLaunchFile()
    response.stdout.push("success")
    return response
  }

  public async isEnabled():Promise<boolean> {
    try {
      await invoker.linuxAutoLaunchFileExist()
      return true
    } catch (error) {
      invoker.errorLogger(error)
      return false
    }
  }

  private async createAutostartDir():Promise<void> {
    const autostartDirectory = this.configDir + "autostart/"
    if (!(await invoker.isDirExist(autostartDirectory))) {
      await invoker.createDir(autostartDirectory)
    }
  }
}

export class MacOSAutoLauncher {
  private appName:string
  private appPath:string

  constructor({ appName, appPath }:WinOrMacAutoLauncherProps) {
    this.appName = appName
    this.appPath = appPath
  }

  public async enable(minimized:boolean):Promise<ChildReturnData> {
    // on macOS, tauri is returning the binary (which is a UnixExecutable). We want the `.app` file instead.
    // appPath -> "/Users/xxx/subspace-desktop.app/Contents/MacOS/subspace-desktop"
    // path -> "/Users/xxx/subspace-desktop.app"
    const path = this.appPath.split("/Contents")[0]
    const isHiddenValue = minimized ? "true" : "false"
    const properties = `{path:"${path}", hidden:${isHiddenValue}, name:"${this.appName}"}`
    return native.execApplescriptCommand(`make login item at end with properties ${properties}`, invoker)
  }

  public async disable():Promise<ChildReturnData> {
    return native.execApplescriptCommand(`delete login item "${this.appName}"`, invoker)
  }

  public async isEnabled():Promise<boolean> {
    const response:ChildReturnData = await native.execApplescriptCommand("get the name of every login item", invoker)
    const loginList = response?.stdout[0]?.split(", ") || []
    const exists = loginList.includes(this.appName)
    console.log("login Item Exists:", exists)
    return exists
  }
}

export class WindowsAutoLauncher {
  private appName:string
  private appPath:string
  private subKey = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"

  constructor({ appName, appPath }:WinOrMacAutoLauncherProps) {
    this.appName = appName
    this.appPath = appPath
  }

  // TODO add support for hidden on windows
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async enable(minimized:boolean):Promise<ChildReturnData> {
    const returnVal = <ChildReturnData>{ stdout: [], stderr: [] }
    const result = await native.winregSet(this.subKey, this.appName, this.appPath)
    if (result.search("success") > -1) {
      returnVal.stdout.push(result)
    } else {
      returnVal.stderr.push(result)
    }
    return returnVal
  }

  public async disable():Promise<ChildReturnData> {
    const returnVal = <ChildReturnData>{ stdout: [], stderr: [] }
    const result = <string>(await native.winregDelete(this.subKey, this.appName))
    if (result.search("success") > -1) {
      returnVal.stdout.push(result)
    } else {
      returnVal.stderr.push(result)
    }
    return returnVal
  }

  public async isEnabled():Promise<boolean> {
    const result = <string>(await native.winregGet(this.subKey, this.appName))
    console.log("isEnabled result:", result)
    if (result.search("The system cannot find the file specified.") > -1) {
      return false
    } else {
      return true
    }
  }
}

interface AutoLauncherParams {
  config:typeof config;
  osAutoLauncher:MacOSAutoLauncher | WindowsAutoLauncher | LinuxAutoLauncher;
}

/**
 * AutoLauncher class responsible for enabling and disabling auto launch for particular OS
 */
export class AutoLauncher {
  private osAutoLauncher:MacOSAutoLauncher | WindowsAutoLauncher | LinuxAutoLauncher
  private enabled = false

  /**
   * Create AutoLauncher instance
   * @param {AutoLauncherParams} params
   * @param {MacOSAutoLauncher | WindowsAutoLauncher | LinuxAutoLauncher} params.osAutoLauncher - internal auto launcher for particular OS
   * @param {Config} params.config - Config class instance to interact with app config file
   */
  constructor({ config, osAutoLauncher }:AutoLauncherParams) {
    this.osAutoLauncher = osAutoLauncher
  }

  // TODO: consider removing this method as redundant - call osAutoLauncher.isEnabled() directly
  /**
   * Check if internal OS auto launcher is enabled
   * @returns {boolean}
   */
  public async isEnabled():Promise<boolean> {
    const result = await this.osAutoLauncher.isEnabled()
    this.enabled = result
    return result
  }

  /**
   * Enable auto launcher and update config file
   * @returns {ChildReturnData} - OS auto launcher result object
   */
  public async enable():Promise<void | ChildReturnData> {
    const child = await this.osAutoLauncher.enable(true)
    this.enabled = await this.isEnabled()
    if (!this.enabled) {
      invoker.errorLogger("ENABLE DID NOT WORK")
    } else {
      await config.update({ launchOnBoot: true })
    }
    return child
  }

  /**
   * Disable auto launcher and update config file
   * @returns {ChildReturnData} - OS auto launcher result object
   */
  public async disable():Promise<void | ChildReturnData> {
    let child
    let trial = 0
    // to remove the previous entries for older versions
    // try at maximum 5 times to prevent infinite loop
    do {
      child = await this.osAutoLauncher.disable()
      this.enabled = await this.isEnabled()
      trial += 1
    } while (this.enabled && trial < 5)
    await config.update({ launchOnBoot: false })
    return child
  }

  /**
   * Read config file and enable auto launcher if necessary
   */
  public async init():Promise<void> {
    const { launchOnBoot } = await config.readConfigFile()
    if (launchOnBoot) {
      // the app may be initialized before, but then user may have decided to move the app to another directory
      // in this case, we have to delete the previous autoLaunch entry, and create a new one
      // below disable is not creating console error, hence use it for this one
      await this.disable()
      await this.enable()
    }
    // if launch preference is `false`, we don't need to do anything here, it should stay as it is
    // also, config is created before autoLauncher, so there should be a config always
  }
}

export let autoLauncher!:AutoLauncher

export async function initAutoLauncher() {
  try {
    // setup autoLauncher
    const osType = await tauri.os.type()
    invoker.infoLogger("OS TYPE: " + osType)
    const appPath = await tauri.invoke("get_this_binary") as string // this is not the same as appDir: appPath -> appDir
    invoker.infoLogger("get_this_binary : " + appPath)
    let osAutoLauncher
    if (osType === "Darwin") {
      osAutoLauncher = new MacOSAutoLauncher({ appName, appPath })
    } else if (osType === "Windows_NT") {
      // From Windows 11 Tests: get_this_binary returns a string with a prefix "\\?\" on C:\Users......". On boot, autostart can't locate "\\?\c:\DIR\subspace-desktop.exe
      const winAppPath = appPath.startsWith("\\\\?\\") ? appPath.replace("\\\\?\\", "") : appPath
      osAutoLauncher = new WindowsAutoLauncher({ appPath: winAppPath, appName })
    } else {
      osAutoLauncher = new LinuxAutoLauncher({ appName, appPath, configDir: await tauri.path.configDir() })
    }

    const initAutoLauncher = new AutoLauncher({ config, osAutoLauncher })
    await initAutoLauncher.init()
    autoLauncher = initAutoLauncher
  } catch (error) {
    invoker.errorLogger(getErrorMessage(error))
  }
}

// setup().catch(console.error)
