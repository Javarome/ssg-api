import {RegexReplaceCommand} from "../../RegexReplaceCommand"
import {RegexReplaceCallback, RegexReplacer} from "../../RegexReplacer"
import {SsgContext} from "../../../../../SsgContext"

/**
 * A Regex replace command that looks for SSI variable settings
 * (`<!--#set var="someVar" value="someValue"-->)
 */
export class SsiSetVarReplaceCommand extends RegexReplaceCommand {

  protected replacer: RegexReplacer

  /**
   *
   * @param varName The SSI variale to look for.
   * @param ssiVarReplacer The replacer that will provide the replacement string.
   */
  constructor(varName: string, ssiVarReplacer: RegexReplaceCallback) {
    super(new RegExp(`<!--\\s*#set\\s+var="${varName}"\\s+value="(.+?)"\\s*-->`, "gs"))
    this.replacer = {replace: ssiVarReplacer}
  }

  protected async createReplacer(context: SsgContext): Promise<RegexReplacer> {
    return this.replacer
  }
}
