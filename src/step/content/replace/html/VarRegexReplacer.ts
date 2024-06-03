import { RegexReplacer } from "../RegexReplacer.js"
import { StringContextHandler } from "./StringContextHandler.js"
import { SsgContext } from "../../../../SsgContext.js"

export class VarRegexReplacer<C extends SsgContext = SsgContext> implements RegexReplacer {
  static readonly REGEXP_DEFAULT = "(.*?)"

  constructor(protected context: C, protected varName = VarRegexReplacer.REGEXP_DEFAULT,
              protected defaultHandlers: StringContextHandler<C>[] = []) {
  }

  replace(_match: string, ...args: any[]): string {
    let varStr: string | undefined = this.context.getVar(
      this.varName === VarRegexReplacer.REGEXP_DEFAULT ? args[0] : this.varName)
    if (!varStr) {
      this.defaultHandlers.some(handle => !varStr && (varStr = handle(this.context)))
    }
    return varStr || ""
  }
}
