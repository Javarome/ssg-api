import { HtAccessReplaceCommand } from "./HtAccessReplaceCommand.js"


export class HtAccessToNetlifyConfigReplaceCommand extends HtAccessReplaceCommand {

  /** @param preambleFile The invariable trunk of the `netlify.toml` this produces — see
   *   HtAccessReplaceCommand for what belongs in it and why it is a file of its own. */
  constructor(protected host: string, preambleFile?: string) {
    super(preambleFile)
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
