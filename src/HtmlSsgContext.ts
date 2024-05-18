import { SsgContext } from "./SsgContext.js"
import { HtmlSsgFile } from "./util"

export interface HtmlSsgContext<V = any> extends SsgContext<V> {

  file: HtmlSsgFile

  getVar(varName: string): string | undefined

  setVar(varName: string, value: any): void
}
