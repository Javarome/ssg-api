import { SsgContext } from "./SsgContext.js"
import { HtmlFileContents } from "./util"

export interface HtmlSsgContext<V = any> extends SsgContext<V> {

  file: HtmlFileContents

  getVar(varName: string): string | undefined

  setVar(varName: string, value: any): void
}
