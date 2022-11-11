import {RegexReplacer} from "../RegexReplacer"
import {StringContextHandler} from "./StringContextHandler"
import {SsgContext, VarProp} from "../../../../SsgContext"

export class VarRegexReplacer<V = any, C extends SsgContext = SsgContext> implements RegexReplacer {

  constructor(
    protected context: C,
    protected varName: VarProp<V>,
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
