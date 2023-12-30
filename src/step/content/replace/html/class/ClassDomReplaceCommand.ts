import {ReplacerFactory} from "../../ReplacerFactory.js"
import {DomReplaceCommand} from "../../DomReplaceCommand.js"
import {DomReplacer} from "../../DomReplacer.js"
import {HtmlSsgContext} from "../../../../../HtmlSsgContext.js"

/**
 * A replacer that looks for a class in tags.
 */
export class ClassDomReplaceCommand<T extends HTMLElement = HTMLElement> extends DomReplaceCommand<T> {

  constructor(protected className: string, protected replacerFactory: ReplacerFactory<DomReplacer<T>>) {
    super(`.${className}`)
  }

  protected createReplacer(context: HtmlSsgContext): Promise<DomReplacer<T>> {
    return this.replacerFactory.create(context)
  }
}
