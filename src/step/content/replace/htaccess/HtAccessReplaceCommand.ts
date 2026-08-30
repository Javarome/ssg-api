import { ReplaceCommand } from "../ReplaceCommand.js"
import { SsgContext } from "../../../../SsgContext.js"
import { readFile } from "fs/promises"

enum HtAccessCommands {
  Options = "Options",
  AddOutputFilterByType = "AddOutputFilterByType",
  AddType = "AddType",
  AddHandler = "AddHandler",
  IndexIgnore = "IndexIgnore",
  HeaderName = "HeaderName",
  IndexOptions = "IndexOptions",
  DirectoryIndex = "DirectoryIndex",
  Redirect = "Redirect",
  ErrorDocument = "ErrorDocument",
  Header = "Header",
}

export abstract class HtAccessReplaceCommand implements ReplaceCommand<SsgContext> {

  /**
   * @param preambleFile A file whose contents are emitted BEFORE everything generated from the
   *   `.htaccess` — the invariable trunk of the output. That is where a host's configuration keeps
   *   what Apache's own directives cannot express: a redirect carrying its own status or `force`, a
   *   redirect to an absolute URL on another domain, a header scoped to anything narrower than the
   *   whole site, a build or plugin section — and, in general, whatever simply is not a redirect.
   *
   *   Kept as a SEPARATE SOURCE FILE rather than as something read back out of the previous output,
   *   and that is the whole of the design. An output completed in place is an output that has to be
   *   read before it is written, which makes every build depend on the state its own last run left
   *   behind: the file drifts, and one corrupted run poisons every run after it. With a preamble the
   *   output is wholly derived — trunk plus generated, rewritten entire, every time — and each half
   *   has exactly one place it can be edited.
   *
   *   Naming one that does not exist THROWS. Quietly dropping the trunk is the failure this exists
   *   to prevent, and it is the failure that already happened: what this replaces looked as though
   *   it preserved what was there and could never do so, so a site's hand-written redirects and its
   *   CORS headers went missing twice with nothing anywhere to show for it.
   */
  protected constructor(protected readonly preambleFile?: string) {
  }

  async execute(context: SsgContext): Promise<void> {
    const inputFile = context.file
    const contents = inputFile.contents as string
    const lines = contents.split("\n").map(line => line.trim())
    let outLines = []
    for (const line of lines) {
      const args = line.split(" ")
      const command = args[0] as HtAccessCommands
      if (command) {
        let commandOutLines: string[] = []
        switch (command) {
          case HtAccessCommands.DirectoryIndex:
            this.handleDirectoryIndex(args, commandOutLines)
            break
          case HtAccessCommands.Redirect:
            commandOutLines.push(this.handleRedirect(args[1], args[2]))
            break
          case HtAccessCommands.Header:
            commandOutLines.push(this.handleHeader(args[1], args[2], args[3]))
            break
        }
        outLines.push(...commandOutLines)
      }
    }
    context.file.contents = (await this.preamble()) + outLines.join("\n")
  }

  /**
   * The trunk, with a line saying where it stops.
   *
   * The line is not decoration. Whoever opens the OUTPUT has to be able to see at a glance which
   * half of it is theirs and which half the next build will overwrite — because the way this went
   * wrong before was that nobody could tell, so the trunk was edited in the generated file and
   * disappeared without anything failing.
   */
  private async preamble(): Promise<string> {
    if (!this.preambleFile) return ""
    const trunk = await readFile(this.preambleFile, "utf-8")
    return (trunk.endsWith("\n") ? trunk : trunk + "\n") + HtAccessReplaceCommand.GENERATED_BANNER
  }

  private static readonly GENERATED_BANNER = `
# Everything below this line is generated from .htaccess on every build. Change it there — or, for
# what .htaccess cannot say, in the preamble above. Editing it HERE will not survive the next build.

`

  protected abstract handleDirectoryIndex(args: string[], result: string[]): void

  protected abstract handleRedirect(from: string, to: string): string

  protected abstract handleHeader(action: string, header: string, value: string): string

  async contentStepEnd() {
    // NOP
  }
}
