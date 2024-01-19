import * as tauri from "@tauri-apps/api/tauri"

import { ConfigType } from "./config"
import { getErrorMessage } from "../util"
import { Notify } from "quasar"

export class TauriInvoker {
  private invoke:typeof tauri.invoke

  /**
   * Create TauriInvoker instance
   * @param tauri.invoke - tauri method to send messages to backend
   */
  public constructor(invoke:typeof tauri.invoke) {
    this.invoke = invoke
  }

  public async writeConfig(config:ConfigType):Promise<void> {
    return this.invoke("write_config", {
      content: JSON.stringify(config, null, 2)
    })
  }

  public async readConfig():Promise<string> {
    return this.invoke("read_config")
  }

  public async removeConfig():Promise<void> {
    return this.invoke("remove_config")
  }

  public async removeDir(path:string):Promise<void> {
    return this.invoke("remove_dir", { path })
  }

  public async createDir(path:string):Promise<void> {
    return this.invoke("create_dir", { path })
  }

  public async createLinuxAutoLaunchFile(hidden:string):Promise<void> {
    return this.invoke("create_linux_auto_launch_file", { hidden })
  }

  public async linuxAutoLaunchFileExist():Promise<boolean> {
    return this.invoke("linux_auto_launch_file_exist")
  }

  public async removeLinuxAutoLaunchFile():Promise<void> {
    return this.invoke("remove_linux_auto_launch_file")
  }

  /**
   * Get entry count in the given directory
   * @param {string} path - directory location
   * @returns {number} how many entries are there in the directory, -1 means directory does not exist
   */
  public async entryCountDirectory(path:string):Promise<number> {
    return this.invoke("entry_count_directory", { path })
  }

  /**
   * Check if directory exists, utilizing method above
   * @param {string} path - directory location
   * @returns {boolean} true for directory exist
   */
  public async isDirExist(path:string):Promise<boolean> {
    return (await this.invoke("entry_count_directory", { path }) as number) !== -1
  }

  /**
   * Regular logging
   * @param {unknown} info - data to log
   */
  public async infoLogger(info:unknown):Promise<void> {
    const message = getErrorMessage(info)
    return this.invoke("frontend_info_logger", { message })
  }

  /**
   * Error logging
   * @param {unknown} error - error to log
   */
  public async errorLogger(error:unknown, display = true):Promise<void> {
    const message = getErrorMessage(error)
    this.invoke("frontend_error_logger", { message })
    if (display) Notify.create({ message, actions: [{ icon: "info_circle", onClick: this.openLogDir }] })
  }

  /**
   * Get log file location
   * @returns {string} path - logs location
   */
  public async openLogDir():Promise<string> {
    return this.invoke("open_log_dir")
  }
}
export const invoker = new TauriInvoker(tauri.invoke)
