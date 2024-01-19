import { NameType } from "anchor-link"
import { getAccountInfo } from "./queries"

export async function validateAcct(accountName:NameType):Promise<boolean | string> {
  const account = await getAccountInfo(accountName)
  if (account) return true
  else return "invalid account"
}
