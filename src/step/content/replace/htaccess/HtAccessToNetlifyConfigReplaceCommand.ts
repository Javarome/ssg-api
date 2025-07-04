import { HtAccessReplaceCommand } from "./HtAccessReplaceCommand.js"


export class HtAccessToNetlifyConfigReplaceCommand extends HtAccessReplaceCommand {

  constructor(protected host: string) {
    super()
  }

  protected handleDirectoryIndex(args: string[], _result: string[]): void {
  }

  protected handleHeader(action: string, header: string, value: string): string {
    return `[[headers]]
  for = "/*"
  [headers.values]
    ${header} = ${value}

`
  }

  protected handleRedirect(from: string, to: string): string {
    let path = to.substring(this.host.length)
    const trailingFrom = from.endsWith("/")
    if (trailingFrom || !from.endsWith(".html")) {
      from += (trailingFrom ? "" : "/") + "*"
      const trailingTo = path.endsWith("/")
      path += (trailingTo ? "" : "/") + ":splat"
    }
    return `[[redirects]]
  from = "${from}"
  to = "/${path}"

`
  }
}
