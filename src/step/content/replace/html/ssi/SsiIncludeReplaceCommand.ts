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
      replace: (_match: string, ...args: any[]): string => {
        let currentDir = process.cwd()
        const toInclude = args[1]
        if (!toInclude.startsWith("/")) {
          const currentFile = context.file
          if (currentFile) {
            const currentFileName = currentFile.name
            const lastSlash = currentFileName.lastIndexOf("/")
            if (lastSlash) {
              currentDir = path.join(process.cwd(), currentFileName.substring(0, lastSlash))
            }
          }
        }
        const fileName = path.join(currentDir, toInclude)
        const file = this.fetchFile(fileName)
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

  protected fetchFile(fileName: string): FileContents {
    return FileContents.read(fileName)
  }
}
