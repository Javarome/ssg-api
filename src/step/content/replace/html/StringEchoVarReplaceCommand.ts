import { RegexReplaceCommand } from "../RegexReplaceCommand.js"
import { RegexReplacer } from "../RegexReplacer.js"
import { VarRegexReplacer } from "./VarRegexReplacer.js"
import { StringContextHandler } from "./StringContextHandler.js"
import { SsgContext } from "../../../../SsgContext.js"

/**
 * Replaces ${varName} strings by the variable value.
 *
 * @see Context.setVar(varName, value)
 */
export class StringEchoVarReplaceCommand<V = any, C extends SsgContext = SsgContext<V>> extends RegexReplaceCommand<V, C> {

  constructor(protected varName = VarRegexReplacer.REGEXP_DEFAULT,
              protected defaultHandlers: StringContextHandler[] = []) {
    super(new RegExp(`\\$\{${varName}\}`, "gs"))
  }

  protected async createReplacer(context: SsgContext<V>): Promise<RegexReplacer> {
    return new VarRegexReplacer(context, this.varName, this.defaultHandlers)
  }
}
