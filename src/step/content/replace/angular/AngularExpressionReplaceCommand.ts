import { RegexReplacer } from "../RegexReplacer.js"
import { RegexReplaceCommand } from "../RegexReplaceCommand.js"
import { HtmlSsgContext } from "../../../../HtmlSsgContext.js"

export class AngularExpressionReplaceCommand extends RegexReplaceCommand<HtmlSsgContext> {

  static readonly symbolToCurrency: { [key: string]: string } = {
    "$": "USD",
    "millions $": "USD",
    "USD$": "USD",
    "€": "EUR"
  }

  constructor() {
    super(new RegExp(`{{\\s*(.*?)(?:\\s*\\|\\s*(.*?))?\\s*}}`, "gm"))
  }

  protected async createReplacer(context: HtmlSsgContext): Promise<RegexReplacer> {
    return {
      replace(_substring: string, ...args: any[]): string {
        const varName = args[0]
        let replacement = context.getVar(varName)
        const filter = args[1]
        if (filter) {
          const filterElements = filter.split(":")
          switch (filterElements[0]) {
            case "number": {
              const num = Number.parseInt(replacement || varName, 10)
              replacement = new Intl.NumberFormat(context.locale).format(num)
            }
              break
            case "currency": {
              const price = Number.parseInt(replacement || varName, 10)
              const symbolFactor = filterElements[1].substring(1, filterElements[1].length - 1).split(" ")
              const notation = symbolFactor.length > 1 ? "compact" : "standard"
              const symbol = symbolFactor[symbolFactor.length - 1]
              const currency = AngularExpressionReplaceCommand.symbolToCurrency[symbol]
              replacement = new Intl.NumberFormat(context.locale, {style: "currency", currency, notation}).format(price)
            }
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
