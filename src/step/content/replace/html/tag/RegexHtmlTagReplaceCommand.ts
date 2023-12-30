import {RegexReplaceCommand} from "../../RegexReplaceCommand.js"
import {ReplacerFactory} from "../../ReplacerFactory.js"
import {RegexReplacer} from "../../RegexReplacer.js"
import {SsgContext} from "../../../../../SsgContext.js"

/**
 * A command that will replace tag expressions (`<tag-name>content</tag-name>`).
 *
 * @deprecated This cannot be reliable using Regex and will only work for non-nested tags cases. Use a
 * TagReplaceCommand instead.
 */
export class RegexHtmlTagReplaceCommand extends RegexReplaceCommand {
  /**
   * @param tagName The name of the tag to look for ("tag-name" for <tag-name>).
   * @param replacerFactory The delegate to create replacers with the current context.
   */
  constructor(protected tagName: string, protected replacerFactory: ReplacerFactory<RegexReplacer>) {
    super(new RegExp(`<${tagName}(\\s+.*?)?>\\s*(.+?)\\s*</${tagName}>`, "gm"))
  }

  protected createReplacer(context: SsgContext): Promise<RegexReplacer> {
    return this.replacerFactory.create(context)
  }
}
