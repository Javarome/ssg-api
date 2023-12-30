import {ReplacerFactory} from "../../ReplacerFactory.js"
import {DomReplaceCommand} from "../../DomReplaceCommand.js"
import {DomReplacer} from "../../DomReplacer.js"
import {HtmlSsgContext} from "../../../../../HtmlSsgContext.js"

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
