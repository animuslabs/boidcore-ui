/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { boot } from "quasar/wrappers"
import { QInput, QBtn, QCard, QRouteTab, QTab, LoadingBar } from "quasar"
import { Component, ComponentPublicInstance } from "vue"

// //ts-ignore
// window.global ||= window

const setDefault = (component:any, key:string, value:any) => {
  const prop = component.props[key]
  switch (typeof prop) {
    case "object":
      prop.default = value
      break
    case "function":
      component.props[key] = {
        type: prop,
        default: value
      }
      break
    case "undefined":
      throw new Error("unknown prop: " + key)
    default:
      throw new Error("unhandled type: " + typeof prop)
  }
}

export default boot(({ app }) => {
  LoadingBar.setDefaults({
    position: "bottom",
    size: "5px"
  })
  // console.log("component defaults")
  setDefault(QCard, "square", false)
  setDefault(QCard, "flat", true)
  setDefault(QCard, "bordered", false)

  setDefault(QInput, "dense", true)
  // setDefault(QInput, "outlined", true)
  setDefault(QInput, "stackLabel", true)
  setDefault(QInput, "square", true)
  setDefault(QInput, "inputStyle", "font-size:25px; text-align:center")
  setDefault(QInput, "noErrorIcon", true)

  // setDefault(QBtn, "flat", true)
  setDefault(QBtn, "unelevated", true)
  setDefault(QBtn, "stretch", true)
  setDefault(QBtn, "ripple", false)

  setDefault(QRouteTab, "ripple", false)
})
