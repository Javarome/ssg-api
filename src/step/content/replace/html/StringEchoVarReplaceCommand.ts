import {RegexReplaceCommand} from "../RegexReplaceCommand"
import {RegexReplacer} from "../RegexReplacer"
import {VarRegexReplacer} from "./VarRegexReplacer"
import {StringContextHandler} from "./StringContextHandler"
import {SsgContext} from "../../../../SsgContext"

export class StringEchoVarReplaceCommand<V = any, C extends SsgContext = SsgContext<V>> extends RegexReplaceCommand<V, C> {

  constructor(protected varName: string, protected defaultHandlers: StringContextHandler[] = []) {
    super(new RegExp(`\\$\{${String(varName)}\}`, "gs"))
  }

  protected async createReplacer(context: SsgContext<V>): Promise<RegexReplacer> {
    return new VarRegexReplacer(context, this.varName, this.defaultHandlers)
  }
}
