import {RegexReplacer} from "../RegexReplacer"
import {RegexReplaceCommand} from "../RegexReplaceCommand"
import {HtmlSsgContext} from "../../../../HtmlSsgContext"

export class AngularExpressionReplaceCommand extends RegexReplaceCommand<HtmlSsgContext> {

  constructor() {
    super(new RegExp(`{{\\s*(.*?)(?:\\s*\\|\\s*(.*?))?\\s*}}`, "gm"))
  }

  protected async createReplacer(context: HtmlSsgContext): Promise<RegexReplacer> {
    return {
      replace(substring: string, ...args: any[]): string {
        const varName = args[0]
        let replacement = context.getVar(varName)
        const filter = args[1]
        if (filter) {
          switch (filter) {
            case "number":
              const num = Number.parseInt(replacement || varName, 10)
              replacement = new Intl.NumberFormat(context.locale).format(num)
              break
            default:
              context.warn("Unsupported Angular filter", filter)
          }
        }
        return replacement || ""
      }
    }
  }
}
