import { invoker, TauriInvoker } from "./invoker"
import { toFixed, getErrorMessage } from "../util"
import { z } from "zod"
import * as tauri from "@tauri-apps/api"
import { reactive, ref } from "vue"
export const appName:string = process.env.APP_NAME || "boid-desktop"

const configSchema = z.object({
  version: z.number(),
  launchOnBoot: z.boolean(),
  fahSettings: z.object(
    {
      enabled: z.boolean()
    })
})

export type ConfigType = z.infer<typeof configSchema>

const defaultConfig:ConfigType = {
  version: 1,
  launchOnBoot: true,
  fahSettings: {
    enabled: false
  }
}

type ConfigUpdate = Partial<ConfigType>
interface FilesParams {
  configDir:string;
  appName:string;
  invoker:typeof invoker;
}
class Config {
  private configPath:string
  private invoker:TauriInvoker

  constructor({ configDir, appName, invoker }:FilesParams) {
    this.configPath = `${configDir}${appName}`
    this.invoker = invoker
  }

  public async init():Promise<void> {
    try {
      await this.invoker.readConfig()
      const valid = await this.validate()
      if (!valid) await this.write(defaultConfig)
    } catch {
      // means there was no config file
      await this.invoker.createDir(this.configPath)
        // ignore error if folder exists otherwise throw error
        .catch((error) => {
          const message = getErrorMessage(error)
          if (message && message.includes("exists")) return
          throw error
        })
      await this.write(defaultConfig)
    }
  }

  public data = ref(defaultConfig)

  public async validate():Promise<boolean> {
    const config = await this.readConfigFile()
    const valid = await configSchema.safeParseAsync(config)
    if (!valid.success)console.error(valid.error)
    return valid.success
  }

  public async remove():Promise<void> {
    return this.invoker.removeConfig()
  }

  public async readConfigFile():Promise<ConfigType> {
    const result = await this.invoker.readConfig()
    const config = JSON.parse(result)
    return config
  }

  private async write(config:ConfigType):Promise<void> {
    await this.invoker.writeConfig(config)
    // await this.readConfigFile()
    return
  }

  public async update(configUpdate:ConfigUpdate):Promise<void> {
    const config = await this.readConfigFile()

    await this.write({
      ...config,
      ...configUpdate
    })
  }
}

// create Config instance and initialize it
const configDir = await tauri.path.configDir()
const config = new Config({ appName, configDir, invoker })

export default config
