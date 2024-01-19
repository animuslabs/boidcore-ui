import { invoke } from "@tauri-apps/api/tauri"
import { Options, SimulationInfo, SlotOptions, SlotQueueInfo } from "src/lib/desktop/types"

async function fahDo<T>(cmd:string, params:any = null):Promise<T> {
  return invoke("fah_" + cmd, params)
}

export const fah = {
  do: {
    cmd(exec:string) {
      return fahDo("cmd", { exec })
    },
    saveConfig() {
      return fahDo("save")
    },
    install() {
      return fahDo("install")
    },
    start() {
      return fahDo("start")
    },
    stop() {
      return fahDo("stop")
    },
    init() {
      return fahDo("init")
    },
    kill() {
      return fahDo("kill")
    },
    uninstall() {
      return fahDo("uninstall")
    },
    alwaysOn(slot:number) {
      return fahDo("always_on", { slot })
    },
    onIdle(slot:number) {
      return fahDo("on_idle", { slot })
    },
    pauseSlot(slot:number) {
      return fahDo("pause_slot", { slot })
    },
    unpauseSlot(slot:number) {
      return fahDo("unpause_slot", { slot })
    },
    deleteSlot(slot:number) {
      return fahDo("delete_slot", { slot })
    },
    initClient() {
      return fahDo("init_client")
    },
    setOption(key:keyof Options, value:string) {
      return fahDo("set_option", { key, value })
    },
    setSlotOption(key:keyof SlotOptions, value:string) {
      return fahDo("set_slot_option", { key, value })
    }
  },
  get: {
    isInstalled() {
      return fahDo<boolean>("is_installed")
    },
    async help() {
      const result = await fahDo<string>("help")
      console.log(result)
      return result
    },
    async options() {
      const result = await fahDo<Options>("get_options")
      console.log(result)
      return result
    },
    async slotOptions(slot:number) {
      const result = await fahDo<SlotOptions>("get_slot_options", { slot })
      console.log(result)
      return result
    },
    isRunning() {
      return fahDo<boolean>("get_is_running")
    },
    numSlots() {
      return fahDo<number>("get_num_slots")
    },
    ppd() {
      return fahDo<number>("get_ppd")
    },
    queueInfo() {
      return fahDo<SlotQueueInfo[]>("get_queue_info")
    },
    simInfo(slot:number) {
      return fahDo<SimulationInfo>("get_sim_info", { slot })
    },
    uptime(slot:number) {
      return fahDo<string>("get_uptime", { slot })
    },
    slotInfo(slot:number) {
      return fahDo("get_slot_info", { slot })
    }
  }

}
