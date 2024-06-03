import { RegexReplacer } from "../RegexReplacer.js"
import { StringContextHandler } from "./StringContextHandler.js"
import { SsgContext } from "../../../../SsgContext.js"

export class VarRegexReplacer<C extends SsgContext = SsgContext> implements RegexReplacer {

  constructor(protected context: C, protected defaultHandlers: StringContextHandler<C>[]) {
  }

  replace(_match: string, ...args: any[]): string {
    let varStr: string | undefined = this.context.getVar(args[0])
    if (!varStr) {
      this.defaultHandlers.some(handle => !varStr && (varStr = handle(this.context)))
    }
    return varStr || ""
  }
}
