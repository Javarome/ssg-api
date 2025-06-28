import { ReplaceCommand } from "../ReplaceCommand.js"
import { SsgContext } from "../../../../SsgContext.js"
import path from "path"

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
    const outputFile = context.outputFile!
    const outputFileName = path.basename(outputFile.name)
    const inputFileName = path.basename(inputFile.name)
    const isSameFile = outputFileName === inputFileName
    const existingOutput = isSameFile ? "" : outputFile.contents
    context.file.contents = existingOutput + outLines.join("\n")
  }

  protected abstract handleDirectoryIndex(args: string[], result: string[]): void

  protected abstract handleRedirect(from: string, to: string): string

  protected abstract handleHeader(action: string, header: string, value: string): string

  async contentStepEnd() {
    // NOP
  }
}
