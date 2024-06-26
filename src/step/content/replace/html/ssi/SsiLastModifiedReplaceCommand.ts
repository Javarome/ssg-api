import { RegexReplaceCommand } from "../../RegexReplaceCommand.js"
import { RegexReplacer } from "../../RegexReplacer.js"
import { SsgContext } from "../../../../../SsgContext.js"

/**
 * Replaces a <!--*#config timefmt="someFormat"--><!--#flastmod virtual="\$DOCUMENT_URI"\s*-->
 * by the datetime of modification of the current file.
 */
export class SsiLastModifiedReplaceCommand extends RegexReplaceCommand {

  constructor(protected options: Intl.DateTimeFormatOptions) {
    super(/<!--\s*#config timefmt="(.*?)"\s*--><!--\s*#flastmod virtual="\$DOCUMENT_URI"\s*-->/gs)
  }

  protected async createReplacer(context: SsgContext): Promise<RegexReplacer> {
    return {
      replace: (substring: string, ...args: any[]): string => {
        const timeFormat = args[0]  // TODO: Support it
        const fileInfo = context.file
        return fileInfo.lastModified.toLocaleDateString(context.locale, this.options)
      }
    }
  }
}
