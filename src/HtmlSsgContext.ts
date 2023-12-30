import {SsgContext} from "./SsgContext.js"
import {HtmlSsgFile} from './util/index.js'

export interface HtmlSsgContext<V = any> extends SsgContext<V> {

  inputFile: HtmlSsgFile

  outputFile: HtmlSsgFile

  getVar(varName: string): string | undefined

  setVar(varName: string, value: any): void
}
