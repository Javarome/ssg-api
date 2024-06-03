import { RegexReplaceCommand } from "../../RegexReplaceCommand.js"
import { RegexReplacer } from "../../RegexReplacer.js"
import { HtmlSsgContext } from "../../../../../HtmlSsgContext.js"
import { StringContextHandler } from "../StringContextHandler.js"
import { VarRegexReplacer } from "../VarRegexReplacer.js"

/**
 * Replaces SSI's <!-- #echo var="someVar" --> by someVar's value.
 *
 * @see Context.setVar(varName, value)
 */
export class SsiEchoVarReplaceCommand<V = any, C extends HtmlSsgContext<V> = HtmlSsgContext<V>> extends RegexReplaceCommand<V, HtmlSsgContext<V>> {

  constructor(protected varName = VarRegexReplacer.REGEXP_DEFAULT,
              protected defaultHandlers: StringContextHandler[] = []) {
    super(new RegExp(`<!--\\s*#echo\\s+var="${varName}"\\s*-->`, "gs"))
  }

  protected async createReplacer(context: C): Promise<RegexReplacer> {
    return new VarRegexReplacer(context, this.varName, this.defaultHandlers)
  }
}
