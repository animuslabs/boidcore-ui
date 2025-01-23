import { LocalStorage } from "quasar"
import { reloadHistory, reloadTrpc } from "src/lib/trpc"

export const activeChain = "telos"
type Configs = "telos" | "telosTest"
export const defaultRelayer:Record<Configs, string> = {
  telos: "https://relay.boid.animus.is",
  telosTest: "https://testnet.relayer.boid.io"
}
export const defaultHistory:Record<Configs, string> = {
  telos: "https://history.boid.animus.is",
  telosTest: "https://testnet.history.boid.io"
}
export const defaultIpfs:Record<Configs, string> = {
  telos: "https://ipfs.pintastic.link",
  telosTest: "https://ipfs.pintastic.link"
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
  relayers:string[],
  history:string[],
  chainRPCs:string[],
  ipfs:string[],
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
      appName: "BoidHub"
    },
    tokenSymbol: "4,BOID",
    explorer: "https://explorer-test.telos.net",
    relayer: getActiveRelayer("telosTest"),
    relayers: ["https://testnet.relayer.boid.com"],
    history: ["https://testnet.history.boid.com"],
    chainRPCs: ["https://testnet.telos.net", "https://telos-testnet.eosphere.io", "https://test.telos.eosusa.io"],
    ipfs: ["https://ipfs.boid.com", "https://ipfs.pintastic.link", "https://ipfs.io"]
  },
  telos: {
    contracts: {
      token: "token.boid",
      system: "boid"
    },
    linkData: {
      chainId: "4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11",
      nodeUrl: "https://mainnet.telos.net",
      appName: "BoidHub"
    },
    tokenSymbol: "4,BOID",
    explorer: "https://explorer.telos.net",
    relayer: getActiveRelayer("telos"),
    relayers: ["https://relayer.boid.io", "https://relay.boid.animus.is"],
    history: ["https://history.boid.io", "https://history.boid.animus.is"],
    chainRPCs: ["https://mainnet.telos.net", "https://telos.api.animus.is", "https://telos.caleos.io", "http://telos.greymass.com", "http://telos.eosusa.io", "https://telos.api.eosnation.io"],
    ipfs: ["https://ipfs.boid.com", "https://ipfs.pintastic.link", "https://ipfs.io"]
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
export function getActiveIpfs(chainName:Configs = activeChain) {
  const saved = LocalStorage.getItem("ipfs-" + chainName)
  if (!saved) return defaultIpfs[chainName]
  else return saved as string
}
export function setIpfs(ipfsUrl:string) {
  LocalStorage.set("ipfs-" + activeChain, ipfsUrl)
  reloadHistory()
}
