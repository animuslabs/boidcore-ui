import { createTRPCProxyClient, httpLink } from "@trpc/client"
import { getActiveHistory, getActiveRelayer } from "src/lib/config"
import { AppRouter } from "src/lib/types/relayer"
import HRouter from "src/lib/types/history"

export let trpc = setTrpc()
export let history = setHistory()

function setTrpc() {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: getActiveRelayer()
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
  trpc = setTrpc()
}
export function reloadHistory() {
  history = setHistory()
}
