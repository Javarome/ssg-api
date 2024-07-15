import { ReplacerFactory } from "../../ReplacerFactory.js"
import { DomReplaceCommand } from "../../DomReplaceCommand.js"
import { DomReplacer } from "../../DomReplacer.js"
import { HtmlSsgContext } from "../../../../../HtmlSsgContext.js"

/**
 * A replacer that looks for HTML class(es) in tags.
 */
export class ClassDomReplaceCommand<T extends HTMLElement = HTMLElement> extends DomReplaceCommand<T> {
  /**
   *
   * @param replacerFactory The object that creates the replacer when needed.
   * @param classNames The classname(s) to look for.
   */
  constructor(protected replacerFactory: ReplacerFactory<DomReplacer<T>>, ...classNames: string[]) {
    super(classNames.map(className => "." + className).join(","))
  }

  protected createReplacer(context: HtmlSsgContext): Promise<DomReplacer<T>> {
    return this.replacerFactory.create(context)
  }
}
