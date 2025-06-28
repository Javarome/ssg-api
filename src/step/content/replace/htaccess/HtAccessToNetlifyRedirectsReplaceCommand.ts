import { HtAccessReplaceCommand } from "./HtAccessReplaceCommand.js"

export class HtAccessToNetlifyRedirectsReplaceCommand extends HtAccessReplaceCommand {

  constructor(protected host: string) {
    super()
  }

  protected handleHeader(from: string, to: string): string {
    return ""
  }

  protected handleRedirect(from: string, to: string): string {
    let path = to.substring(this.host.length)
    const trailingFrom = from.endsWith("/")
    if (trailingFrom || !from.endsWith(".html")) {
      from += (trailingFrom ? "" : "/") + "*"
      const trailingTo = path.endsWith("/")
      path += (trailingTo ? "" : "/") + ":splat"
    }
    return `${from} /${path}`
  }

  protected handleDirectoryIndex(args: string[], result: string[]): void {
    const files = args.splice(1)
    for (const file of files) {
      result.push(`/* ${file}`)
    }
    //result.push(`/*/ /:splat/${args[1]}`)
  }
}
