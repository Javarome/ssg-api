import {ReplacerFactory} from "../../ReplacerFactory"
import {DomReplaceCommand} from "../../DomReplaceCommand"
import {DomReplacer} from "../../DomReplacer"
import {HtmlSsgContext} from "../../../../../HtmlSsgContext"

/**
 * Command to replace HTML tags by name.
 */
export class HtmlTagReplaceCommand<T extends HTMLElement = HTMLElement> extends DomReplaceCommand<T> {

  constructor(protected tagName: string, protected replacerFactory: ReplacerFactory<DomReplacer<T>>) {
    super(tagName)
  }

  protected createReplacer(context: HtmlSsgContext): Promise<DomReplacer<T>> {
    return this.replacerFactory.create(context)
  }
}
