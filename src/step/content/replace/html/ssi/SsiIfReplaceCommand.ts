import {RegexReplaceCommand} from "../../RegexReplaceCommand.js"
import {RegexReplacer} from "../../RegexReplacer.js"
import {SsgContext} from "../../../../../SsgContext.js"

export class SsiIfReplaceCommand extends RegexReplaceCommand {

  protected readonly replacer = {
    replace: (substring: string, ...args: any[]): string => {
      let condVar = args[0]
      let condValue = args[1]
      let trueContent = args[2]
      let falseContent = args[3]
      return condVar === condValue ? trueContent : falseContent
    }
  }

  constructor() {
    super(/<!--\s*#if\s+expr="(.+?)=(.+?)"\s*-->(.*?)<!--\s*#else\s*-->(.*?)<!--\s*#endif\s*-->/gs)
  }

  protected async createReplacer(context: SsgContext): Promise<RegexReplacer> {
    return this.replacer
  }
}
