<template lang="pug">
q-page
  .centered
    h1 Desktop Home
  .centered.q-ma-lg
    q-btn(label="launch on start" @click="autoLauncher.enable()")
    q-btn(label="disable launch on start" @click="autoLauncher.disable()")
  .centered.q-ma-lg
    h3 do
  .centered
    q-btn( label="start" @click="fah.do.start()")
    q-btn( label="setalways" @click="fah.do.alwaysOn(0)")
    q-btn( label="onidle" @click="fah.do.onIdle(0)")
    q-btn( label="bat" @click="fah.do.setOption('pause_on_battery','false')")
    q-btn( label="bat2" @click="fah.do.setOption('pause_on_battery','true')")
    q-btn( label="bat3" @click="fah.do.setOption('stop_on_battery','false')")
    q-btn( label="team" @click="fah.do.setOption('team','999')")
    q-btn( label="kill" @click="fah.do.kill()")
  //-   //- q-btn( label="powerhigh" @click="fah.do.onIdle(0)")
  //- .centered.q-ma-md
  //-   q-btn(v-for="act in fah.do" :label="act.name" @click="act()")
  .centered.q-ma-lg
    h3 get
  .centered.q-ma-md
    q-btn(v-for="act in fah.get" :label="act.name" @click="act(1)")
    //- q-btn(label="fah_install" @click="fah.do.install()" )
    //- q-btn(label="fah_start" @click="fah.do.start()" )
    //- q-btn(label="fah_stop" @click="fah.do.stop()" )
    //- q-btn(label="get_queue_info" @click="fah.get.queueInfo()" )
    //- q-btn(label="help" @click="fah.get.help()" )
    //- q-btn(label="init_client" @click="fah.do.initClient()" )
    //- q-btn(label="init_client" @click="fah.do.initClient()" )
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { invoke, InvokeArgs } from "@tauri-apps/api/tauri"
import { listen } from "@tauri-apps/api/event"
import config from "src/lib/desktop/config"
import { autoLauncher } from "src/lib/desktop/autoLauncher"
import { tauri } from "@tauri-apps/api"
import { fah } from "src/lib/desktop/fah"

window.addEventListener("show", (event:any) => {
  console.log("event emitted!", event)
})

export default defineComponent({
  setup() {
    return {
      autoLauncher, fah
    }
  },
  data() {
    return {

    }
  },
  async mounted() {
    const visible = await listen<string>("show", (event) => {
      console.log(`Got visible in window ${event.windowLabel}, payload: ${JSON.stringify(event)}`)
    })
    // const unlisten2 = await listen<string>("tauri://move", (event) => {
    //   console.log(`Got move in window ${event.windowLabel}, payload: ${event.payload}`)
    // })
    // const unlisten3 = await listen<string>("tauri://resize", (event) => {
    //   console.log(`Got resize in window ${event.windowLabel}, payload: ${event.payload}`)
    // })
    // const unlisten4 = await listen<string>("tauri://focus", (event) => {
    //   console.log(`Got focus in window ${event.windowLabel}, payload: ${event.payload}`)
    // })
  },
  unmounted() {
    // unlisten()
  },
  methods: {
    // async fah(exec:string, params?:Record<string, any>) {
    // fah.
    // const result = await tauri.invoke("fah_" + exec, params).catch(console.error)
    // try {
    //   if (result) console.log(JSON.parse(result as any))
    //   else console.log("finished", exec)
    // } catch (error) {
    //   console.log(error)

    //   console.log(result)
    // }
    // },
    async fahInstall() {
      const result = await tauri.invoke("fah", { exec: "install" }).catch(console.error)
      console.log(result)
    },
    async fahStart() {
      const result = await tauri.invoke("fah", { exec: "start" }).catch(console.error)
      console.log(result)
    },
    async sendMsg() {
      const response = await invoke("greet", { name: "test" })
      console.log(response)
    }
  }
})
</script>
