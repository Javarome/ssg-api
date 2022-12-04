import {RegexReplacer} from "./RegexReplacer"
import {ReplaceCommand} from "./ReplaceCommand"
import {SsgFile} from "../../../util/file/SsgFile"
import {SsgContext} from "../../../SsgContext"

/**
 * A command that performs replacements using a Regular Expression.
 */
export abstract class RegexReplaceCommand<V = any, C extends SsgContext = SsgContext<V>> implements ReplaceCommand<C> {

  protected constructor(protected regex: RegExp) {
  }

  /**
   * Perform the replacements on context.inputFile until it is no longer modified by them.
   *
   * @param context
   */
  async execute(context: C): Promise<SsgFile> {
    const fileInfo = context.inputFile
    let contents = fileInfo.contents
    let result = contents
    const replacer = await this.createReplacer(context)
    const replaceFunc = replacer.replace.bind(replacer)
    do {
      contents = result
      result = contents.replace(this.regex, replaceFunc)
    } while (result != contents)
    fileInfo.contents = result
    return fileInfo
  }

  /**
   * Create the replacer for a given context.
   *
   * @param context
   * @protected
   */
  protected abstract createReplacer(context: C): Promise<RegexReplacer>
}
