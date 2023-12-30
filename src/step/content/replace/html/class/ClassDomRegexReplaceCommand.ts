import {RegexReplaceCommand} from "../../RegexReplaceCommand.js"
import {ReplacerFactory} from "../../ReplacerFactory.js"
import {RegexReplacer} from "../../RegexReplacer.js"
import {SsgContext} from "../../../../../SsgContext.js"

/**
 * @deprecated Can't work tags with regexes. Use ClassReplaceCommand
 */
export class ClassDomRegexReplaceCommand extends RegexReplaceCommand {

  constructor(protected className: string, protected replacerFactory: ReplacerFactory<RegexReplacer>) {
    super(new RegExp(`<[A-z\-]+?\\s+class="${className}">\\s*(.+?)\\s*<\/[A-z\-]+?>`, "gm"))
  }

  protected createReplacer(context: SsgContext): Promise<RegexReplacer> {
    return this.replacerFactory.create(context)
  }
}
