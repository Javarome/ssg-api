import { ReplaceCommand } from "./ReplaceCommand.js"
import { HtmlSsgContext } from "../../../HtmlSsgContext.js"
import { DomReplacer } from "./DomReplacer.js"

export abstract class DomReplaceCommand<T extends HTMLElement = HTMLElement, C extends HtmlSsgContext = HtmlSsgContext> implements ReplaceCommand<C> {

  constructor(protected selector: string) {
  }

  async execute(context: C): Promise<void> {
    const inputFile = context.file
    let contents = inputFile.contents
    let result = contents
    const replacer = await this.createReplacer(context)
    const doc = inputFile.document
    if (!doc) {
      throw Error(inputFile.name + " has is not an HTML file")
    }
    const docEl = doc.documentElement
    do {
      contents = result
      const elements = docEl.querySelectorAll<T>(this.selector)
      if (elements.length > 0) {
        for (const element of elements) {
          const replaced = await replacer.replace(element)
          element.replaceWith(replaced)
        }
        result = inputFile.serialize()
      }
    } while (result != contents)
    context.file.contents = result
    await this.postExecute(context)
  }

  /**
   * Creates a replacer in a given context.
   *
   * @param context
   * @protected
   */
  protected abstract createReplacer(context: C): Promise<DomReplacer<T>>

  /**
   * Executed as last operation of execute()
   * @param context
   * @protected
   */
  protected async postExecute(context: C): Promise<void> {
    // Do nothing by default.
  }

  async contentStepEnd() {
    // NOP
  }
}
