import path from "path"
import { RegexReplaceCommand } from "../../RegexReplaceCommand.js"
import { RegexReplacer } from "../../RegexReplacer.js"
import { SsgContext } from "../../../../../SsgContext.js"
import { FileContents } from "@javarome/fileutil"

export interface SsiIncludeReplaceCommandTransformer {
  transform(context: SsgContext, includeFile: FileContents): string | undefined
}

/**
 * Replaces SSI's `<!-- #include virtual="myFileName" -->` by fileName's contents.
 *
 * As any `ReplaceCommand`, it is recursive, that is,
 * any include directives inside the included file will be processed as well.
 */
export class SsiIncludeReplaceCommand extends RegexReplaceCommand {
  /**
   *
   * @param transformers An array of transformers before including it in result.
   */
  constructor(protected transformers: SsiIncludeReplaceCommandTransformer[] = []) {
    super(/<!--\s*#include\s+(file|virtual)="(.+?)"\s*-->/g)
  }

  protected async createReplacer(context: SsgContext): Promise<RegexReplacer> {
    return {
      replace: (_match: string, ...args: string[]): string => {
        const filePath = this.filePath(context, args[1])
        const file = this.fetchFile(filePath)
        let replacement: string = file.contents
        for (const transformer of this.transformers) {
          const transformed = transformer.transform(context, file)
          if (transformed) {
            replacement = transformed
            break
          }
        }
        return replacement
      }
    }
  }

  protected filePath(context: SsgContext, fileNameArg: string): string {
    const currentDir = process.cwd()
    let baseDir = currentDir
    if (!fileNameArg.startsWith("/")) {
      const currentFile = context.file
      if (currentFile) {
        const currentFileName = currentFile.name
        const lastSlash = currentFileName.lastIndexOf("/")
        if (lastSlash) {
          baseDir = path.join(currentDir, currentFileName.substring(0, lastSlash))
        }
      }
    }
    return path.join(baseDir, fileNameArg)
  }

  protected fetchFile(fileName: string): FileContents {
    return FileContents.read(fileName)
  }
}
