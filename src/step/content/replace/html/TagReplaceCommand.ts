import {ReplacerFactory} from "../ReplacerFactory"
import {DomReplaceCommand} from "../DomReplaceCommand"
import {DomReplacer} from "../DomReplacer"
import {HtmlSsgContext} from "../../../../HtmlSsgContext"

/**
 * A replacer that looks for HTML tags.
 */
export class TagDomReplaceCommand<T extends HTMLElement = HTMLElement> extends DomReplaceCommand<T> {

  constructor(protected tagName: string, protected replacerFactory: ReplacerFactory<DomReplacer<T>>) {
    super(tagName)
  }

  protected createReplacer(context: HtmlSsgContext): Promise<DomReplacer<T>> {
    return this.replacerFactory.create(context)
  }
}
