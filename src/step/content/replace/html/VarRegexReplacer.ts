import {RegexReplacer} from "../RegexReplacer.js"
import {StringContextHandler} from "./StringContextHandler.js"
import {SsgContext} from "../../../../SsgContext.js"

export class VarRegexReplacer<V = any, C extends SsgContext = SsgContext> implements RegexReplacer {

  constructor(
    protected context: C,
    protected varName: string,
    protected defaultHandlers: StringContextHandler<C>[]
  ) {
  }

  replace(_match: string, ..._args: any[]): string {
    let varStr: string | undefined = this.context.getVar(this.varName)
    if (!varStr) {
      this.defaultHandlers.some(handle => !varStr && (varStr = handle(this.context)))
    }
    return varStr || ""
  }
}
