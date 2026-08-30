import { HtAccessReplaceCommand } from "./HtAccessReplaceCommand.js"

export class HtAccessToNetlifyRedirectsReplaceCommand extends HtAccessReplaceCommand {

  constructor(protected host: string, preambleFile?: string) {
    super(preambleFile)
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

  /**
   * DROPPED, exactly as the TOML writer drops it — and it has to be, because the obvious
   * translation is a site-destroying one.
   *
   * `DirectoryIndex index_fr.html index.html` says "when a directory is asked for, serve one of
   * these from inside it". Written as `/* index_fr.html` it says something else entirely: in
   * Netlify's format a leading `/*` is a catch-all over the WHOLE SITE, so every URL on it would
   * answer with that one page. That is what this used to emit.
   *
   * Nothing is lost by saying nothing. Netlify already serves a directory's own index.html without
   * being asked, and the language preference this directive also carried is not something the
   * redirect format can express at all — which is why the TOML writer has always ignored it, and
   * why the site running on that writer never missed it.
   */
  protected handleDirectoryIndex(_args: string[], _result: string[]): void {
  }
}
