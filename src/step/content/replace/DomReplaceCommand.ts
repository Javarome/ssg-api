import {ReplaceCommand} from "./ReplaceCommand"
import {SsgFile} from "../../../util/file/SsgFile"
import {HtmlSsgContext} from "../../../HtmlSsgContext"
import {DomReplacer} from "./DomReplacer"

export abstract class DomReplaceCommand<T extends HTMLElement = HTMLElement, C extends HtmlSsgContext = HtmlSsgContext> implements ReplaceCommand<C> {

  constructor(protected selector: string) {
  }

  async execute(context: C): Promise<SsgFile> {
    const inputFile = context.inputFile
    let contents = inputFile.contents
    let result = contents
    const replacer = await this.createReplacer(context)
    do {
      contents = result
      const doc = inputFile.document.documentElement
      const elements = doc.querySelectorAll<T>(this.selector)
      if (elements.length > 0) {
        for (const element of elements) {
          const replaced = await replacer.replace(element)
          element.replaceWith(replaced)
        }
        result = inputFile.serialize()
      }
    } while (result != contents)
    inputFile.contents = result
    return inputFile
  }

  /**
   * Creates a replacer in a given context.
   *
   * @param context
   * @protected
   */
  protected abstract createReplacer(context: C): Promise<DomReplacer<T>>
}
