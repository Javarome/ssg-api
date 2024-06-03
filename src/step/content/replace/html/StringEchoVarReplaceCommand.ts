import { RegexReplaceCommand } from "../RegexReplaceCommand.js"
import { RegexReplacer } from "../RegexReplacer.js"
import { VarRegexReplacer } from "./VarRegexReplacer.js"
import { StringContextHandler } from "./StringContextHandler.js"
import { SsgContext } from "../../../../SsgContext.js"

export class StringEchoVarReplaceCommand<V = any, C extends SsgContext = SsgContext<V>> extends RegexReplaceCommand<V, C> {

  constructor(varName = "(.*?)", protected defaultHandlers: StringContextHandler[] = []) {
    super(new RegExp(`\\$\{${varName}\}`, "gs"))
  }

  protected async createReplacer(context: SsgContext<V>): Promise<RegexReplacer> {
    return new VarRegexReplacer(context, this.defaultHandlers)
  }
}
