import { ReplaceCommand } from "../ReplaceCommand.js"
import { SsgContext } from "../../../../SsgContext.js"

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
}

export abstract class HtAccessReplaceCommand implements ReplaceCommand<SsgContext> {

  async execute(context: SsgContext): Promise<void> {
    const inputFileInfo = context.file
    const contents = inputFileInfo.contents as string
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
        }
        outLines.push(...commandOutLines)
      }
    }
    context.file.contents = outLines.join("\n")
  }

  protected abstract handleDirectoryIndex(args: string[], result: string[]): void

  protected abstract handleRedirect(from: string, to: string): string

  async contentStepEnd() {
    // NOP
  }
}
