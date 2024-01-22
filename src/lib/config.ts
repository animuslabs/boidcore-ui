import { LocalStorage } from "quasar"
import { reloadHistory, reloadTrpc } from "src/lib/trpc"

type Configs = "telos" | "telosTest"
export type Config = {
  contracts:{
    token:string,
    system:string
  },
  tokenSymbol:string,
  linkData:{
    chainId:string
    nodeUrl:string
    appName:string
  },
  explorer:string,
  relayer:string,
  desktopMode?:boolean
}
const configs:Record<Configs, Config> = {
  telosTest: {
    contracts: {
      token: "token.boid",
      system: "boid"
    },
    linkData: {
      chainId: "1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f",
      nodeUrl: "https://testnet.telos.net",
      appName: "boid-web"
    },
    tokenSymbol: "4,BOID",
    explorer: "https://explorer-test.telos.net",
    relayer: getActiveRelayer("telosTest") || "https://testnet.relayer.boid.com"
  },
  telos: {
    contracts: {
      token: "token.boid",
      system: "boid"
    },
    linkData: {
      chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
      nodeUrl: "https://mainnet.telos.net",
      appName: "boid-web"
    },
    tokenSymbol: "4,BOID",
    explorer: "https://explorer.telos.net",
    relayer: getActiveRelayer("telos") || "https://relayer.boid.com"
  }
}

export const activeChain = "telos"
export default configs[activeChain]

export function getActiveRelayer(chainName:string) {
  const saved = LocalStorage.getItem("relayer-" + chainName)
  if (!saved) return false
  else return saved as string
}
export function setRelayer(relayer:string) {
  LocalStorage.set("relayer", relayer)
  reloadTrpc()
}
export function getActiveHistory() {
  const saved = LocalStorage.getItem("history")
  if (!saved) return "https://history.testnet.boid.com"
  else return saved as string
}
export function setHistory(history:string) {
  LocalStorage.set("history", history)
  reloadHistory()
}
