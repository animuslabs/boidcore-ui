import { z } from "zod"
import { createTypeAlias, zodToTs } from "zod-to-ts"

// export const TeamMetaSchema = z.object({
//   links: z.object({
//     link: z.string(),
//     telegram: z.string().optional(),
//     discord: z.string().optional(),
//     wechat: z.string().optional(),
//     element: z.string().optional(),
//     facebook: z.string().optional(),
//     website: z.string().optional(),
//     blog: z.string().optional(),
//     medium: z.string().optional(),
//     atomichub: z.string().optional(),
//     twitter: z.string().optional()
//   })
// })

// const { node } = zodToTs(TeamMetaSchema, "TeamMeta")
// const TeamMetaAlias = createTypeAlias(node, "TeamMeta")
// const meta:InstanceType< typeof TeamMetaAlias> = {

// }

export class TeamMeta {
  links:[string, string][] = []
  media:[string, string][] = []
  text:[string, string][] = []
  extra?:[string, string][] = []
}

export class AccountMeta {
  links:[string, string][] = []
  media:[string, string][] = []
  text:[string, string][] = []
  extra?:[string, string][] = []
}
