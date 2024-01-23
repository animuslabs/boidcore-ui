import { createTRPCProxyClient, httpLink } from "@trpc/client"
import { getActiveHistory, getActiveRelayer, activeChain } from "src/lib/config"
import { AppRouter } from "src/lib/types/relayer"
import HRouter from "src/lib/types/history"

export let trpc:ReturnType<typeof createTRPCProxyClient>
export let history:ReturnType<typeof createTRPCProxyClient>

function setTrpc() {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: getActiveRelayer(activeChain)
      })
    ]
  })
}

function setHistory() {
  return createTRPCProxyClient<HRouter.AppRouter>({
    links: [
      httpLink({
        url: getActiveHistory()
      })
    ]
  })
}
export function reloadTrpc() {
  trpc = setTrpc() as any
}
export function reloadHistory() {
  history = setHistory() as any
}

export function initTRPC() {
  trpc = setTrpc() as any
  history = setHistory() as any
}
