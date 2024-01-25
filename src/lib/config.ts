import { LocalStorage } from "quasar"
import { reloadHistory, reloadTrpc } from "src/lib/trpc"

export const activeChain = "telos"
type Configs = "telos" | "telosTest"
export const defaultRelayer:Record<Configs, string> = {
  telos: "https://relayer.boid.com",
  telosTest: "https://testnet.relayer.boid.com"
}
export const defaultHistory:Record<Configs, string> = {
  telos: "https://history.boid.com",
  telosTest: "https://testnet.history.boid.com"
}

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
    relayer: getActiveRelayer("telosTest")
  },
  telos: {
    contracts: {
      token: "token.boid",
      system: "boid"
    },
    linkData: {
      chainId: "4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11",
      nodeUrl: "https://mainnet.telos.net",
      appName: "boid-web"
    },
    tokenSymbol: "4,BOID",
    explorer: "https://explorer.telos.net",
    relayer: getActiveRelayer("telos")
  }
}

export default configs[activeChain]

export function setRelayer(relayer:string, chainName:Configs = activeChain) {
  LocalStorage.set("relayer-" + chainName, relayer)
  reloadTrpc()
}
export function getActiveHistory(chainName:Configs = activeChain) {
  const saved = LocalStorage.getItem("history-" + activeChain)
  if (!saved) return defaultHistory[chainName]
  else return saved as string
}
export function setHistory(history:string) {
  LocalStorage.set("history-" + activeChain, history)
  reloadHistory()
}
export function getActiveRelayer(chainName:Configs = activeChain) {
  const saved = LocalStorage.getItem("relayer-" + chainName)
  if (!saved) return defaultRelayer[chainName]
  else return saved as string
}
